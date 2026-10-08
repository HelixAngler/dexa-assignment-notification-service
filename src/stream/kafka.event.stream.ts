import { Kafka, logLevel } from 'kafkajs';
import type { Consumer, ISocketFactory } from 'kafkajs';
import type { ProfileChangedEventStream } from './log.consumer';
import { PROFILE_CHANGED_TOPIC } from './profile-changed.event';

/** Options for the broker-backed stream. */
export interface KafkaEventStreamOptions {
  /** Broker list, e.g. `['redpanda:9092']`. */
  brokers: string[];
  /** Consumer group id; each group reads the topic independently. */
  groupId: string;
  /** Socket factory override for hosts whose advertised names need mapping. */
  socketFactory?: ISocketFactory;
  clientId?: string;
  /** Defaults to `profile.changed`. */
  topic?: string;
  /**
   * Read from the earliest offset when the group has no committed position
   * (default true) so a freshly created group still sees the backlog that
   * accumulated while nothing was consuming.
   */
  fromBeginning?: boolean;
}

/** First delay after a failed session, doubled up to the cap. */
const INITIAL_BACKOFF_MS = 500;

/** Upper bound for the rebuild backoff so retries never stop arriving. */
const MAX_BACKOFF_MS = 15_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Kafka-backed implementation of the event stream.
 *
 * Consumption is maintained by a session loop:
 *
 * - a session connects, subscribes, runs the consumer and resolves when
 *   the session must be rebuilt (the broker crashed us out with
 *   `restart: false`, or `run` itself failed);
 * - retriable failures are restarted *inside* KafkaJS (it re-joins the
 *   group and re-reads from the last committed offset), so no delivery is
 *   skipped while the broker is flapping;
 * - rebuilds after a hard crash happen here with a capped backoff, and
 *   `subscribe` resolves only once the group has actually been joined, so
 *   callers know deliveries can flow;
 * - `disconnect` ends the loop, tears the consumer down, and releases a
 *   `subscribe` that was still waiting for its first join.
 */
export function createKafkaEventStream(options: KafkaEventStreamOptions): ProfileChangedEventStream {
  const kafka = new Kafka({
    clientId: options.clientId ?? 'notification-service-log',
    brokers: options.brokers,
    logLevel: logLevel.WARN,
    ...(options.socketFactory === undefined ? {} : { socketFactory: options.socketFactory }),
  });
  const topic = options.topic ?? PROFILE_CHANGED_TOPIC;
  const fromBeginning = options.fromBeginning ?? true;

  let handler: ((raw: Buffer) => Promise<void>) | undefined;
  let closed = false;
  let ready: Promise<void> = Promise.resolve();
  let signalReady: () => void = () => {};
  let readySettled = false;
  let wakeSession: () => void = () => {};
  let sessionLoop: Promise<void> | undefined;
  let backoff = INITIAL_BACKOFF_MS;

  function buildConsumer(): Consumer {
    const instance = kafka.consumer({ groupId: options.groupId });
    instance.on(instance.events.GROUP_JOIN, () => {
      backoff = INITIAL_BACKOFF_MS;
      if (!readySettled) {
        readySettled = true;
        signalReady();
      }
    });
    instance.on(instance.events.CRASH, (event) => {
      if (event.payload.restart !== true) {
        // KafkaJS gave up on this instance; the session loop builds a new one.
        wakeSession();
      }
    });
    return instance;
  }

  async function runSession(): Promise<void> {
    const instance = buildConsumer();
    let finish: () => void = () => {};
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    wakeSession = finish;

    try {
      await instance.connect();
      await instance.subscribe({ topic, fromBeginning });
      instance.run({
        eachMessage: async ({ message }) => {
          if (message.value === null || handler === undefined) {
            return;
          }
          await handler(message.value);
        },
      }).catch((error: unknown) => {
        console.error(`profile.changed consumer run failed: ${describe(error)}`);
        wakeSession();
      });
      if (closed) {
        wakeSession();
      }
      await finished;
    } finally {
      wakeSession = () => {};
      try {
        await instance.disconnect();
      } catch {
        // The instance is already down; there is nothing left to release.
      }
    }
  }

  async function maintain(): Promise<void> {
    while (!closed) {
      try {
        await runSession();
      } catch (error) {
        if (closed) {
          return;
        }
        console.error(`profile.changed stream session failed: ${describe(error)}`);
      }
      if (closed) {
        return;
      }
      const wait = backoff;
      backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      await sleep(wait);
    }
  }

  return {
    async subscribe(next: (raw: Buffer) => Promise<void>): Promise<void> {
      if (handler !== undefined) {
        throw new Error('event stream already subscribed');
      }
      handler = next;
      closed = false;
      readySettled = false;
      ready = new Promise<void>((resolve) => {
        signalReady = resolve;
      });
      sessionLoop = maintain();
      await ready;
    },

    async disconnect(): Promise<void> {
      closed = true;
      if (!readySettled) {
        readySettled = true;
        signalReady();
      }
      wakeSession();
      const loop = sessionLoop;
      sessionLoop = undefined;
      if (loop !== undefined) {
        await loop.catch(() => undefined);
      }
    },
  };
}

/** Renders any thrown value as a short loggable string. */
function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
