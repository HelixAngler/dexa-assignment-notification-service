import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule, configureHttp } from '../src/app';
import { AppException } from '../src/common/app.exception';
import { ERROR_MESSAGES } from '../src/common/http-exception.filter';

@Controller('probe')
class ProbeController {
  @Get('auth-required')
  authRequired(): never {
    throw new AppException(401, 'AUTH_REQUIRED');
  }

  @Get('forbidden')
  forbidden(): never {
    throw new AppException(403, 'FORBIDDEN');
  }

  @Get('with-details')
  withDetails(): never {
    throw new AppException(400, 'PHONE_INVALID', { field: 'phone' });
  }

  @Get('boom')
  boom(): never {
    throw new Error('secret-internal-detail');
  }
}

const BASE = '/api/notification';

describe('global http exception filter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ProbeController],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('emits exactly {statusCode, code, message} in Indonesian by default', async () => {
    const response = await request(app.getHttpServer()).get(`${BASE}/probe/auth-required`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      code: 'AUTH_REQUIRED',
      message: ERROR_MESSAGES.id.AUTH_REQUIRED,
    });
  });

  it('switches to the English message for Accept-Language: en', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/probe/auth-required`)
      .set('Accept-Language', 'en');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      code: 'AUTH_REQUIRED',
      message: ERROR_MESSAGES.en.AUTH_REQUIRED,
    });
    expect(response.body.message).not.toBe(ERROR_MESSAGES.id.AUTH_REQUIRED);
  });

  it('parses language tags loosely and falls back to Indonesian', async () => {
    const server = app.getHttpServer();

    const enGb = await request(server).get(`${BASE}/probe/auth-required`).set('Accept-Language', 'en-GB,en;q=0.9');
    expect(enGb.body.message).toBe(ERROR_MESSAGES.en.AUTH_REQUIRED);

    const idId = await request(server).get(`${BASE}/probe/auth-required`).set('Accept-Language', 'id-ID');
    expect(idId.body.message).toBe(ERROR_MESSAGES.id.AUTH_REQUIRED);

    const preferredId = await request(server)
      .get(`${BASE}/probe/auth-required`)
      .set('Accept-Language', 'en;q=0.4, id;q=0.9');
    expect(preferredId.body.message).toBe(ERROR_MESSAGES.id.AUTH_REQUIRED);

    const unknown = await request(server).get(`${BASE}/probe/auth-required`).set('Accept-Language', 'fr-FR');
    expect(unknown.body.message).toBe(ERROR_MESSAGES.id.AUTH_REQUIRED);
  });

  it('renders 403 FORBIDDEN in the requested language', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/probe/forbidden`)
      .set('Accept-Language', 'en');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: ERROR_MESSAGES.en.FORBIDDEN,
    });
  });

  it('merges exception details without adding or dropping any other field', async () => {
    const response = await request(app.getHttpServer()).get(`${BASE}/probe/with-details`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      code: 'PHONE_INVALID',
      message: ERROR_MESSAGES.id.PHONE_INVALID,
      field: 'phone',
    });
  });

  it('maps an unhandled error to an opaque 500 that leaks nothing', async () => {
    const server = app.getHttpServer();

    const id = await request(server).get(`${BASE}/probe/boom`);
    expect(id.status).toBe(500);
    expect(id.body).toEqual({
      statusCode: 500,
      code: 'INTERNAL',
      message: ERROR_MESSAGES.id.INTERNAL,
    });

    const en = await request(server).get(`${BASE}/probe/boom`).set('Accept-Language', 'en');
    expect(en.body).toEqual({
      statusCode: 500,
      code: 'INTERNAL',
      message: ERROR_MESSAGES.en.INTERNAL,
    });

    expect(JSON.stringify(id.body)).not.toContain('secret-internal-detail');
    expect(JSON.stringify(en.body)).not.toContain('secret-internal-detail');
  });

  it('shapes unknown routes as a localized 404 with the same three fields', async () => {
    const server = app.getHttpServer();

    const id = await request(server).get(`${BASE}/no-such-route`);
    expect(id.status).toBe(404);
    expect(id.body).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: ERROR_MESSAGES.id.NOT_FOUND,
    });

    const en = await request(server).get(`${BASE}/no-such-route`).set('Accept-Language', 'en');
    expect(en.body).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: ERROR_MESSAGES.en.NOT_FOUND,
    });
  });
});
