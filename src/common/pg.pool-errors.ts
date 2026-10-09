import type { Pool } from 'pg';

/**
 * Registers the failure handler a `pg` pool needs so a database restart
 * cannot take the process down.
 *
 * A pool forwards the error of an idle client that died (server restart,
 * dropped connection, network blip) by emitting `error` on itself, and
 * EventEmitter throws any `error` event left without a listener. The first
 * idle-client failure would therefore end up as an uncaught exception even
 * though the pool had already discarded the broken client.
 *
 * The handler logs the failure under the pool's identity and swallows it:
 * the pool keeps running and the next query checks out a fresh connection.
 * Nothing is rethrown, so callers keep their own retry behaviour.
 *
 * Returns the same pool so construction can be wrapped in place.
 */
export function logIdleClientErrors(pool: Pool, identity: string): Pool {
  pool.on('error', (error: Error) => {
    console.error(`${identity} idle client error handled: ${error.message}`);
  });
  return pool;
}
