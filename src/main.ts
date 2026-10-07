import { createApp } from './app';
import { config } from './config';

/** Starts the HTTP listener on the configured port. */
export async function main(): Promise<void> {
  const app = await createApp();
  await app.listen(config.port);
}

// Running the compiled entry point starts the service; importing it only
// exposes the exported bootstrap function for tests or other tooling.
if (require.main === module) {
  main().catch((error: unknown) => {
    console.error('notification-service failed to start:', error);
    process.exitCode = 1;
  });
}
