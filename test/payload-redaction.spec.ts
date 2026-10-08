import { randomUUID } from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { Pool } from 'pg';
import { config } from '../src/config';
import { ALERT_CHANNEL } from '../src/alerts/alert.projection';
import { createCentrifugoAlertPublisher } from '../src/alerts/centrifugo.publisher';
import { createProfileChangeLogStore } from '../src/stream/profile-change-log.store';
import { ProfileChangeLogConsumer } from '../src/stream/log.consumer';
import type { ProfileChangedEvent } from '../src/stream/profile-changed.event';

jest.setTimeout(60_000);

const SECRET_PASSWORD = 'Sup3r-Secr3t-Pass!';
const SECRET_HASH = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$ZWxzZS1hLWhhc2gtYmxvYg';

/** Keys that may only ever appear as booleans or enumerations, never as values. */
const SECRET_KEY_PATTERN =
  /"(password|passwordHash|password_hash|newPassword|currentPassword|hash|secret|token|credential|salt)"\s*:/;
const PASSWORD_HASH_PATTERNS = [/\$argon2[idi]?\$/, /\$2[abxy]\$\d+\$/];

function assertNoSecretMaterial(serialized: string): void {
  expect(serialized).not.toMatch(SECRET_KEY_PATTERN);
  expect(serialized).not.toContain(SECRET_PASSWORD);
  expect(serialized).not.toContain(SECRET_HASH);
  for (const pattern of PASSWORD_HASH_PATTERNS) {
    expect(serialized).not.toMatch(pattern);
  }
}

interface CapturedPublish {
  channel: string;
  data: Record<string, unknown>;
  apiKeyHeader: string | undefined;
}

interface LogRow {
  event_id: string;
  employee_id: string;
  employee_email: string;
  employee_name: string;
  changed_fields: string[];
  before_values: unknown;
  after_values: unknown;
  occurred_at: Date;
}

function passwordEvent(overrides: Partial<ProfileChangedEvent> = {}): ProfileChangedEvent {
  const employeeId = randomUUID();
  return {
    eventId: randomUUID(),
    type: 'profile.changed',
    occurredAt: new Date().toISOString(),
    actor: { id: employeeId, role: 'employee' },
    subject: { id: employeeId, email: 'cleo@example.test', name: 'Cleo R.' },
    changedFields: ['password'],
    passwordChanged: true,
    ...overrides,
  };
}

