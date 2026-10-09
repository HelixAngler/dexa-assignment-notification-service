import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { ALERT_FEED, type AlertFeed } from './alerts/alert.feed';
import { createCentrifugoAlertPublisher } from './alerts/centrifugo.publisher';
import { config, splitBrokers } from './config';
import { logIdleClientErrors } from './common/pg.pool-errors';
import { createKafkaOutboxPublisher } from './outbox/kafka.publisher';
import { OutboxPoller } from './outbox/outbox.poller';
import { createKafkaEventStream } from './stream/kafka.event.stream';
import { ProfileChangeLogConsumer } from './stream/log.consumer';
import { createProfileChangeLogStore } from './stream/profile-change-log.store';
import { SESSION_STORE, type SessionStore } from './common/auth/session.reader';

/** Object shape of a provider that also wants a shutdown callback. */
interface OptionallyClosable {
  onModuleDestroy?(): Promise<void> | void;
}

/**
 * Owns the profile-change delivery pipeline: the transactional-outbox
 * poller that drains committed changes into the broker, the stream
 * consumer that turns them into log rows plus banner pushes, and every
 * connection they hold.
 *
 * Startup is gated on the deployment mode: while tests drive the poller
 * and consumer directly, nothing here starts, so a test process never
 * competes with a running service for outbox rows or consumer-group
 * offsets. Outside tests the poller begins sweeping immediately while the
 * consumer joins its group in the background — a broker that is not up
 * yet is retried with a backoff instead of blocking boot.
 *
 * Shutdown is strictly ordered: stop producing first, then drain the
 * consumer, then end the broker sessions, and only then close the
 * databases, so no teardown step can race an operation that is still
 * using its resource.
 */
@Injectable()
export class Pipeline implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Pipeline.name);

  private readonly mainPool = logIdleClientErrors(
    new Pool({
      connectionString: config.databaseUrlMain,
      max: 4,
    }),
    'outbox pool',
  );
  private readonly outboxPublisher = createKafkaOutboxPublisher({
    brokers: splitBrokers(config.brokerBrokers),
  });
  private readonly poller = new OutboxPoller({
    pool: this.mainPool,
    publisher: this.outboxPublisher,
  });
  private readonly logStore = createProfileChangeLogStore(config);
  private readonly alertPush = createCentrifugoAlertPublisher({
    url: config.centrifugoUrl,
    apiKey: config.centrifugoApiKey,
  });
  private readonly eventStream = createKafkaEventStream({
    brokers: splitBrokers(config.brokerBrokers),
    groupId: 'notification-service-log',
  });
  private readonly consumer = new ProfileChangeLogConsumer({
    stream: this.eventStream,
    store: this.logStore,
    alerts: this.alertPush,
  });

  constructor(
    @Inject(ALERT_FEED) private readonly feed: AlertFeed,
    @Inject(SESSION_STORE) private readonly sessions: SessionStore,
  ) {}

  async onModuleInit(): Promise<void> {
    if (config.nodeEnv === 'test') {
      return;
    }
    this.poller.start();
    // Background on purpose: the stream session retries a broker that is
    // still coming up, so a boot-time outage must not fail the whole app.
    this.consumer.start().catch((error: unknown) => {
      this.logger.error(`profile.changed consumer failed to start: ${describe(error)}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.poller.stop().catch((error: unknown) => {
      this.logger.error(`outbox poller did not stop cleanly: ${describe(error)}`);
    });
    await this.consumer.stop().catch((error: unknown) => {
      this.logger.error(`log consumer did not drain cleanly: ${describe(error)}`);
    });
    await this.eventStream.disconnect().catch((error: unknown) => {
      this.logger.error(`event stream did not close cleanly: ${describe(error)}`);
    });
    await this.outboxPublisher.disconnect().catch((error: unknown) => {
      this.logger.error(`outbox publisher did not close cleanly: ${describe(error)}`);
    });
    await this.logStore.close().catch((error: unknown) => {
      this.logger.error(`log store did not close cleanly: ${describe(error)}`);
    });
    await this.feed.close().catch((error: unknown) => {
      this.logger.error(`alert feed did not close cleanly: ${describe(error)}`);
    });
    await this.mainPool.end().catch((error: unknown) => {
      this.logger.error(`outbox pool did not close cleanly: ${describe(error)}`);
    });
    // The session store is its own provider; closing it here as well keeps
    // teardown complete even if a hosting module skips lifecycle hooks.
    await Promise.resolve((this.sessions as OptionallyClosable).onModuleDestroy?.()).catch(
      (error: unknown) => {
        this.logger.error(`session store did not close cleanly: ${describe(error)}`);
      },
    );
  }
}

/** Renders any thrown value as a short loggable string. */
function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
