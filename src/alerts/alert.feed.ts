import { Pool } from 'pg';
import type { ServiceConfig } from '../config';
import type { AlertLogRow, AlertProjection } from './alert.projection';
import { projectAlertFromLogRow } from './alert.projection';

/** Injection token the controller resolves its feed from. */
export const ALERT_FEED = 'ALERT_FEED';

/** Read side of the log database that backs the pull fallback. */
export interface AlertFeed {
  /**
   * Recent alerts, newest first. With a `since` marker every row at or
   * after it is returned (bounded by a hard cap); without one the feed
   * falls back to the most recent entries so a page load still shows what
   * it missed.
   */
  recent(since: Date | undefined): Promise<AlertProjection[]>;
  close(): Promise<void>;
}

/** How many alerts an unfiltered request returns. */
export const RECENT_ALERTS_DEFAULT_LIMIT = 20;

/** Hard cap for a `since`-bounded request, so the window cannot run away. */
export const RECENT_ALERTS_SINCE_LIMIT = 500;

const SELECT_SQL = `
  SELECT event_id, employee_id, employee_name, changed_fields,
         before_values, after_values, occurred_at
  FROM profile_change_log
  WHERE ($1::timestamptz IS NULL OR occurred_at >= $1)
  ORDER BY occurred_at DESC, event_id DESC
  LIMIT $2
`;

/**
 * Builds a feed over the log database identified by `config.databaseUrlLog`.
 *
 * The pool connects lazily, so constructing a feed never touches the
 * network. Rows are projected back into banner payloads with the same
 * rules the live push uses, including dropping `before`/`after` for
 * password changes.
 */
export function createAlertFeed(config: ServiceConfig): AlertFeed {
  const pool = new Pool({ connectionString: config.databaseUrlLog, max: 4 });

  return {
    async recent(since: Date | undefined): Promise<AlertProjection[]> {
      const limit = since === undefined ? RECENT_ALERTS_DEFAULT_LIMIT : RECENT_ALERTS_SINCE_LIMIT;
      const result = await pool.query<AlertLogRow>(SELECT_SQL, [since ?? null, limit]);
      return result.rows.map(projectAlertFromLogRow);
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}
