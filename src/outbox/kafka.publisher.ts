import { Kafka, logLevel } from 'kafkajs';
import type { ISocketFactory, Producer } from 'kafkajs';
import type { ProfileChangedEvent } from '../stream/profile-changed.event';
import { PROFILE_CHANGED_TOPIC } from '../stream/profile-changed.event';
import type { OutboxPublisher } from './outbox.poller';

// The default (v2) partitioner is intentional — keyed messages of one
// employee land on one partition, which preserves per-employee order — so
// the library's one-time notice about the switch is silenced via the
// environment knob KafkaJS documents for exactly this purpose.
process.env.KAFKAJS_NO_PARTITIONER_WARNING ??= '1';

/** Options for the broker-backed outbox publisher. */
export interface KafkaOutboxPublisherOptions {
  brokers: string[];
  socketFactory?: ISocketFactory;
  clientId?: string;
  /** Defaults to `profile.changed`. */
  topic?: string;
}

/** Publisher with an explicit teardown hook the poller's owner can call. */
export interface KafkaOutboxPublisher extends OutboxPublisher {
  disconnect(): Promise<void>;
}

/**
 * Producer that writes `profile.changed` envelopes to the broker.
 *
 * The producer connection is opened lazily on the first publish and
 * reused afterwards, so building a publisher never touches the network —
 * useful in environments that only assemble the object. Each publish
 * resolves once the broker has acknowledged the record; a rejection means
 * the event is *not* on the broker and the outbox row must stay
 * unpublished for the next sweep to retry.
 */
export function createKafkaOutboxPublisher(options: KafkaOutboxPublisherOptions): KafkaOutboxPublisher {
  const kafka = new Kafka({
    clientId: options.clientId ?? 'notification-service-outbox',
    brokers: options.brokers,
    logLevel: logLevel.WARN,
    ...(options.socketFactory === undefined ? {} : { socketFactory: options.socketFactory }),
  });
  const topic = options.topic ?? PROFILE_CHANGED_TOPIC;

  let producer: Producer | undefined;
  let connecting: Promise<Producer> | undefined;

  function getProducer(): Promise<Producer> {
    if (producer !== undefined) {
      return Promise.resolve(producer);
    }
    if (connecting === undefined) {
      const instance = kafka.producer();
      connecting = instance
        .connect()
        .then(() => {
          producer = instance;
          return instance;
        })
        .catch((error: unknown) => {
          connecting = undefined;
          throw error;
        });
    }
    return connecting;
  }

  return {
    async publish(event: ProfileChangedEvent): Promise<void> {
      const active = await getProducer();
      await active.send({
        topic,
        // Keyed by subject so all events of one employee share a partition.
        messages: [{ key: event.subject.id, value: JSON.stringify(event) }],
      });
    },

    async disconnect(): Promise<void> {
      if (connecting !== undefined) {
        try {
          await connecting;
        } catch {
          // The connection attempt already failed; nothing to release.
        }
      }
      connecting = undefined;
      const active = producer;
      producer = undefined;
      if (active !== undefined) {
        try {
          await active.disconnect();
        } catch {
          // The socket is already gone.
        }
      }
    },
  };
}
