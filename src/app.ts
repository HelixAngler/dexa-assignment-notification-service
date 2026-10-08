import { INestApplication, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ALERT_FEED, createAlertFeed } from './alerts/alert.feed';
import { AlertsController } from './alerts/alerts.controller';
import { RealtimeAuthController } from './alerts/realtime.auth';
import { createSessionReader, SESSION_STORE } from './common/auth/session.reader';
import { config } from './config';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { HealthController } from './health.controller';
import { Pipeline } from './pipeline';

/** URL prefix shared by every HTTP route exposed by this service. */
export const GLOBAL_PREFIX = 'api/notification';

@Module({
  controllers: [HealthController, AlertsController, RealtimeAuthController],
  providers: [
    // The session store is shared by every guard in the module; it dials
    // Redis lazily, so assembling the graph never touches the network.
    { provide: SESSION_STORE, useFactory: () => createSessionReader(config.redisUrl) },
    { provide: ALERT_FEED, useFactory: () => createAlertFeed(config) },
    Pipeline,
  ],
})
export class AppModule {}

/**
 * Applies the shared HTTP pipeline: route prefix, cookie parsing (the
 * session guard reads the `sid` cookie from `req.cookies`) and the global
 * error filter that gives every failure the `{statusCode, code, message}`
 * shape with a language-aware message.
 *
 * Kept separate from application creation so tests can run the exact same
 * pipeline on a module of their own.
 */
export function configureHttp(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
}

/**
 * Builds a fully wired Nest application.
 *
 * The caller decides when to start listening, so this helper only
 * assembles the module graph and applies the shared HTTP pipeline.
 * Shutdown hooks are enabled here (and only here) so a running service
 * drains the pipeline through `onModuleDestroy`, while test applications
 * stay in full control of their own lifecycle.
 */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  configureHttp(app);
  app.enableShutdownHooks();
  return app;
}
