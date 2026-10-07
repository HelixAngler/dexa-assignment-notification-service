import { RedisSessionReader, SessionClaims } from '../src/common/auth/session.reader';
import { FakeRedis } from './fake-redis';

const TOKEN = 'opaque-token-1';
const KEY = `sess:${TOKEN}`;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function storedSession(overrides: Partial<SessionClaims> = {}): SessionClaims {
  const now = Date.now();
  return {
    employeeId: 'emp-7',
    role: 'hrd',
    mustChangePassword: false,
    lastSeen: now,
    issuedAt: now,
    ...overrides,
  };
}

describe('session reader', () => {
  let redis: FakeRedis;
  let reader: RedisSessionReader;

  beforeEach(() => {
    redis = new FakeRedis();
    reader = new RedisSessionReader(() => redis);
  });

  it('returns the stored claims and stamps lastSeen with the current time', async () => {
    const issuedAt = Date.now() - 5 * MINUTE;
    redis.values.set(KEY, JSON.stringify(storedSession({ issuedAt, lastSeen: issuedAt })));

    const claims = await reader.read(TOKEN);

    expect(claims).toMatchObject({ employeeId: 'emp-7', role: 'hrd', mustChangePassword: false });
    expect(claims?.issuedAt).toBe(issuedAt);
    expect(claims?.lastSeen).toBeGreaterThanOrEqual(issuedAt);

    const rewritten = redis.values.get(KEY);
    expect(rewritten).toBeDefined();
    expect(JSON.parse(rewritten as string).lastSeen).toBe(claims?.lastSeen);
  });

  it('resets the TTL to the 30 minute idle window while absolute age is low', async () => {
    redis.values.set(KEY, JSON.stringify(storedSession()));

    await reader.read(TOKEN);

    const ttl = redis.ttls.get(KEY);
    expect(ttl).toBeDefined();
    expect(ttl).toBeLessThanOrEqual(30 * MINUTE);
    expect(ttl).toBeGreaterThan(29 * MINUTE);
  });

  it('shrinks the TTL to the remaining absolute window near the 12 hour cap', async () => {
    const issuedAt = Date.now() - (12 * HOUR - 10 * MINUTE);
    redis.values.set(KEY, JSON.stringify(storedSession({ issuedAt })));

    await reader.read(TOKEN);

    const ttl = redis.ttls.get(KEY);
    expect(ttl).toBeDefined();
    expect(ttl).toBeLessThanOrEqual(10 * MINUTE);
    expect(ttl).toBeGreaterThan(9 * MINUTE);
  });

  it('deletes a session that has reached the absolute age cap', async () => {
    const issuedAt = Date.now() - 12 * HOUR;
    redis.values.set(KEY, JSON.stringify(storedSession({ issuedAt })));

    const claims = await reader.read(TOKEN);

    expect(claims).toBeNull();
    expect(redis.values.has(KEY)).toBe(false);
    expect(redis.deleted).toContain(KEY);
  });

  it('returns null for a token that has no record', async () => {
    await expect(reader.read('never-issued')).resolves.toBeNull();
  });

  it('returns null and deletes the key when the record is not valid JSON', async () => {
    redis.values.set(KEY, 'not-json');

    await expect(reader.read(TOKEN)).resolves.toBeNull();
    expect(redis.values.has(KEY)).toBe(false);
  });

  it('returns null and deletes the key when the record shape is unexpected', async () => {
    redis.values.set(
      KEY,
      JSON.stringify({ ...storedSession(), role: 'administrator', issuedAt: Date.now() }),
    );

    await expect(reader.read(TOKEN)).resolves.toBeNull();
    expect(redis.values.has(KEY)).toBe(false);
  });

  it('treats an empty token as no session without touching the store', async () => {
    redis.values.set(KEY, JSON.stringify(storedSession()));

    await expect(reader.read('')).resolves.toBeNull();
    expect(redis.values.get(KEY)).toBeDefined();
  });

  it('releases the connection exactly once on shutdown', async () => {
    redis.values.set(KEY, JSON.stringify(storedSession()));
    await reader.read(TOKEN);

    await reader.onModuleDestroy();
    await reader.onModuleDestroy();

    expect(redis.quitCalls).toBe(1);
  });
});
