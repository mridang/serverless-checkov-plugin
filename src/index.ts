import * as childProcess from 'child_process';
import * as path from 'path';
import * as util from 'util';
import Serverless from 'serverless';
import Plugin, { Logging } from 'serverless/classes/Plugin';

const exec = util.promisify(childProcess.exec);

class ServerlessCheckovPlugin implements Plugin {
  public readonly hooks: Plugin.Hooks = {};
  public readonly name: string = 'serverless-checkov-plugin';

  constructor(
    private readonly serverless: Serverless,
    _options: Serverless.Options,
    private readonly logging: Logging,
  ) {
    this.hooks = {
      'before:package:finalize': this.runCheckov.bind(this),
    };
  }

  private async runCheckov(): Promise<void> {
    const templatePath = path.join(
      this.serverless.config.servicePath,
      '.serverless',
    );
    this.logging.log.info('Running Checkov analysis');

    try {
      const command = `docker run --rm --volume=${templatePath}:/tmp/sls bridgecrew/checkov --quiet --soft-fail --file /tmp/sls/cloudformation-template-create-stack.json`;
      this.logging.log.debug(`Command to execute is ${command}`);
      const { stdout, stderr } = await exec(command);

      if (stderr) {
        this.logging.log.warning(`Error: ${stderr}`);
      }

      this.logging.log.warning(stdout);
      this.logging.log.success('Checkov analysis completed successfully.');
    } catch (error) {
      this.logging.log.error('Failed to run Checkov analysis.');
      throw error;
    }
  }
}

export = ServerlessCheckovPlugin;
