/**
 * @file Tests for the Checkov plugin hooks against a stubbed docker binary.
 */
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import ServerlessCheckovPlugin from '../src/index.js';
import type Plugin from 'serverless/classes/Plugin';

type Ctor = ConstructorParameters<typeof ServerlessCheckovPlugin>;

/**
 * Builds a complete logging facade whose log methods all forward to one sink.
 *
 * @param sink - receives every log call
 * @returns a logging facade with the full Serverless shape
 */
function createLogging(sink: (...args: unknown[]) => void): Plugin.Logging {
  const progress: Plugin.Progress = {
    namespace: 'test',
    name: 'test',
    update: sink,
    info: sink,
    notice: sink,
    remove: () => undefined,
  };
  return {
    log: {
      error: sink,
      warning: sink,
      notice: sink,
      info: sink,
      debug: sink,
      verbose: sink,
      success: sink,
    },
    writeText: sink,
    progress: { get: () => progress, create: () => progress },
  };
}

describe('plugin tests', () => {
  const callsFile = path.join(process.env.DOCKER_STUB_DIR!, 'calls.txt');

  beforeEach(async () => {
    await rm(callsFile, { force: true });
  });

  it('should pull the image and run checkov on the compiled template', async () => {
    const logs: string[] = [];
    const record = (line: unknown) => logs.push(String(line));
    const logging = createLogging(record);
    const serverless = { config: { servicePath: '/work/service' } };
    const plugin = new ServerlessCheckovPlugin(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a full Serverless instance needs a real service load; the plugin reads only config.servicePath
      serverless as unknown as Ctor[0],
      {},
      logging,
    );

    plugin.hooks['before:package:initialize']();
    await plugin.hooks['before:package:finalize']();

    const output = await readFile(callsFile, 'utf8');
    const calls = output.split('\n');
    expect(calls[0]).toBe('pull bridgecrew/checkov');
    expect(calls[1]).toContain('--volume=/work/service/.serverless:/tmp/sls');
    expect(calls[1]).toContain(
      path.posix.join(
        '/',
        'tmp',
        'sls',
        'cloudformation-template-create-stack.json',
      ),
    );
    expect(logs).toContain(
      'Passed checks: 3, Failed checks: 6, Skipped checks: 0\n',
    );
    expect(logs).toContain('Checkov analysis completed successfully.');
  });

  it('should fail when the image was never pulled', async () => {
    const noop = () => undefined;
    const logging = createLogging(noop);
    const plugin = new ServerlessCheckovPlugin(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a full Serverless instance needs a real service load; the plugin reads only config.servicePath
      { config: { servicePath: '/work/service' } } as unknown as Ctor[0],
      {},
      logging,
    );

    await expect(
      Promise.resolve(plugin.hooks['before:package:finalize']()),
    ).rejects.toThrow('No prefeched image was found');
  });
});