describe('profile-change payloads never carry secret material', () => {
  let gateway: http.Server;
  let gatewayUrl: string;
  const published: CapturedPublish[] = [];
  let store: ReturnType<typeof createProfileChangeLogStore>;
  let consumer: ProfileChangeLogConsumer;
  let logPool: Pool;
  const writtenEvents: string[] = [];

  beforeAll(async () => {
    gateway = http.createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
          channel: string;
          data: Record<string, unknown>;
        };
        const apiKey = request.headers['x-api-key'];
        published.push({
          channel: body.channel,
          data: body.data,
          apiKeyHeader: Array.isArray(apiKey) ? apiKey[0] : apiKey,
        });
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ result: {} }));
      });
    });
    await new Promise<void>((resolve) => gateway.listen(0, '127.0.0.1', resolve));
    gatewayUrl = `http://127.0.0.1:${(gateway.address() as AddressInfo).port}`;

    store = createProfileChangeLogStore(config);
    consumer = new ProfileChangeLogConsumer({
      store,
      alerts: createCentrifugoAlertPublisher({ url: gatewayUrl, apiKey: 'test-centrifugo-api-key' }),
    });
    logPool = new Pool({ connectionString: config.databaseUrlLog, max: 2 });
  });

  afterAll(async () => {
    await consumer.stop();
    await store.close?.();
    if (writtenEvents.length > 0) {
      await logPool.query('DELETE FROM profile_change_log WHERE event_id = ANY($1::uuid[])', [
        writtenEvents,
      ]);
    }
    await logPool.end();
    await new Promise<void>((resolve, reject) =>
      gateway.close((error) => (error === null || error === undefined ? resolve() : reject(error))),
    );
  });

  async function deliver(event: ProfileChangedEvent): Promise<{ row: LogRow; alert: CapturedPublish }> {
    writtenEvents.push(event.eventId);
    await consumer.handleMessage(JSON.stringify(event));

    const result = await logPool.query<LogRow>(
      'SELECT * FROM profile_change_log WHERE event_id = $1',
      [event.eventId],
    );
    expect(result.rowCount).toBe(1);
    const alert = published.find(
      (entry) => entry.channel === ALERT_CHANNEL && entry.data.alertId === event.eventId,
    );
    expect(alert).toBeDefined();
    return { row: result.rows[0], alert: alert as CapturedPublish };
  }

  it('keeps a password change down to the fact that it happened', async () => {
    const event = passwordEvent();

    const { row, alert } = await deliver(event);

    assertNoSecretMaterial(JSON.stringify(row));
    assertNoSecretMaterial(JSON.stringify(alert.data));
    expect(alert.apiKeyHeader).toBe('test-centrifugo-api-key');
    expect(alert.data).toEqual({
      alertId: event.eventId,
      employeeId: event.subject.id,
      employeeName: event.subject.name,
      changedFields: ['password'],
      passwordChanged: true,
      occurredAt: new Date(event.occurredAt).toISOString(),
    });
    expect(alert.data).not.toHaveProperty('before');
    expect(alert.data).not.toHaveProperty('after');

    expect(row.changed_fields).toEqual(['password']);
    expect(row.before_values).toBeNull();
    expect(row.after_values).toEqual({ password_changed: true });
  });

  it('strips secret material even when a source event leaked it', async () => {
    const leaked = passwordEvent({
      before: { password: SECRET_PASSWORD },
      after: { passwordHash: SECRET_HASH },
    });
    const phoneWithLeak = passwordEvent({
      changedFields: ['phone'],
      passwordChanged: false,
      before: { phone: '+62 811-111-1111', passwordHash: SECRET_HASH },
      after: { phone: '+62 812-222-2222', password: SECRET_PASSWORD },
    });

    const passwordLeak = await deliver(leaked);
    assertNoSecretMaterial(JSON.stringify(passwordLeak.row));
    assertNoSecretMaterial(JSON.stringify(passwordLeak.alert.data));
    expect(passwordLeak.alert.data.passwordChanged).toBe(true);
    expect(passwordLeak.alert.data).not.toHaveProperty('before');
    expect(passwordLeak.alert.data).not.toHaveProperty('after');

    const phoneLeak = await deliver(phoneWithLeak);
    assertNoSecretMaterial(JSON.stringify(phoneLeak.row));
    assertNoSecretMaterial(JSON.stringify(phoneLeak.alert.data));
    expect(phoneLeak.alert.data).toEqual({
      alertId: phoneWithLeak.eventId,
      employeeId: phoneWithLeak.subject.id,
      employeeName: phoneWithLeak.subject.name,
      changedFields: ['phone'],
      before: { phone: '+62 811-111-1111' },
      after: { phone: '+62 812-222-2222' },
      passwordChanged: false,
      occurredAt: new Date(phoneWithLeak.occurredAt).toISOString(),
    });
    expect(phoneLeak.row.before_values).toEqual({ phone: '+62 811-111-1111' });
    expect(phoneLeak.row.after_values).toEqual({ phone: '+62 812-222-2222' });
  });

  it('projects a phone change onto exactly the documented alert fields', async () => {
    const event = passwordEvent({
      changedFields: ['phone'],
      passwordChanged: false,
      before: { phone: '+62 811-000-0001' },
      after: { phone: '+62 812-000-0002' },
    });

    const { row, alert } = await deliver(event);

    expect(Object.keys(alert.data).sort()).toEqual([
      'after',
      'alertId',
      'before',
      'changedFields',
      'employeeId',
      'employeeName',
      'occurredAt',
      'passwordChanged',
    ]);
    expect(alert.data.passwordChanged).toBe(false);
    expect(alert.data.before).toEqual({ phone: '+62 811-000-0001' });
    expect(alert.data.after).toEqual({ phone: '+62 812-000-0002' });
    expect(row.before_values).toEqual({ phone: '+62 811-000-0001' });
    expect(row.after_values).toEqual({ phone: '+62 812-000-0002' });
    assertNoSecretMaterial(JSON.stringify(alert.data));
    assertNoSecretMaterial(JSON.stringify(row));
  });

  it('projects a photo change onto exactly the documented alert fields', async () => {
    const event = passwordEvent({
      changedFields: ['photo'],
      passwordChanged: false,
      before: { photoObjectKey: 'photos/old.jpg' },
      after: { photoObjectKey: 'photos/new.jpg' },
    });

    const { row, alert } = await deliver(event);

    expect(Object.keys(alert.data).sort()).toEqual([
      'after',
      'alertId',
      'before',
      'changedFields',
      'employeeId',
      'employeeName',
      'occurredAt',
      'passwordChanged',
    ]);
    expect(alert.data.changedFields).toEqual(['photo']);
    expect(alert.data.passwordChanged).toBe(false);
    expect(alert.data.before).toEqual({ photoObjectKey: 'photos/old.jpg' });
    expect(alert.data.after).toEqual({ photoObjectKey: 'photos/new.jpg' });
    expect(row.changed_fields).toEqual(['photo']);
    assertNoSecretMaterial(JSON.stringify(alert.data));
    assertNoSecretMaterial(JSON.stringify(row));
  });
});
