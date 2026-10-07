import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppException } from '../src/common/app.exception';
import {
  GuardedRequest,
  Public,
  RequirePermission,
  SessionGuard,
} from '../src/common/auth/session.guard';
import { RedisSessionReader, SessionClaims, SessionStore } from '../src/common/auth/session.reader';
import { FakeRedis } from './fake-redis';

class ProbeController {
  @RequirePermission('hrd:receive_popups')
  hrdOnly(): void {}

  @RequirePermission('attendance:punch')
  punch(): void {}

  @Public()
  open(): void {}

  authenticatedOnly(): void {}
}

function claims(overrides: Partial<SessionClaims> = {}): SessionClaims {
  const now = Date.now();
  return {
    employeeId: 'emp-4',
    role: 'hrd',
    mustChangePassword: false,
    lastSeen: now,
    issuedAt: now,
    ...overrides,
  };
}

function storeReturning(value: SessionClaims | null): SessionStore {
  return { read: jest.fn().mockResolvedValue(value) };
}

function buildContext(
  handler: object,
  cookies?: Record<string, string>,
): { context: ExecutionContext; request: GuardedRequest } {
  const request: GuardedRequest = { cookies };
  const context = {
    getClass: () => ProbeController,
    getHandler: () => handler,
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
  return { context, request };
}

async function captureDenial(
  guard: SessionGuard,
  context: ExecutionContext,
): Promise<AppException> {
  try {
    await guard.canActivate(context);
  } catch (error: unknown) {
    if (error instanceof AppException) {
      return error;
    }
    throw error;
  }
  throw new Error('expected the guard to deny the request');
}

describe('session guard', () => {
  it('lets an hrd session through a route requiring hrd:receive_popups', async () => {
    const session = claims();
    const store = storeReturning(session);
    const guard = new SessionGuard(new Reflector(), store);
    const { context, request } = buildContext(ProbeController.prototype.hrdOnly, {
      sid: 'valid-token',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(store.read).toHaveBeenCalledWith('valid-token');
    expect(request.session).toEqual(session);
  });

  it('denies an employee session the hrd-only popup code with 403 FORBIDDEN', async () => {
    const store = storeReturning(claims({ role: 'employee' }));
    const guard = new SessionGuard(new Reflector(), store);
    const { context, request } = buildContext(ProbeController.prototype.hrdOnly, {
      sid: 'employee-token',
    });

    const error = await captureDenial(guard, context);

    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.getStatus()).toBe(403);
    // The session is attached before authorization so handlers and audits
    // always see who was checked.
    expect(request.session?.role).toBe('employee');
  });

  it('lets an employee session through a route requiring attendance:punch', async () => {
    const guard = new SessionGuard(new Reflector(), storeReturning(claims({ role: 'employee' })));
    const { context } = buildContext(ProbeController.prototype.punch, { sid: 'employee-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('answers 401 AUTH_REQUIRED when the sid cookie is missing', async () => {
    const store = storeReturning(claims());
    const guard = new SessionGuard(new Reflector(), store);
    const { context } = buildContext(ProbeController.prototype.hrdOnly, {});

    const error = await captureDenial(guard, context);

    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTH_REQUIRED');
    expect(store.read).not.toHaveBeenCalled();
  });

  it('answers 401 AUTH_REQUIRED when the cookie holds an empty value', async () => {
    const store = storeReturning(claims());
    const guard = new SessionGuard(new Reflector(), store);
    const { context } = buildContext(ProbeController.prototype.hrdOnly, { sid: '' });

    const error = await captureDenial(guard, context);

    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTH_REQUIRED');
    expect(store.read).not.toHaveBeenCalled();
  });

  it('answers 401 AUTH_REQUIRED when the store knows no such session', async () => {
    const guard = new SessionGuard(new Reflector(), storeReturning(null));
    const { context } = buildContext(ProbeController.prototype.hrdOnly, { sid: 'revoked' });

    const error = await captureDenial(guard, context);

    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTH_REQUIRED');
  });

  it('answers 401 AUTH_REQUIRED once the absolute session age has elapsed', async () => {
    const redis = new FakeRedis();
    const token = 'aged-out-token';
    redis.values.set(
      `sess:${token}`,
      JSON.stringify(claims({ issuedAt: Date.now() - 13 * 60 * 60 * 1000 })),
    );
    const guard = new SessionGuard(new Reflector(), new RedisSessionReader(() => redis));
    const { context } = buildContext(ProbeController.prototype.hrdOnly, { sid: token });

    const error = await captureDenial(guard, context);

    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTH_REQUIRED');
    expect(redis.values.has(`sess:${token}`)).toBe(false);
  });

  it('passes a @Public route without reading a session at all', async () => {
    const store = storeReturning(null);
    const guard = new SessionGuard(new Reflector(), store);
    const { context, request } = buildContext(ProbeController.prototype.open);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(store.read).not.toHaveBeenCalled();
    expect(request.session).toBeUndefined();
  });

  it('accepts any valid session on a guarded route without a permission code', async () => {
    const guard = new SessionGuard(new Reflector(), storeReturning(claims({ role: 'employee' })));
    const { context } = buildContext(ProbeController.prototype.authenticatedOnly, {
      sid: 'employee-token',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
