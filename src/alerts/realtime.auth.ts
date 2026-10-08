import { Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AppException } from '../common/app.exception';
import { GuardedRequest, RequirePermission, SessionGuard } from '../common/auth/session.guard';
import { config } from '../config';
import { ALERT_CHANNEL } from './alert.projection';

/** How long an issued realtime token stays valid, in seconds. */
export const REALTIME_TOKEN_TTL_SECONDS = 600;

/** Body of a successful token response. */
export interface RealtimeAuthResponse {
  token: string;
}

/** Claims a Centrifugo v5 subscription token carries. */
export interface RealtimeTokenClaims {
  /** Single channel this token authorizes. */
  channel: string;
  /** Expiry, seconds since epoch (set by the JWT library). */
  exp?: number;
}

/**
 * Mints a subscription token for one channel.
 *
 * Format follows Centrifugo v5 channel JWT authorization: an HS256
 * signed JWT with `channel` and `exp`, signed with the shared API key so
 * the gateway can verify it with the secret it already holds. No `sub`
 * claim is added: the gateway compares `sub` against the user id of the
 * websocket connection, and the console opens that connection without a
 * connection token — holding this token is what authorizes the channel,
 * and issuing it already required the session permission check.
 */
export function issueRealtimeToken(options: {
  apiKey: string;
  channel?: string;
  ttlSeconds?: number;
}): string {
  if (options.apiKey === '') {
    // HS256 refuses an empty secret; without a key no token can be verified.
    throw new AppException(500, 'INTERNAL');
  }
  return jwt.sign(
    { channel: options.channel ?? ALERT_CHANNEL },
    options.apiKey,
    {
      algorithm: 'HS256',
      expiresIn: options.ttlSeconds ?? REALTIME_TOKEN_TTL_SECONDS,
    },
  );
}

/**
 * Issues the realtime token the HRD browser presents when it subscribes
 * to the banner channel. The session guard enforces the same permission
 * the alert feed does, so a non-HRD session cannot obtain a token for a
 * channel it may not read.
 */
@Controller('realtime')
@UseGuards(SessionGuard)
@RequirePermission('hrd:receive_popups')
export class RealtimeAuthController {
  @Post('auth')
  @HttpCode(200)
  auth(@Req() req: GuardedRequest): RealtimeAuthResponse {
    const session = req.session;
    if (session === undefined) {
      // Unreachable through the guard; kept so the handler never assumes.
      throw new AppException(401, 'AUTH_REQUIRED');
    }
    return {
      token: issueRealtimeToken({
        apiKey: config.centrifugoApiKey,
      }),
    };
  }
}
