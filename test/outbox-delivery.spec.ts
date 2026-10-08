import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { config } from '../src/config';
import { createKafkaOutboxPublisher } from '../src/outbox/kafka.publisher';
import { OutboxPoller, OutboxPublisher } from '../src/outbox/outbox.poller';
import { createKafkaEventStream } from '../src/stream/kafka.event.stream';
import { createProfileChangeLogStore } from '../src/stream/profile-change-log.store';
import {
  LogConsumerDeps,
  ProfileChangeLogConsumer,
  ProfileChangedEventStream,
} from '../src/stream/log.consumer';
import type { ProfileChangedEvent } from '../src/stream/profile-changed.event';
import { loopbackSocketFactory } from './support/loopback.socket-factory';

jest.setTimeout(90_000);

const BROKERS = (process.env.BROKER_BROKERS ?? 'redpanda:9092')
  .split(',')
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

interface EmployeeRow {
  id: string;
  email: string;
  name: string;
}

interface OutboxRow {
  id: string;
  publishedAt: Date | null;
}

interface LogRow {
  event_id: string;
  employee_id: string;
  actor_id: string;
  actor_role: string;
  changed_fields: string[];
  before_values: unknown;
  after_values: unknown;
  occurred_at: Date;
}

function uniqueEmail(): string {
  return `outbox-${randomUUID()}@example.test`;
}

async function createEmployee(pool: Pool): Promise<EmployeeRow> {
  const result = await pool.query<EmployeeRow>(
    `INSERT INTO employees (name, email, "position", phone, role, password_hash)
     VALUES ($1, $2, 'Staff', '+62 811-0000-0000', 'employee', $3)
     RETURNING id, email, name`,
    ['Outbox Probe', uniqueEmail(), 'not-a-real-hash'],
  );
  return result.rows[0];
}

async function insertOutboxRow(
  pool: Pool,
  employeeId: string,
  changedFields: string[],
  beforeValues: Record<string, unknown> | null,
  afterValues: Record<string, unknown> | null,
): Promise<OutboxRow> {
  const result = await pool.query<OutboxRow>(
    `INSERT INTO profile_change_events
       (employee_id, actor_id, actor_role, changed_fields, before_values, after_values, occurred_at)
     VALUES ($1, $1, 'employee', $2::text[], $3::jsonb, $4::jsonb, now())
     RETURNING id, published_at AS "publishedAt"`,
    [
      employeeId,
      changedFields,
      beforeValues === null ? null : JSON.stringify(beforeValues),
      afterValues === null ? null : JSON.stringify(afterValues),
    ],
  );
  return result.rows[0];
}

async function readOutboxRow(pool: Pool, id: string): Promise<OutboxRow> {
  // The column is aliased to the camel-case field name so the typed
  // `publishedAt` assertions compare a real value: without the alias the
  // key stays `published_at` and `toBeNull()` would trip over `undefined`.
  const result = await pool.query<OutboxRow>(
    'SELECT id, published_at AS "publishedAt" FROM profile_change_events WHERE id = $1',
    [id],
  );
  if (result.rowCount !== 1) {
    throw new Error(`outbox row ${id} disappeared`);
  }
  return result.rows[0];
}

async function countLogRows(pool: Pool, eventId: string): Promise<number> {
  const result = await pool.query<{ n: number }>(
    'SELECT count(*)::int AS n FROM profile_change_log WHERE event_id = $1',
    [eventId],
  );
  return result.rows[0].n;
}

async function readLogRow(pool: Pool, eventId: string): Promise<LogRow> {
  const result = await pool.query<LogRow>(
    'SELECT * FROM profile_change_log WHERE event_id = $1',
    [eventId],
  );
  if (result.rowCount !== 1) {
    throw new Error(`expected exactly one log row for ${eventId}, got ${result.rowCount}`);
  }
  return result.rows[0];
}

