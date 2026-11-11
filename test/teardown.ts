/**
 * @file Jest global teardown that removes the stub docker directory.
 */
import { rm } from 'node:fs/promises';

/**
 * Removes the temporary directory that holds the stub docker binary.
 * @example
 * ```ts
 * await teardown();
 * ```
 */
export default async function teardown(): Promise<void> {
  if (process.env.DOCKER_STUB_DIR) {
    await rm(process.env.DOCKER_STUB_DIR, { recursive: true, force: true });
  }
}
