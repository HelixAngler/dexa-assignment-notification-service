import Redis from 'ioredis';

/**
 * Claims stored for one signed-in session. Every timestamp is epoch
 * milliseconds so the record is comparable without parsing.
 */
export interface SessionClaims {
  employeeId: string;
  role: 'employee' | 'hrd';
  mustChangePassword: boolean;
  lastSeen: number;
  issuedAt: number;
}

/**
 * The slice of a Redis client the reader needs. Declaring it here keeps the
 * read logic testable without a live server and documents the exact commands
 * used: one GET, one PX-prefixed SET, one DEL and an optional QUIT.
 */
export interface SessionRedis {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: 'PX', ttlMs: number): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  quit(): Promise<unknown>;
}

/** Read side of the shared session store, resolved per request by guards. */
export interface SessionStore {
  read(token: string): Promise<SessionClaims | null>;
}

/** Injection token that every module binds its `SessionStore` to. */
export const SESSION_STORE = 'SESSION_STORE';

/** Redis key layout: one string record per opaque session token. */
const SESSION_KEY_PREFIX = 'sess:';

/** Sliding idle window: a session dies after this long without a request. */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/** Absolute cap: a session dies this long after issuance, idle or not. */
const MAX_SESSION_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * Reads `sess:{token}` records and enforces both lifetimes on every read:
 *
 * - absolute age of 12 h or more → key deleted, session gone;
 * - otherwise `lastSeen` is stamped with the current time and the key TTL is
 *   reset to the smaller of the 30-minute idle window and whatever remains
 *   of the 12-hour absolute window.
 *
 * A missing key, malformed JSON or a record with unexpected field types all
 * count as "no session" and clean the key up, so a corrupt record can never
 * authenticate a request.
 */
export class RedisSessionReader implements SessionStore {
  private client?: SessionRedis;

  /**
   * `connect` is invoked lazily on the first read so an idle service (or a
   * test) never opens a socket. Each reader owns exactly one connection.
   */
  constructor(private readonly connect: () => SessionRedis) {}

  async read(token: string): Promise<SessionClaims | null> {
    if (typeof token !== 'string' || token.length === 0) {
      return null;
    }
    const key = SESSION_KEY_PREFIX + token;
    const client = this.getClient();

    const raw = await client.get(key);
    if (raw === null) {
      return null;
    }

    const claims = parseClaims(raw);
    if (claims === null) {
      await client.del(key);
      return null;
    }

    const now = Date.now();
    if (now - claims.issuedAt >= MAX_SESSION_AGE_MS) {
      await client.del(key);
      return null;
    }

    const refreshed: SessionClaims = { ...claims, lastSeen: now };
    const remaining = MAX_SESSION_AGE_MS - (now - claims.issuedAt);
    const ttlMs = Math.min(IDLE_TIMEOUT_MS, remaining);
    await client.set(key, JSON.stringify(refreshed), 'PX', Math.max(1, Math.ceil(ttlMs)));
    return refreshed;
  }

  /** Releases the connection when the owning container shuts down. */
  async onModuleDestroy(): Promise<void> {
    const client = this.client;
    this.client = undefined;
    if (client === undefined) {
      return;
    }
    try {
      await client.quit();
    } catch {
      // The socket is already gone; there is nothing left to release.
    }
  }

  private getClient(): SessionRedis {
    if (this.client === undefined) {
      this.client = this.connect();
    }
    return this.client;
  }
}

/** Builds a reader that dials `redisUrl` on first use (empty = localhost). */
export function createSessionReader(redisUrl: string): RedisSessionReader {
  const url = redisUrl.trim();
  const options = { connectTimeout: 3000, maxRetriesPerRequest: 2 };
  return new RedisSessionReader(() => (url === '' ? new Redis(options) : new Redis(url, options)));
}

/** Validates a stored record; anything unexpected means "no session". */
function parseClaims(raw: string): SessionClaims | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const candidate = parsed as Partial<SessionClaims>;
  if (typeof candidate.employeeId !== 'string' || candidate.employeeId.length === 0) {
    return null;
  }
  if (candidate.role !== 'employee' && candidate.role !== 'hrd') {
    return null;
  }
  if (typeof candidate.mustChangePassword !== 'boolean') {
    return null;
  }
  if (typeof candidate.lastSeen !== 'number' || !Number.isFinite(candidate.lastSeen)) {
    return null;
  }
  if (typeof candidate.issuedAt !== 'number' || !Number.isFinite(candidate.issuedAt)) {
    return null;
  }

  return {
    employeeId: candidate.employeeId,
    role: candidate.role,
    mustChangePassword: candidate.mustChangePassword,
    lastSeen: candidate.lastSeen,
    issuedAt: candidate.issuedAt,
  };
}
