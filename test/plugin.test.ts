import runServerless from '@serverless/test/run-serverless';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
// @ts-expect-error since the types are missing
import logEmitter from 'log/lib/emitter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const logsBuffer: string[] = [];
logEmitter.on(
  'log',
  (event: { logger: { namespace: string }; messageTokens: string[] }) => {
    if (
      !event.logger.namespace.startsWith('serverless:lifecycle') &&
      event.logger.namespace !== 'serverless'
    ) {
      logsBuffer.push(event.messageTokens[0]);
    }
  },
);

describe('plugin tests', () => {
  it('should run checkov on package', async () => {
    await runServerless(path.join(require.resolve('serverless'), '..', '..'), {
      cwd: path.resolve(__dirname, 'fixtures', 'simple-service'),
      command: 'package',
    });

    expect(logsBuffer.join('\n')).toContain(
      'Passed checks: 3, Failed checks: 6, Skipped checks: 0',
    );
  });
});
