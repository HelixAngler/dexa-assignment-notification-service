import { Logger } from '@nestjs/common';
import type { AlertPublisher } from '../alerts/alert.projection';
import { projectAlert } from '../alerts/alert.projection';
import type { ProfileChangeLogStore } from './profile-change-log.store';
import {
  parseProfileChangedEvent,
  type ProfileChangedEvent,
} from './profile-changed.event';

/**
 * Raw payload delivery boundary between a broker stream and the consumer.
 * Implementations hand every received payload to the handler in arrival
 * order and resolve only once the handler is done.
 */
export interface ProfileChangedEventStream {
  subscribe(handler: (raw: Buffer) => Promise<void>): Promise<void>;
  disconnect(): Promise<void>;
}

/** Everything the log consumer needs to do its job. */
export interface LogConsumerDeps {
  /** Omitted for direct-delivery setups that call `handleMessage` themselves. */
  stream?: ProfileChangedEventStream;
  store: ProfileChangeLogStore;
  alerts: AlertPublisher;
}

/**
 * Turns `profile.changed` deliveries into exactly one log row and one
 * banner push per event:
 *
 * 1. the payload is parsed — the parser validates the envelope and strips
 *    secret material, and a malformed payload is logged and skipped rather
 *    than allowed to wedge the stream;
 * 2. the log row is upserted on the unique event id, which makes duplicate
 *    deliveries no-ops and is the durability point of the pipeline;
 * 3. the projection is pushed to the realtime gateway — only after the row
 *    is committed, so a push failure can never lose data: the row stays,
 *    the failure is logged, and the pull-fallback endpoint keeps serving
 *    the alert.
 *
 * A store failure is rethrown on purpose: the delivery is then retried by
 * the stream instead of being acknowledged without its row.
 */
export class ProfileChangeLogConsumer {
  private readonly logger = new Logger(ProfileChangeLogConsumer.name);

  /** Tail of the message queue; `stop` awaits it to drain in-flight work. */
  private tail: Promise<void> = Promise.resolve();
  private subscribed = false;

  constructor(private readonly deps: LogConsumerDeps) {}

  /** Subscribes to the event stream and starts consuming. Idempotent. */
  async start(): Promise<void> {
    if (this.subscribed) {
      return;
    }
    if (this.deps.stream === undefined) {
      throw new Error('log consumer has no event stream to subscribe to');
    }
    await this.deps.stream.subscribe((raw) => this.handleMessage(raw));
    this.subscribed = true;
  }

  /** Waits for the message currently being processed, if any. */
  async stop(): Promise<void> {
    await this.tail;
  }

  /**
   * Processes one raw delivery. Calls are serialized so a later message
   * never overtakes an earlier one and `stop` can drain precisely.
   */
  handleMessage(raw: Buffer | string): Promise<void> {
    const next = this.tail.then(() => this.process(raw));
    this.tail = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  private async process(raw: Buffer | string): Promise<void> {
    let event: ProfileChangedEvent;
    try {
      event = parseProfileChangedEvent(raw);
    } catch (error) {
      this.logger.warn(`skipping malformed profile.changed payload: ${describe(error)}`);
      return;
    }

    await this.deps.store.upsert(event);

    try {
      await this.deps.alerts.publish(projectAlert(event));
    } catch (error) {
      // The row is already durable; the banner still surfaces through the
      // recent-alerts pull fallback, so a gateway outage is logged, not fatal.
      this.logger.error(`alert push failed for ${event.eventId}: ${describe(error)}`);
    }
  }
}

/** Renders any thrown value as a short loggable string. */
function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
