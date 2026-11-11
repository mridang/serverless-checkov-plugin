/**
 * @file Jest global setup that installs a stub docker binary on the PATH.
 */
import { chmod, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Installs a stub docker executable that records its arguments and prints a Checkov summary.
 * @example
 * ```ts
 * await setup();
 * ```
 */
export default async function setup(): Promise<void> {
  const dir = await mkdtemp(path.join(tmpdir(), 'checkov-docker-stub-'));
  const calls = path.join(dir, 'calls.txt');
  const docker = path.join(dir, 'docker');
  await writeFile(
    docker,
    [
      '#!/bin/sh',
      `echo "$@" >> "${calls}"`,
      'if [ "$1" = "run" ]; then',
      '  echo "Passed checks: 3, Failed checks: 6, Skipped checks: 0"',
      'fi',
      '',
    ].join('\n'),
  );
  await chmod(docker, 0o755);
  process.env.PATH = `${dir}:${process.env.PATH}`;
  process.env.DOCKER_STUB_DIR = dir;
}
