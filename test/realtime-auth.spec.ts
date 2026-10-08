import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { AppModule, configureHttp } from '../src/app';
import { SESSION_STORE, SessionClaims } from '../src/common/auth/session.reader';
import { ALERT_CHANNEL } from '../src/alerts/alert.projection';
import { REALTIME_TOKEN_TTL_SECONDS } from '../src/alerts/realtime.auth';
import { config } from '../src/config';

jest.setTimeout(30_000);

const BASE = '/api/notification';
const HRD_TOKEN = 'realtime-hrd-session';
const EMPLOYEE_TOKEN = 'realtime-employee-session';
const HRD_SUBJECT = 'realtime-hrd-user-42';

function claims(overrides: Partial<SessionClaims> = {}): SessionClaims {
  const now = Date.now();
  return {
    employeeId: HRD_SUBJECT,
    role: 'hrd',
    mustChangePassword: false,
    lastSeen: now,
    issuedAt: now,
    ...overrides,
  };
}

const SESSIONS: Record<string, SessionClaims> = {
  [HRD_TOKEN]: claims(),
  [EMPLOYEE_TOKEN]: claims({ role: 'employee', employeeId: 'realtime-employee-user-7' }),
};

const STORE = {
  read: jest.fn(async (token: string): Promise<SessionClaims | null> => SESSIONS[token] ?? null),
};

describe('POST /api/notification/realtime/auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
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
  });

  it('rejects an anonymous request with 401 AUTH_REQUIRED', async () => {
    const response = await request(app.getHttpServer()).post(`${BASE}/realtime/auth`);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_REQUIRED');
  });

  it('rejects an employee session with 403 FORBIDDEN', async () => {
    const response = await request(app.getHttpServer())
      .post(`${BASE}/realtime/auth`)
      .set('Cookie', [`sid=${EMPLOYEE_TOKEN}`]);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  it('issues an HS256 channel token the gateway can verify', async () => {
    const response = await request(app.getHttpServer())
      .post(`${BASE}/realtime/auth`)
      .set('Cookie', [`sid=${HRD_TOKEN}`]);

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');

    const decoded = jwt.decode(response.body.token, { complete: true });
    expect(decoded).not.toBeNull();
    expect(decoded?.header.alg).toBe('HS256');

    // Verified with the shared API key: this is exactly the check the
    // realtime gateway performs before accepting a subscription.
    const claims = jwt.verify(response.body.token, config.centrifugoApiKey, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    // No `sub` claim: the gateway binds `sub` to the connecting socket's
    // user id, and the console connects without a connection token, so a
    // subject here would make the gateway reject the subscription.
    expect(claims.sub).toBeUndefined();
    expect(claims.channel).toBe(ALERT_CHANNEL);
    expect(typeof claims.iat).toBe('number');
    expect(typeof claims.exp).toBe('number');
    expect((claims.exp as number) - (claims.iat as number)).toBe(REALTIME_TOKEN_TTL_SECONDS);
    expect(Object.keys(claims).sort()).toEqual(['channel', 'exp', 'iat']);
  });

  it('rejects a token signed with a different secret', async () => {
    const response = await request(app.getHttpServer())
      .post(`${BASE}/realtime/auth`)
      .set('Cookie', [`sid=${HRD_TOKEN}`]);

    expect(response.status).toBe(200);
    expect(() =>
      jwt.verify(response.body.token, 'not-the-real-api-key', { algorithms: ['HS256'] }),
    ).toThrow();
  });
});
