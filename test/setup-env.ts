/**
 * Environment defaults for the test process.
 *
 * Jest runs every suite in a fresh worker, so this file is the single place
 * that decides which backing services the suites talk to. It only ever fills
 * in values that are missing: an operator who already exported real
 * connection strings keeps theirs, and CI can point the suites at another
 * stack without editing code.
 *
 * The values below address the shared development stack that is reachable
 * from the host: both PostgreSQL instances publish their ports on
 * loopback, the stream broker is the container advertised under its
 * service name, and the push gateway runs on loopback too. The push API key
 * is a fixed test value so token assertions can verify a signature without
 * depending on a secret manager.
 */
process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL_MAIN ??= 'postgres://wfh:wfh@localhost:5432/wfh_main';
process.env.DATABASE_URL_LOG ??= 'postgres://wfh:wfh@localhost:5433/wfh_log';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.BROKER_BROKERS ??= 'redpanda:9092';
process.env.CENTRIFUGO_URL ??= 'http://localhost:8000';
process.env.CENTRIFUGO_API_KEY ??= 'test-centrifugo-api-key';
