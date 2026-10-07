import { CanActivate, ExecutionContext, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppException } from '../app.exception';
import { permissionsForRole } from './permissions';
import { SESSION_STORE, SessionClaims, SessionStore } from './session.reader';

/** Metadata key marking a handler/class as reachable without a session. */
export const PUBLIC_KEY = 'notification:route_public';

/** Metadata key holding the permission code a handler/class demands. */
export const PERMISSION_KEY = 'notification:required_permission';

/** Opens a route to anonymous traffic; the guard returns before session work. */
export function Public(): MethodDecorator & ClassDecorator {
  return SetMetadata(PUBLIC_KEY, true);
}

/** Demands `code` in the session role's permission set, otherwise 403. */
export function RequirePermission(code: string): MethodDecorator & ClassDecorator {
  return SetMetadata(PERMISSION_KEY, code);
}

/** Request shape the guard reads the cookie from and attaches the session to. */
export interface GuardedRequest {
  cookies?: Record<string, string | string[] | undefined>;
  session?: SessionClaims;
}

/**
 * Default-deny session guard. On every request it:
 *
 * 1. passes straight through for `@Public()` routes;
 * 2. reads the HttpOnly `sid` cookie and resolves it against the shared
 *    session store (sliding idle window, absolute age cap, revocation by
 *    deletion — the store applies those rules), answering 401 `AUTH_REQUIRED`
 *    when the cookie is absent or the session is unknown/expired;
 * 3. attaches the fresh claims to the request so handlers never re-read
 *    Redis and always see the current role;
 * 4. enforces the route's `@RequirePermission` code with 403 `FORBIDDEN` on
 *    a miss. A guarded route without a permission code accepts any valid
 *    session.
 *
 * The role comes straight from the session claim — no database lookup — so a
 * role change takes effect as soon as the session itself is refreshed.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SESSION_STORE) private readonly store: SessionStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<GuardedRequest>();
    const cookie = request.cookies?.sid;
    const token = typeof cookie === 'string' && cookie.length > 0 ? cookie : undefined;
    if (token === undefined) {
      throw new AppException(401, 'AUTH_REQUIRED');
    }

    const session = await this.store.read(token);
    if (session === null) {
      throw new AppException(401, 'AUTH_REQUIRED');
    }
    request.session = session;

    const required = this.reflector.getAllAndOverride<string | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (required === undefined) {
      return true;
    }
    if (!permissionsForRole(session.role).includes(required)) {
      throw new AppException(403, 'FORBIDDEN');
    }
    return true;
  }
}
