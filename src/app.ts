import { INestApplication, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { HealthController } from './health.controller';

/** URL prefix shared by every HTTP route exposed by this service. */
export const GLOBAL_PREFIX = 'api/notification';

@Module({
  controllers: [HealthController],
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
 */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  configureHttp(app);
  return app;
}
