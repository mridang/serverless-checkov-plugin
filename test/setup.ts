import { chmodSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// noinspection JSUnusedGlobalSymbols
export default async function setup(): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'checkov-docker-stub-'));
  const calls = join(dir, 'calls.txt');
  const docker = join(dir, 'docker');
  writeFileSync(
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
  chmodSync(docker, 0o755);
  process.env.PATH = `${dir}:${process.env.PATH}`;
  process.env.DOCKER_STUB_DIR = dir;
}
