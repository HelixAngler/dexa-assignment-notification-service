import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../src/app';

describe('health endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
    // Initialization registers the routes; supertest drives the server
    // without opening a real listening socket.
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a status of ok under the global prefix', async () => {
    const response = await request(app.getHttpServer()).get('/api/notification/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'notification-service' });
  });
});
