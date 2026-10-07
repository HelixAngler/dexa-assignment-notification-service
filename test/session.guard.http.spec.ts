import { Controller, Get, INestApplication, Req, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule, configureHttp } from '../src/app';
import {
  GuardedRequest,
  RequirePermission,
  SessionGuard,
} from '../src/common/auth/session.guard';
import { SESSION_STORE, SessionClaims } from '../src/common/auth/session.reader';
import { ERROR_MESSAGES } from '../src/common/http-exception.filter';

function claims(overrides: Partial<SessionClaims> = {}): SessionClaims {
  const now = Date.now();
  return {
    employeeId: 'emp-2',
    role: 'hrd',
    mustChangePassword: false,
    lastSeen: now,
    issuedAt: now,
    ...overrides,
  };
}

const SESSIONS: Record<string, SessionClaims> = {
  'hrd-token': claims(),
  'employee-token': claims({ role: 'employee' }),
};

const STORE = {
  read: jest.fn(async (token: string): Promise<SessionClaims | null> => SESSIONS[token] ?? null),
};

@Controller('probe')
class GuardedProbeController {
  @UseGuards(SessionGuard)
  @RequirePermission('hrd:receive_popups')
  @Get('alerts')
  alerts(@Req() req: GuardedRequest): { role: string | undefined } {
    return { role: req.session?.role };
  }
}

const BASE = '/api/notification';

describe('session guard over HTTP', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // The probe controller lives in the test module, so its guard resolves
    // SESSION_STORE from this module's own providers rather than the app's.
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [GuardedProbeController],
      providers: [{ provide: SESSION_STORE, useValue: STORE }],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    STORE.read.mockClear();
  });

  it('rejects a request without the sid cookie as 401 AUTH_REQUIRED', async () => {
    const response = await request(app.getHttpServer()).get(`${BASE}/probe/alerts`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      code: 'AUTH_REQUIRED',
      message: ERROR_MESSAGES.id.AUTH_REQUIRED,
    });
    expect(STORE.read).not.toHaveBeenCalled();
  });

  it('localizes the 401 rejection for Accept-Language: en', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/probe/alerts`)
      .set('Accept-Language', 'en');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(ERROR_MESSAGES.en.AUTH_REQUIRED);
  });

  it('rejects an employee session with 403 FORBIDDEN', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/probe/alerts`)
      .set('Cookie', ['sid=employee-token']);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: ERROR_MESSAGES.id.FORBIDDEN,
    });
    expect(STORE.read).toHaveBeenCalledWith('employee-token');
  });

  it('serves an hrd session and attaches the claims to the request', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/probe/alerts`)
      .set('Cookie', ['sid=hrd-token']);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ role: 'hrd' });
  });

  it('rejects a token the store does not know with 401 AUTH_REQUIRED', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/probe/alerts`)
      .set('Cookie', ['sid=revoked-token']);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_REQUIRED');
  });
});
