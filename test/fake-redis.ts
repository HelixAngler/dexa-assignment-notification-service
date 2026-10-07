import { SessionRedis } from '../src/common/auth/session.reader';

/**
 * In-memory stand-in for the Redis commands the session reader uses, so the
 * reader's lifetime rules can be exercised without a running server. TTLs are
 * recorded per key, which lets tests assert the sliding-window refresh.
 */
export class FakeRedis implements SessionRedis {
  readonly values = new Map<string, string>();
  readonly ttls = new Map<string, number>();
  readonly deleted: string[] = [];
  quitCalls = 0;

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string, _mode: 'PX', ttlMs: number): Promise<'OK'> {
    this.values.set(key, value);
    this.ttls.set(key, ttlMs);
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let removed = 0;
    for (const key of keys) {
      this.deleted.push(key);
      if (this.values.delete(key)) {
        removed += 1;
      }
      this.ttls.delete(key);
    }
    return removed;
  }

  async quit(): Promise<'OK'> {
    this.quitCalls += 1;
    return 'OK';
  }
}
