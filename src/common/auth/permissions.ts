/**
 * Canonical role → permission-code map used by every request guard.
 *
 * Exactly two roles exist:
 *
 * - `employee` is self-service only: read/update the signed-in person's own
 *   profile, change their own password, punch attendance, read their own
 *   summary.
 * - `hrd` is a superset — employee ∪ admin. It repeats the five employee
 *   codes verbatim and adds the administration codes (employee CRUD, reading
 *   everybody's attendance) plus `hrd:receive_popups` for realtime popups.
 *
 * The union is written out explicitly instead of being assembled at runtime
 * so a side-by-side diff of the two lists shows exactly which codes are
 * admin-only. Look-ups are default deny: an unknown role resolves to no
 * codes at all.
 */

/** The two roles a session claim can carry. */
export type Role = 'employee' | 'hrd';

/** Role → permission codes, in a stable order so the lists diff cleanly. */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  employee: [
    'profile:read_own',
    'profile:update_own',
    'password:change_own',
    'attendance:punch',
    'summary:read_own',
  ],
  hrd: [
    'profile:read_own',
    'profile:update_own',
    'password:change_own',
    'attendance:punch',
    'summary:read_own',
    'employee:read',
    'employee:create',
    'employee:update',
    'attendance:read_all',
    'hrd:receive_popups',
  ],
};

/** Codes granted to `role`; unknown roles receive none (default deny). */
export function permissionsForRole(role: string): readonly string[] {
  return ROLE_PERMISSIONS[role as Role] ?? [];
}
