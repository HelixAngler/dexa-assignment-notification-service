/**
 * Runtime configuration read from environment variables.
 *
 * Every field carries a safe default so that importing this module never
 * throws, even in environments where nothing has been configured yet.
 */
export interface ServiceConfig {
  port: number;
  /** Connection string of the log database that stores notification events. */
  databaseUrl: string;
  /** Connection string of the cache/queue Redis instance. */
  redisUrl: string;
  /** Comma separated list of message broker endpoints. */
  brokerBrokers: string;
  /** Base URL of the realtime push gateway. */
  centrifugoUrl: string;
  /** API key used to authenticate against the realtime push gateway. */
  centrifugoApiKey: string;
}

/** Parses a numeric environment value, falling back when it is absent or invalid. */
export function num(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Reads a string environment value, falling back when it is absent or empty. */
export function str(value: string | undefined, fallback: string): string {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  return value;
}

/** Builds the configuration object from the given environment map. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServiceConfig {
  return {
    port: num(env.PORT, 3003),
    databaseUrl: str(env.DATABASE_URL, ''),
    redisUrl: str(env.REDIS_URL, ''),
    brokerBrokers: str(env.BROKER_BROKERS, 'localhost:9092'),
    centrifugoUrl: str(env.CENTRIFUGO_URL, 'http://localhost:8000'),
    centrifugoApiKey: str(env.CENTRIFUGO_API_KEY, ''),
  };
}

/** Process wide configuration snapshot resolved at import time. */
export const config: ServiceConfig = loadConfig();
