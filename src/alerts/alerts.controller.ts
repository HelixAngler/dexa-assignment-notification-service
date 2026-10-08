import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { AppException } from '../common/app.exception';
import { RequirePermission, SessionGuard } from '../common/auth/session.guard';
import { ALERT_FEED, type AlertFeed } from './alert.feed';
import type { AlertProjection } from './alert.projection';

/** Response body of the recent-alerts endpoint. */
export interface RecentAlertsResponse {
  alerts: AlertProjection[];
}

/**
 * Pull fallback for the banner stream: an HRD page that loads (or
 * reloads) fetches the alerts it may have missed while the websocket was
 * closed, so a lost push can never hide an alert permanently.
 *
 * `since` selects everything at or after a moment in time; when it is
 * absent the feed answers with its most recent entries instead.
 */
@Controller('alerts')
@UseGuards(SessionGuard)
@RequirePermission('hrd:receive_popups')
export class AlertsController {
  constructor(@Inject(ALERT_FEED) private readonly feed: AlertFeed) {}

  @Get('recent')
  async recent(@Query('since') since?: string): Promise<RecentAlertsResponse> {
    return { alerts: await this.feed.recent(parseSince(since)) };
  }
}

/** Parses the optional `since` query value; absent/blank means "no marker". */
function parseSince(raw: string | undefined): Date | undefined {
  if (raw === undefined || raw.trim() === '') {
    return undefined;
  }
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) {
    throw new AppException(400, 'BAD_REQUEST');
  }
  return new Date(parsed);
}
