//import runServerless from '@serverless/test/run-serverless';
import path from 'path';
// @ts-ignore
import logEmitter from 'log/lib/emitter.js';

// @ts-ignore
logEmitter.on('log', (event) => {
  console.log(event.logger.namespace)
  console.log(event);
});

describe('ServerlessCheckovPlugin', () => {
  it('should run Checkov on command', async () => {
    // @ts-ignore
    const xxxx = await runServerless(path.resolve('node_modules/serverless'), {
      cwd: path.resolve(__dirname, 'fixtures', 'simple-service'),
      command: 'package',
      fixture: 'testService',
    });

    // @ts-ignore
    console.log(xxxx.output)
    console.log(xxxx.stdoutData); // Log standard output
  });
});
