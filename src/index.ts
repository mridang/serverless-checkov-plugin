import * as childProcess from 'child_process';
import * as path from 'path';
import * as util from 'util';
import Serverless from 'serverless';
// eslint-disable-next-line import/no-unresolved
import Plugin, { Logging } from 'serverless/classes/Plugin';

const exec = util.promisify(childProcess.exec);

class ServerlessCheckovPlugin implements Plugin {
  public readonly hooks: Plugin.Hooks = {};
  public readonly name: string = 'serverless-checkov-plugin';
  private pullImagePromise?: Promise<{
    stdout: string;
    stderr: string;
  }>;

  constructor(
    private readonly serverless: Serverless,
    _options: Serverless.Options,
    private readonly logging: Logging,
  ) {
    this.hooks = {
      'before:package:initialize': this.pullImage.bind(this),
      'before:package:finalize': this.runCheckov.bind(this),
    };
  }

  pullImage() {
    this.logging.log.info('Prefetching Checkov image');
    try {
      const command = `docker pull bridgecrew/checkov`;
      this.logging.log.debug(`Command to execute is ${command}`);
      this.pullImagePromise = exec(command);
    } catch (error) {
      this.logging.log.error('Failed to pull Checkov image.');
      throw error;
    }
  }

  private async runCheckov(): Promise<void> {
    const templatePath = path.join(
      this.serverless.config.servicePath,
      '.serverless',
    );
    this.logging.log.info('Running Checkov analysis');

    try {
      const execDockerPull = await this.pullImagePromise;
      if (execDockerPull) {
        if (execDockerPull.stderr) {
          this.logging.log.warning(`Error: ${execDockerPull.stderr}`);
        }
        this.logging.log.info(execDockerPull.stdout);
        this.logging.log.info('Checkov image pulled successfully.');

        const command = `docker run --rm --volume=${templatePath}:/tmp/sls bridgecrew/checkov --quiet --soft-fail --file /tmp/sls/cloudformation-template-create-stack.json`;
        this.logging.log.debug(`Command to execute is ${command}`);
        const execDockerRun = await exec(command);

        if (execDockerRun.stderr) {
          this.logging.log.warning(`Error: ${execDockerRun.stderr}`);
        }

        this.logging.log.warning(execDockerRun.stdout);
        this.logging.log.success('Checkov analysis completed successfully.');
      } else {
        throw new Error('No prefeched image was found');
      }
    } catch (error) {
      this.logging.log.error('Failed to run Checkov analysis.');
      throw error;
    }
  }
}

export = ServerlessCheckovPlugin;
