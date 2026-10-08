import type { ProfileChangedEvent } from '../stream/profile-changed.event';

/** Centrifugo channel every banner projection is published to. */
export const ALERT_CHANNEL = 'hrd:alerts';

/**
 * One banner payload. The field set is fixed: password changes carry only
 * `passwordChanged: true` and never a `before`/`after` pair, everything
 * else may carry the (already redacted) before/after snapshots.
 */
export interface AlertProjection {
  /** The originating event id; clients deduplicate banners on it. */
  alertId: string;
  employeeId: string;
  employeeName: string;
  changedFields: string[];
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  passwordChanged: boolean;
  /** Event time, ISO 8601. */
  occurredAt: string;
}

/** The slice of a `profile_change_log` row the projection is rebuilt from. */
export interface AlertLogRow {
  event_id: string;
  employee_id: string;
  employee_name: string;
  changed_fields: string[] | null;
  before_values: unknown;
  after_values: unknown;
  occurred_at: Date;
}

/** Anything able to push one projection to the realtime gateway. */
export interface AlertPublisher {
  publish(projection: AlertProjection): Promise<void>;
}

/** Narrowing helper: only plain objects qualify as before/after payloads. */
function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined || value === null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

interface ProjectionParts {
  alertId: string;
  employeeId: string;
  employeeName: string;
  changedFields: string[];
  before: Record<string, unknown> | undefined;
  after: Record<string, unknown> | undefined;
  passwordChanged: boolean;
  occurredAt: string;
}

/**
 * Assembles the payload with one invariant: password changes drop
 * `before`/`after` entirely (the keys must be absent, not undefined), and
 * every other payload includes them only when a snapshot exists.
 */
function assemble(parts: ProjectionParts): AlertProjection {
  return {
    alertId: parts.alertId,
    employeeId: parts.employeeId,
    employeeName: parts.employeeName,
    changedFields: parts.changedFields,
    ...(parts.before === undefined ? {} : { before: parts.before }),
    ...(parts.after === undefined ? {} : { after: parts.after }),
    passwordChanged: parts.passwordChanged,
    occurredAt: parts.occurredAt,
  };
}

/**
 * Projects a validated wire event onto the banner payload.
 *
 * The event has already passed the parser that strips secret-looking keys
 * and drops before/after for password changes, so this is a field rename;
 * the password guard is repeated here so the projection stays safe even if
 * a future caller hands over an unvalidated event.
 */
export function projectAlert(event: ProfileChangedEvent): AlertProjection {
  return assemble({
    alertId: event.eventId,
    employeeId: event.subject.id,
    employeeName: event.subject.name,
    changedFields: [...event.changedFields],
    before: event.passwordChanged ? undefined : event.before,
    after: event.passwordChanged ? undefined : event.after,
    passwordChanged: event.passwordChanged,
    occurredAt: event.occurredAt,
  });
}

/**
 * Rebuilds the banner payload from a persisted log row — the path the
 * pull-fallback endpoint serves when a realtime push was missed.
 *
 * A row counts as a password change when the changed-fields list says so or
 * when it carries the `password_changed` marker that the log writer stores
 * in place of an after-snapshot; either way `before`/`after` stay out of
 * the response.
 */
export function projectAlertFromLogRow(row: AlertLogRow): AlertProjection {
  const changedFields = row.changed_fields ?? [];
  const after = asRecord(row.after_values);
  const passwordChanged =
    changedFields.includes('password') || after?.password_changed === true;
  return assemble({
    alertId: row.event_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    changedFields: [...changedFields],
    before: passwordChanged ? undefined : asRecord(row.before_values),
    after: passwordChanged ? undefined : after,
    passwordChanged,
    occurredAt: row.occurred_at.toISOString(),
  });
}
