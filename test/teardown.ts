import { rmSync } from 'fs';

// noinspection JSUnusedGlobalSymbols
export default async function teardown(): Promise<void> {
  if (process.env.DOCKER_STUB_DIR) {
    rmSync(process.env.DOCKER_STUB_DIR, { recursive: true, force: true });
  }
}