async function waitFor(
  check: () => Promise<boolean>,
  label: string,
  timeoutMs = 30_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await check()) {
      return;
    }
    if (Date.now() > deadline) {
      throw new Error(`timed out waiting for ${label}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

const silentAlerts: LogConsumerDeps['alerts'] = {
  publish: async (): Promise<void> => undefined,
};

interface ConsumerHandle {
  consumer: ProfileChangeLogConsumer;
  payloads: string[];
  close(): Promise<void>;
}

/**
 * Builds a consumer on its own consumer group so every scenario decides for
 * itself when the backlog becomes visible, and keeps each raw payload it was
 * handed so a test can prove how often one event was really delivered. All
 * resources are created here and released by `close`, because dependencies
 * handed to a worker belong to whoever created them.
 */
function createConsumer(alerts: LogConsumerDeps['alerts']): ConsumerHandle {
  const payloads: string[] = [];
  const store = createProfileChangeLogStore(config);
  const kafkaStream = createKafkaEventStream({
    brokers: BROKERS,
    groupId: `outbox-delivery-${randomUUID()}`,
    socketFactory: loopbackSocketFactory(),
  });
  const stream: ProfileChangedEventStream = {
    subscribe: async (handler) =>
      kafkaStream.subscribe(async (raw) => {
        payloads.push(raw.toString('utf8'));
        await handler(raw);
      }),
    disconnect: () => kafkaStream.disconnect(),
  };
  const consumer = new ProfileChangeLogConsumer({ stream, store, alerts });
  return {
    consumer,
    payloads,
    close: async () => {
      await consumer.stop();
      await stream.disconnect();
      await store.close?.();
    },
  };
}

describe('outbox → broker → log pipeline', () => {
  let mainPool: Pool;
  let logPool: Pool;
  let pollerPublisher: OutboxPublisher;
  let poller: OutboxPoller;

  beforeAll(async () => {
    mainPool = new Pool({ connectionString: config.databaseUrlMain, max: 4 });
    logPool = new Pool({ connectionString: config.databaseUrlLog, max: 4 });
    pollerPublisher = createKafkaOutboxPublisher({
      brokers: BROKERS,
      socketFactory: loopbackSocketFactory(),
    });
    poller = new OutboxPoller({ pool: mainPool, publisher: pollerPublisher });
    await mainPool.query('SELECT 1');
    await logPool.query('SELECT 1');
  });

  afterAll(async () => {
    await poller.stop();
    await pollerPublisher.disconnect?.();
    await mainPool.end();
    await logPool.end();
  });

  it('turns one committed outbox row into exactly one log row', async () => {
    const employee = await createEmployee(mainPool);
    const outbox = await insertOutboxRow(
      mainPool,
      employee.id,
      ['phone'],
      { phone: '+62 811-111-1111' },
      { phone: '+62 812-222-2222' },
    );

    const sweep = await poller.sweepOnce();
    expect(sweep.claimed).toBeGreaterThanOrEqual(1);
    expect((await readOutboxRow(mainPool, outbox.id)).publishedAt).not.toBeNull();

    const handle = createConsumer(silentAlerts);
    try {
      await handle.consumer.start();
      await waitFor(async () => (await countLogRows(logPool, outbox.id)) > 0, 'log row');

      const row = await readLogRow(logPool, outbox.id);
      expect(row.employee_id).toBe(employee.id);
      expect(row.actor_id).toBe(employee.id);
      expect(row.actor_role).toBe('employee');
      expect(row.changed_fields).toEqual(['phone']);
      expect(row.before_values).toEqual({ phone: '+62 811-111-1111' });
      expect(row.after_values).toEqual({ phone: '+62 812-222-2222' });
      expect(await countLogRows(logPool, outbox.id)).toBe(1);
    } finally {
      await handle.close();
    }
  });

  it('keeps publishing while no consumer is running and lands the backlog exactly once', async () => {
    const employee = await createEmployee(mainPool);
    const outbox = await insertOutboxRow(mainPool, employee.id, ['photo'], null, {
      photoObjectKey: 'photos/before.jpg',
    });

    const sweep = await poller.sweepOnce();
    expect(sweep.claimed).toBeGreaterThanOrEqual(1);
    expect((await readOutboxRow(mainPool, outbox.id)).publishedAt).not.toBeNull();
    expect(await countLogRows(logPool, outbox.id)).toBe(0);

    const handle = createConsumer(silentAlerts);
    try {
      await handle.consumer.start();
      await waitFor(async () => (await countLogRows(logPool, outbox.id)) > 0, 'backlog row');
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(await countLogRows(logPool, outbox.id)).toBe(1);
    } finally {
      await handle.close();
    }
  });

  it('collapses a replayed event to a single log row', async () => {
    const employee = await createEmployee(mainPool);
    const outbox = await insertOutboxRow(
      mainPool,
      employee.id,
      ['phone'],
      { phone: '+62 813-333-3333' },
      { phone: '+62 814-444-4444' },
    );

    const broker = createKafkaOutboxPublisher({
      brokers: BROKERS,
      socketFactory: loopbackSocketFactory(),
    });
    const seenEvents: ProfileChangedEvent[] = [];
    const recordingPublisher: OutboxPublisher = {
      publish: async (event) => {
        seenEvents.push(event);
        await broker.publish(event);
      },
    };
    const recordingPoller = new OutboxPoller({ pool: mainPool, publisher: recordingPublisher });

    await recordingPoller.sweepOnce();
    const event = seenEvents.find((candidate) => candidate.eventId === outbox.id);
    expect(event).toBeDefined();

    await broker.publish(event as ProfileChangedEvent);

    const handle = createConsumer(silentAlerts);
    try {
      await handle.consumer.start();
      await waitFor(
        async () => handle.payloads.filter((raw) => raw.includes(outbox.id)).length >= 2,
        'two deliveries of the same event',
      );
      expect(await countLogRows(logPool, outbox.id)).toBe(1);
    } finally {
      await handle.close();
      await recordingPoller.stop();
      await broker.disconnect?.();
    }
  });

  it('marks published_at only after a successful produce and retries a failed one', async () => {
    const employee = await createEmployee(mainPool);
    const outbox = await insertOutboxRow(
      mainPool,
      employee.id,
      ['phone'],
      { phone: '+62 815-555-5555' },
      { phone: '+62 816-666-6666' },
    );

    const brokenPoller = new OutboxPoller({
      pool: mainPool,
      publisher: {
        publish: async () => {
          throw new Error('broker unavailable');
        },
      },
    });

    const failedSweep = await brokenPoller.sweepOnce();
    expect(failedSweep.claimed).toBeGreaterThanOrEqual(1);
    expect(failedSweep.published).toBe(0);
    expect((await readOutboxRow(mainPool, outbox.id)).publishedAt).toBeNull();

    const retrySweep = await poller.sweepOnce();
    expect(retrySweep.published).toBeGreaterThanOrEqual(1);
    expect((await readOutboxRow(mainPool, outbox.id)).publishedAt).not.toBeNull();
  });
});
