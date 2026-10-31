import { readFileSync, rmSync } from 'fs';
import { join } from 'path';
import ServerlessCheckovPlugin from '../src/index';

type Ctor = ConstructorParameters<typeof ServerlessCheckovPlugin>;

describe('plugin tests', () => {
  const callsFile = join(process.env.DOCKER_STUB_DIR as string, 'calls.txt');

  beforeEach(() => {
    rmSync(callsFile, { force: true });
  });

  it('should pull the image and run checkov on the compiled template', async () => {
    const logs: string[] = [];
    const record = (line: string) => logs.push(line);
    const logging = {
      log: {
        info: record,
        debug: record,
        warning: record,
        success: record,
        error: record,
      },
    };
    const serverless = { config: { servicePath: '/work/service' } };
    const plugin = new ServerlessCheckovPlugin(
      serverless as unknown as Ctor[0],
      {} as Ctor[1],
      logging as unknown as Ctor[2],
    );

    (plugin.hooks['before:package:initialize'] as () => void)();
    await (plugin.hooks['before:package:finalize'] as () => Promise<void>)();

    const calls = readFileSync(callsFile, 'utf8').split('\n');
    expect(calls[0]).toBe('pull bridgecrew/checkov');
    expect(calls[1]).toContain('--volume=/work/service/.serverless:/tmp/sls');
    expect(calls[1]).toContain(
      '/tmp/sls/cloudformation-template-create-stack.json',
    );
    expect(logs).toContain(
      'Passed checks: 3, Failed checks: 6, Skipped checks: 0\n',
    );
    expect(logs).toContain('Checkov analysis completed successfully.');
  });

  it('should fail when the image was never pulled', async () => {
    const noop = () => undefined;
    const logging = {
      log: {
        info: noop,
        debug: noop,
        warning: noop,
        success: noop,
        error: noop,
      },
    };
    const plugin = new ServerlessCheckovPlugin(
      { config: { servicePath: '/work/service' } } as unknown as Ctor[0],
      {} as Ctor[1],
      logging as unknown as Ctor[2],
    );

    await expect(
      (plugin.hooks['before:package:finalize'] as () => Promise<void>)(),
    ).rejects.toThrow('No prefeched image was found');
  });
});
