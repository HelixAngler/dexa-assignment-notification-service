import { Pool } from 'pg';
import { logIdleClientErrors } from '../src/common/pg.pool-errors';

/**
 * Idle-client failures on a `pg` pool surface as an `error` event on the
 * pool itself, which EventEmitter throws when nothing listens for it — a
 * database restart would otherwise end the process mid-run. Every pool the
 * service owns goes through the guard, so both the swallowing behaviour and
 * the identity that makes the log line findable are covered here.
 */
describe('idle client error guard', () => {
  const newPool = (): Pool =>
    new Pool({ connectionString: 'postgres://user:pass@127.0.0.1:1/never-reached' });

  it('logs the failure with the pool identity and lets the process carry on', () => {
    const pool = newPool();
    const lines: string[] = [];
    const capture = jest
      .spyOn(console, 'error')
      .mockImplementation((...args: unknown[]) => {
        lines.push(args.map(String).join(' '));
      });

    try {
      logIdleClientErrors(pool, 'alert feed pool');

      expect(() =>
        pool.emit('error', new Error('server closed the connection unexpectedly')),
      ).not.toThrow();
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain('alert feed pool');
      expect(lines[0]).toContain('server closed the connection unexpectedly');
    } finally {
      capture.mockRestore();
    }
  });

  it('shows the failure mode the guard exists for: an unhandled pool error throws', () => {
    const pool = newPool();

    expect(() => pool.emit('error', new Error('connection terminated'))).toThrow(
      'connection terminated',
    );
  });
});
