import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import { AppModule, configureHttp } from '../src/app';
import { ERROR_MESSAGES } from '../src/common/http-exception.filter';
import { SESSION_STORE, SessionClaims } from '../src/common/auth/session.reader';

jest.setTimeout(60_000);

const BASE = '/api/notification';
const HRD_TOKEN = 'alerts-hrd-session';
const EMPLOYEE_TOKEN = 'alerts-employee-session';

function claims(overrides: Partial<SessionClaims> = {}): SessionClaims {
  const now = Date.now();
  return {
    employeeId: 'alerts-session-owner',
    role: 'hrd',
    mustChangePassword: false,
    lastSeen: now,
    issuedAt: now,
    ...overrides,
  };
}

const SESSIONS: Record<string, SessionClaims> = {
  [HRD_TOKEN]: claims(),
  [EMPLOYEE_TOKEN]: claims({ role: 'employee' }),
};

const STORE = {
  read: jest.fn(async (token: string): Promise<SessionClaims | null> => SESSIONS[token] ?? null),
};

/** One seeded log row, remembered so the suite can clean up after itself. */
interface SeededRow {
  eventId: string;
  employeeId: string;
  occurredAt: Date;
}

const seeded: string[] = [];

async function seedLogRow(
  pool: Pool,
  options: {
    occurredAt: Date;
    changedFields: string[];
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    employeeName: string;
  },
): Promise<SeededRow> {
  const eventId = randomUUID();
  const employeeId = randomUUID();
  seeded.push(eventId);
  await pool.query(
    `INSERT INTO profile_change_log
       (event_id, employee_id, employee_email, employee_name, actor_id, actor_role,
        changed_fields, before_values, after_values, occurred_at)
     VALUES ($1, $2, $3, $4, $5, 'employee', $6, $7, $8, $9)`,
    [
      eventId,
      employeeId,
      `probe-${eventId.slice(0, 8)}@example.test`,
      options.employeeName,
      employeeId,
      options.changedFields,
      options.before === undefined ? null : JSON.stringify(options.before),
      options.after === undefined ? null : JSON.stringify(options.after),
      options.occurredAt,
    ],
  );
  return { eventId, employeeId, occurredAt: options.occurredAt };
}

describe('GET /api/notification/alerts/recent', () => {
  let app: INestApplication;
  let pool: Pool;
  let oldRow: SeededRow;
  let passwordRow: SeededRow;
  let newRow: SeededRow;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL_LOG, max: 2 });
    const now = Date.now();
    oldRow = await seedLogRow(pool, {
      occurredAt: new Date(now - 60 * 60 * 1000),
      changedFields: ['phone'],
      before: { phone: '+62 811-000-0001' },
      after: { phone: '+62 811-000-0002' },
      employeeName: 'Probe Old',
    });
    passwordRow = await seedLogRow(pool, {
      occurredAt: new Date(now - 30 * 60 * 1000),
      changedFields: ['password'],
      after: { password_changed: true },
      employeeName: 'Probe Password',
    });
    newRow = await seedLogRow(pool, {
      occurredAt: new Date(now - 60 * 1000),
      changedFields: ['phone'],
      before: { phone: '+62 812-000-0001' },
      after: { phone: '+62 812-000-0002' },
      employeeName: 'Probe Newest',
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SESSION_STORE)
      .useValue(STORE)
      .compile();
    app = moduleRef.createNestApplication();
    configureHttp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (seeded.length > 0) {
      await pool.query('DELETE FROM profile_change_log WHERE event_id = ANY($1::uuid[])', [
        seeded,
      ]);
    }
    await pool.end();
  });

  /** Answers only about this suite's own rows, never about the shared table. */
  function ownAlerts(body: { alerts: Array<Record<string, unknown>> }): Array<
    Record<string, unknown>
  > {
    return body.alerts.filter((alert) => seeded.includes(alert.alertId as string));
  }

  it('rejects an anonymous request with 401 AUTH_REQUIRED', async () => {
    const response = await request(app.getHttpServer()).get(`${BASE}/alerts/recent`);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_REQUIRED');
  });

  it('rejects an employee session with 403 FORBIDDEN', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/alerts/recent`)
      .set('Cookie', [`sid=${EMPLOYEE_TOKEN}`]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  it('answers an hrd session with the newest alerts in order', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/alerts/recent`)
      .set('Cookie', [`sid=${HRD_TOKEN}`]);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.alerts)).toBe(true);
    expect(response.body.alerts.length).toBeLessThanOrEqual(20);

    const own = ownAlerts(response.body);
    // The newest seeded row was inserted last, so it leads its own rows.
    expect(own[0]?.alertId).toBe(newRow.eventId);
    expect(own[0]?.employeeId).toBe(newRow.employeeId);
    expect(own[0]?.employeeName).toBe('Probe Newest');
    expect(own[0]?.changedFields).toEqual(['phone']);
    expect(own[0]?.passwordChanged).toBe(false);
    expect(own[0]?.occurredAt).toBe(newRow.occurredAt.toISOString());
    expect(Object.keys(own[0] ?? {}).sort()).toEqual([
      'after',
      'alertId',
      'before',
      'changedFields',
      'employeeId',
      'employeeName',
      'occurredAt',
      'passwordChanged',
    ]);
  });

  it('keeps the whole feed ordered newest first', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/alerts/recent`)
      .set('Cookie', [`sid=${HRD_TOKEN}`]);

    expect(response.status).toBe(200);
    const timestamps = response.body.alerts.map((alert: { occurredAt: string }) =>
      Date.parse(alert.occurredAt),
    );
    for (let index = 1; index < timestamps.length; index += 1) {
      expect(timestamps[index]).toBeLessThanOrEqual(timestamps[index - 1]);
    }
  });

  it('returns only alerts at or after the since marker', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/alerts/recent?since=${encodeURIComponent(passwordRow.occurredAt.toISOString())}`)
      .set('Cookie', [`sid=${HRD_TOKEN}`]);

    expect(response.status).toBe(200);
    const ownIds = ownAlerts(response.body).map((alert) => alert.alertId);
    expect(ownIds).toEqual([newRow.eventId, passwordRow.eventId]);
    expect(ownIds).not.toContain(oldRow.eventId);
  });

  it('redacts a password change in the served payload', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/alerts/recent?since=${encodeURIComponent(passwordRow.occurredAt.toISOString())}`)
      .set('Cookie', [`sid=${HRD_TOKEN}`]);

    expect(response.status).toBe(200);
    const alert = ownAlerts(response.body).find(
      (candidate) => candidate.alertId === passwordRow.eventId,
    );
    expect(alert).toBeDefined();
    expect(alert?.passwordChanged).toBe(true);
    expect(alert).not.toHaveProperty('before');
    expect(alert).not.toHaveProperty('after');
    expect(JSON.stringify(alert)).not.toMatch(/"(password|passwordHash|secret|token)"\s*:/);
  });

  it('rejects an unparseable since marker with 400 BAD_REQUEST', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/alerts/recent?since=definitely-not-a-date`)
      .set('Cookie', [`sid=${HRD_TOKEN}`]);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('BAD_REQUEST');
    expect(response.body.message).toBe(ERROR_MESSAGES.id.BAD_REQUEST);
  });
});
