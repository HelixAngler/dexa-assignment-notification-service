import { ALERT_CHANNEL, type AlertProjection, type AlertPublisher } from './alert.projection';

/** Options describing where the realtime gateway listens and how to reach it. */
export interface CentrifugoAlertPublisherOptions {
  /** Base URL of the gateway, e.g. `http://centrifugo:8000`. */
  url: string;
  /** API key sent as the `x-api-key` header on every request. */
  apiKey: string;
  /** Injectable fetch for tests; defaults to the platform fetch. */
  fetchImpl?: typeof fetch;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number;
}

/** Attempts made against the gateway before a publish is treated as failed. */
const PUBLISH_ATTEMPTS = 3;

/** Base delay between attempts; grows linearly (200 ms, 400 ms). */
const RETRY_DELAY_MS = 200;

/** Default per-request timeout so a wedged gateway cannot stall a consumer. */
const DEFAULT_TIMEOUT_MS = 5_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Publisher that pushes projections to Centrifugo's HTTP publish API.
 *
 * Each publish is attempted a few times with a short backoff so a blip on
 * the gateway does not immediately degrade a banner; after the last failed
 * attempt the error is surfaced to the caller, which decides what "push
 * lost" means for the consumer (the persisted log row plus the
 * `GET /alerts/recent` pull fallback keep the alert recoverable either way).
 */
export function createCentrifugoAlertPublisher(
  options: CentrifugoAlertPublisherOptions,
): AlertPublisher {
  const endpoint = `${options.url.replace(/\/+$/, '')}/api/publish`;
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async publish(projection: AlertProjection): Promise<void> {
      let lastError: unknown = new Error('publish was never attempted');
      for (let attempt = 1; attempt <= PUBLISH_ATTEMPTS; attempt += 1) {
        try {
          const response = await fetchImpl(endpoint, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': options.apiKey,
            },
            body: JSON.stringify({ channel: ALERT_CHANNEL, data: projection }),
            signal: AbortSignal.timeout(timeoutMs),
          });
          if (!response.ok) {
            throw new Error(`realtime gateway answered HTTP ${response.status}`);
          }
          return;
        } catch (error) {
          lastError = error;
          if (attempt < PUBLISH_ATTEMPTS) {
            await delay(RETRY_DELAY_MS * attempt);
          }
        }
      }
      throw lastError instanceof Error ? lastError : new Error(String(lastError));
    },
  };
}
