import type { ProfileChangedEvent } from '../stream/profile-changed.event';
import { PROFILE_CHANGED_EVENT_TYPE, stripSecretValues } from '../stream/profile-changed.event';

/**
 * One pending row of the transactional outbox, already joined with the
 * employee snapshot the envelope needs.
 */
export interface OutboxRow {
  id: string;
  employeeId: string;
  actorId: string;
  actorRole: 'employee' | 'hrd';
  changedFields: string[];
  beforeValues: Record<string, unknown> | null;
  afterValues: Record<string, unknown> | null;
  occurredAt: Date;
  employeeEmail: string;
  employeeName: string;
}

/**
 * Turns a claimed outbox row into the event that goes on the wire.
 *
 * The envelope carries the employee snapshot the row points at, and the
 * before/after payloads are scrubbed exactly like the consumer scrubs them
 * on the way in: a password change publishes only the fact that it happened,
 * and any other payload is stripped of secret-looking keys. The result is
 * therefore safe to publish even if the writer of the outbox row put more in
 * the columns than it should have.
 */
export function buildProfileChangedEvent(row: OutboxRow): ProfileChangedEvent {
  const passwordChanged = row.changedFields.includes('password');
  const before = passwordChanged ? undefined : stripSecretValues(row.beforeValues ?? {});
  const after = passwordChanged ? undefined : stripSecretValues(row.afterValues ?? {});

  return {
    eventId: row.id,
    type: PROFILE_CHANGED_EVENT_TYPE,
    occurredAt: row.occurredAt.toISOString(),
    actor: { id: row.actorId, role: row.actorRole },
    subject: { id: row.employeeId, email: row.employeeEmail, name: row.employeeName },
    changedFields: [...row.changedFields],
    ...(before === undefined ? {} : { before }),
    ...(after === undefined ? {} : { after }),
    passwordChanged,
  };
}
