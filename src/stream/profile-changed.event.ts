/**
 * Wire format of the profile-change stream event and the guards applied to it.
 *
 * Every consumer of this topic — the log writer above all — may assume that
 * an event parsed here is complete, correctly typed and free of secret
 * material: password changes arrive as the bare fact that a password changed,
 * and any secret-looking key that survives in a before/after payload is
 * dropped on the way in. Parsing is therefore the single choke point for data
 * entering the service from the broker.
 */

/** Topic the outbox poller produces to and the log consumer reads from. */
export const PROFILE_CHANGED_TOPIC = 'profile.changed';

/** Discriminator every envelope on the topic carries. */
export const PROFILE_CHANGED_EVENT_TYPE = 'profile.changed';

/** The two roles an actor can hold. */
export type ActorRole = 'employee' | 'hrd';

/** One profile-change event, as it travels on the wire. */
export interface ProfileChangedEvent {
  /** Stable event identifier; the idempotency key end to end. */
  eventId: string;
  type: typeof PROFILE_CHANGED_EVENT_TYPE;
  /** Server time of the change, ISO 8601. */
  occurredAt: string;
  actor: { id: string; role: ActorRole };
  subject: { id: string; email: string; name: string };
  changedFields: string[];
  /** Absent for password changes and whenever nothing non-secret is left. */
  before?: Record<string, unknown>;
  /** Absent for password changes and whenever nothing non-secret is left. */
  after?: Record<string, unknown>;
  passwordChanged: boolean;
}

/**
 * Key names that must never carry a value out of a profile change: anything
 * password- or hash-shaped, plus the usual names for secrets, credentials
 * and their salt. Matching happens case-insensitively on the key only, so
 * the word "password" stays usable as an enumeration value.
 */
const SECRET_KEY_PATTERN = /(pass|pwd|hash|secret|token|credential|salt)/i;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Deep-copies a payload without any secret-looking key.
 *
 * An object that ends up empty is reported as `undefined` so callers can
 * leave the field out of the payload entirely rather than emitting `{}`.
 * Arrays inside keep their shape: their elements are scrubbed individually
 * and primitives stay as they are.
 */
export function stripSecretValues(value: Record<string, unknown>): Record<string, unknown> | undefined {
  return scrub(value, 0) as Record<string, unknown> | undefined;
}

function scrub(value: unknown, depth: number): unknown {
  if (depth > 16 || value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => scrub(entry, depth + 1));
  }
  const cleaned: Record<string, unknown> = {};
  let kept = false;
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      continue;
    }
    const scrubbed = scrub(entry, depth + 1);
    if (scrubbed === undefined) {
      continue;
    }
    cleaned[key] = scrubbed;
    kept = true;
  }
  return kept ? cleaned : undefined;
}

function fail(reason: string): never {
  throw new Error(`invalid profile.change event: ${reason}`);
}

function requiredString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== 'string' || value.length === 0) {
    fail(`field "${key}" must be a non-empty string`);
  }
  return value;
}

function requiredUuid(source: Record<string, unknown>, key: string): string {
  const value = requiredString(source, key);
  if (!UUID_PATTERN.test(value)) {
    fail(`field "${key}" must be a uuid`);
  }
  return value;
}

function optionalValues(
  source: Record<string, unknown>,
  key: string,
  passwordChanged: boolean,
): Record<string, unknown> | undefined {
  if (passwordChanged) {
    return undefined;
  }
  const raw = source[key];
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    fail(`field "${key}" must be an object when present`);
  }
  return stripSecretValues(raw as Record<string, unknown>);
}

/**
 * Parses one raw payload into a validated event.
 *
 * Validation rejects anything that could not be persisted or projected
 * later (missing ids, unknown actor role, unparseable timestamp), which lets
 * the consumer log and skip a malformed record instead of failing on it.
 * Redaction happens here as well: password events lose their before/after
 * payloads completely and every other payload is scrubbed of secret-looking
 * keys.
 */
export function parseProfileChangedEvent(raw: Buffer | string): ProfileChangedEvent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf8'));
  } catch {
    fail('payload is not valid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    fail('payload must be a JSON object');
  }
  const source = parsed as Record<string, unknown>;

  if (source.type !== PROFILE_CHANGED_EVENT_TYPE) {
    fail(`field "type" must be "${PROFILE_CHANGED_EVENT_TYPE}"`);
  }

  const actor = source.actor;
  if (typeof actor !== 'object' || actor === null || Array.isArray(actor)) {
    fail('field "actor" must be an object');
  }
  const actorSource = actor as Record<string, unknown>;
  const role = actorSource.role;
  if (role !== 'employee' && role !== 'hrd') {
    fail('field "actor.role" must be "employee" or "hrd"');
  }
  const actorRole = role as ActorRole;

  const subject = source.subject;
  if (typeof subject !== 'object' || subject === null || Array.isArray(subject)) {
    fail('field "subject" must be an object');
  }
  const subjectSource = subject as Record<string, unknown>;

  const changedFields = source.changedFields;
  if (!Array.isArray(changedFields) || changedFields.length === 0) {
    fail('field "changedFields" must be a non-empty array');
  }
  if (!changedFields.every((entry) => typeof entry === 'string' && entry.length > 0)) {
    fail('field "changedFields" must contain non-empty strings');
  }

  const occurredRaw = requiredString(source, 'occurredAt');
  const occurred = Date.parse(occurredRaw);
  if (!Number.isFinite(occurred)) {
    fail('field "occurredAt" must be an ISO 8601 timestamp');
  }

  const passwordChanged =
    source.passwordChanged === true || changedFields.includes('password');

  return {
    eventId: requiredUuid(source, 'eventId'),
    type: PROFILE_CHANGED_EVENT_TYPE,
    occurredAt: new Date(occurred).toISOString(),
    actor: { id: requiredUuid(actorSource, 'id'), role: actorRole },
    subject: {
      id: requiredUuid(subjectSource, 'id'),
      email: requiredString(subjectSource, 'email'),
      name: requiredString(subjectSource, 'name'),
    },
    changedFields: [...changedFields] as string[],
    before: optionalValues(source, 'before', passwordChanged),
    after: optionalValues(source, 'after', passwordChanged),
    passwordChanged,
  };
}
