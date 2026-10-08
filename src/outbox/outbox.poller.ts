import type { Pool } from 'pg';
import type { ProfileChangedEvent } from '../stream/profile-changed.event';
import { buildProfileChangedEvent, type OutboxRow } from './change-event.builder';

/** The publishing side of the transactional-outbox drain. */
export interface OutboxPublisher {
  publish(event: ProfileChangedEvent): Promise<void>;
  /** Optional teardown for publishers that hold a connection. */
  disconnect?(): Promise<void>;
}

/** Dependencies of one poller instance. */
export interface OutboxPollerOptions {
  /** Pool over the database that owns the outbox table. */
  pool: Pool;
  publisher: OutboxPublisher;
  /** Rows claimed per sweep; defaults to 500. */
  batchSize?: number;
  /** Delay between automatic sweeps in milliseconds; defaults to 500. */
  sweepIntervalMs?: number;
}

/** What one sweep did, for callers and tests to assert on. */
export interface SweepResult {
  /** Unpublished rows the sweep claimed (locked) at its start. */
  claimed: number;
  /** Rows whose produce succeeded and that were marked published. */
  published: number;
}

const DEFAULT_BATCH_SIZE = 500;
const DEFAULT_SWEEP_INTERVAL_MS = 500;

/** One outbox row as the claim query returns it, joined with its employee. */
interface ClaimedRow {
  id: string;
  employee_id: string;
  actor_id: string;
  actor_role: string;
  changed_fields: string[] | null;
  before_values: Record<string, unknown> | null;
  after_values: Record<string, unknown> | null;
  occurred_at: Date;
  employee_email: string;
  employee_name: string;
}

/**
 * Claims unpublished rows with `FOR UPDATE SKIP LOCKED` so several pollers
 * (or a sweep that overlaps the previous one) never fight over a row:
 * whoever locks it first publishes it, everyone else skips it.
 */
const CLAIM_SQL = `
  SELECT e.id, e.employee_id, e.actor_id, e.actor_role::text AS actor_role,
         e.changed_fields, e.before_values, e.after_values, e.occurred_at,
         emp.email::text AS employee_email, emp.name AS employee_name
  FROM profile_change_events e
  JOIN employees emp ON emp.id = e.employee_id
  WHERE e.published_at IS NULL
  ORDER BY e.occurred_at ASC
  LIMIT $1
  FOR UPDATE OF e SKIP LOCKED
`;

function mapRow(row: ClaimedRow): OutboxRow {
  return {
    id: row.id,
    employeeId: row.employee_id,
    actorId: row.actor_id,
    actorRole: row.actor_role === 'hrd' ? 'hrd' : 'employee',
    changedFields: row.changed_fields ?? [],
    beforeValues: row.before_values,
    afterValues: row.after_values,
    occurredAt: row.occurred_at,
    employeeEmail: row.employee_email,
    employeeName: row.employee_name,
  };
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Drains the transactional outbox into the broker.
 *
 * One sweep runs in a single transaction: it locks a batch of unpublished
 * rows, produces each event, and stamps `published_at` only for rows whose
 * produce succeeded. A failed produce leaves its row untouched — the
 * commit persists the stamps of the successes, the failed rows stay
 * `published_at IS NULL`, and the next sweep picks them up again. If the
 * connection dies after the broker accepted a record but before the
 * commit, the row is retried too and becomes a duplicate on the broker —
 * consumers deduplicate on the event id, so deliveries stay at-least-once
 * without a duplicate ever producing a second log row.
 *
 * The optional interval timer is unref'd so it can never keep a process
 * (or a test run) alive on its own; the application lifecycle decides
 * when to call `start` and always calls `stop` on shutdown.
 */
export class OutboxPoller {
  private timer: NodeJS.Timeout | undefined;
  private inFlight: Promise<void> = Promise.resolve();

  constructor(private readonly options: OutboxPollerOptions) {}

  /** Runs exactly one claim-publish-stamp cycle. */
  async sweepOnce(): Promise<SweepResult> {
    const batchSize = this.options.batchSize ?? DEFAULT_BATCH_SIZE;
    const client = await this.options.pool.connect();
    let claimed = 0;
    let published = 0;
    try {
      await client.query('BEGIN');
      const result = await client.query<ClaimedRow>(CLAIM_SQL, [batchSize]);
      const rows = result.rows;
      claimed = rows.length;

      for (const row of rows) {
        try {
          const event = buildProfileChangedEvent(mapRow(row));
          await this.options.publisher.publish(event);
          await client.query(
            'UPDATE profile_change_events SET published_at = now() WHERE id = $1',
            [row.id],
          );
          published += 1;
        } catch (error) {
          // Row stays unpublished; the next sweep retries it.
          console.warn(`outbox row ${row.id} not published: ${describe(error)}`);
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // The connection is gone; releasing it discards the transaction.
      }
      throw error;
    } finally {
      client.release();
    }
    return { claimed, published };
  }

  /** Starts the periodic sweep; the timer never holds the process open. */
  start(): void {
    if (this.timer !== undefined) {
      return;
    }
    const intervalMs = this.options.sweepIntervalMs ?? DEFAULT_SWEEP_INTERVAL_MS;
    this.timer = setInterval(() => {
      this.inFlight = this.sweepOnce().then(
        () => undefined,
        (error: unknown) => {
          console.error(`outbox sweep failed: ${describe(error)}`);
        },
      );
    }, intervalMs);
    this.timer.unref?.();
  }

  /** Stops the timer and waits for a sweep that is still running. */
  async stop(): Promise<void> {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    await this.inFlight;
  }
}
