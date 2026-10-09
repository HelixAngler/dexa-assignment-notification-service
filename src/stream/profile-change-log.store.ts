import { Pool } from 'pg';
import type { ServiceConfig } from '../config';
import { logIdleClientErrors } from '../common/pg.pool-errors';
import type { ProfileChangedEvent } from './profile-changed.event';

/** Write side of the log database the stream consumer owns. */
export interface ProfileChangeLogStore {
  /**
   * Appends one event, ignoring duplicates: the insert conflicts on the
   * unique `event_id` key and does nothing, so a replayed delivery can
   * never produce a second row for the same event.
   */
  upsert(event: ProfileChangedEvent): Promise<void>;
  /** Releases the database pool. */
  close(): Promise<void>;
}

/**
 * Builds a store over the log database identified by `config.databaseUrlLog`.
 *
 * The pool is created eagerly but connects lazily, so constructing a store
 * never touches the network. Password events are stored as the bare fact
 * that a password changed (`after_values = {password_changed: true}`),
 * everything else keeps its already-redacted before/after snapshots.
 */
export function createProfileChangeLogStore(config: ServiceConfig): ProfileChangeLogStore {
  const pool = logIdleClientErrors(
    new Pool({ connectionString: config.databaseUrlLog, max: 4 }),
    'profile change log pool',
  );

  return {
    async upsert(event: ProfileChangedEvent): Promise<void> {
      const beforeValues = event.passwordChanged ? null : (event.before ?? null);
      const afterValues = event.passwordChanged ? { password_changed: true } : (event.after ?? null);

      await pool.query(
        `INSERT INTO profile_change_log
           (id, event_id, employee_id, employee_email, employee_name,
            actor_id, actor_role, changed_fields, before_values, after_values,
            occurred_at, ingested_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
         ON CONFLICT (event_id) DO NOTHING`,
        [
          event.eventId,
          event.subject.id,
          event.subject.email,
          event.subject.name,
          event.actor.id,
          event.actor.role,
          event.changedFields,
          beforeValues === null ? null : JSON.stringify(beforeValues),
          afterValues === null ? null : JSON.stringify(afterValues),
          event.occurredAt,
        ],
      );
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}
