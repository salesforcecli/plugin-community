/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { expect } from 'chai';
import { Duration, sleep } from '@salesforce/kit';

import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';

import { CommunityCreateResponse } from '../../src/shared/community/defs/CommunityCreateResponse';
import { CommunityPublishResponse } from '../../src/shared/community/defs/CommunityPublishResponse';
import { CommunityTemplatesListResponse } from '../../src/shared/community/defs/CommunityTemplatesListResponse';

let session: TestSession;

const siteName = 'my-site';

const commonRequiredFlagError = {
  status: 1,
  name: 'Error',
  exitCode: 1,
  warnings: [],
};

describe('plugin-commuity commands', () => {
  before(async () => {
    session = await TestSession.create({
      project: {
        sourceDir: path.join('test', 'community-project'),
      },
      // create org and push source to get a permset
      setupCommands: [
        `sfdx force:org:create -d 1 -s -f ${path.join('config', 'project-scratch-def.json')}`,
        'sfdx force:source:push',
      ],
    });
  });

  describe('community:template:list', () => {
    it('ensures templates:list, uh, lists... templates', () => {
      // locally --user is set with the `TESTKIT_HUB_USERNAME` env var.
      const cmd = 'force:community:template:list --json';
      const output = execCmd<CommunityTemplatesListResponse>(cmd, { ensureExitCode: 0 }).jsonOutput;

      expect(output.result).to.have.all.keys(['templates', 'total']);
      expect(output.result.templates[0]).to.have.all.keys(['publisher', 'templateName']);
    });
  });

  describe('community:create', () => {
    it('requires --name flag', () => {
      const cmd = 'force:community:create --json';
      const output = execCmd<CommunityCreateResponse>(cmd, { ensureExitCode: 1 }).jsonOutput;

      expect(output.stack).to.include('--name');
      delete output.stack;
      expect(output).to.deep.equal({
        message: 'Missing required flag:\n -n, --name NAME  name of the site to create\nSee more help with --help',
        commandName: 'CommunityCreateCommand',
        ...commonRequiredFlagError,
      });
    });

    it('requires --templatename flag', () => {
      const cmd = `force:community:create --name "${siteName}" --json`;
      const output = execCmd<CommunityCreateResponse>(cmd, { ensureExitCode: 1 }).jsonOutput;

      expect(output.stack).to.include('--templatename');
      delete output.stack;
      expect(output).to.deep.equal({
        message:
          'Missing required flag:\n -t, --templatename TEMPLATENAME  template to use to create a site\nSee more help with --help', // eslint-disable-line prettier/prettier
        exitCode: 1,
        commandName: 'CommunityCreateCommand',
        ...commonRequiredFlagError,
      });
    });

    it('requires --urlpathprefix flag', () => {
      const cmd = `force:community:create --name "${siteName}" --templatename "Aloha" --json`;
      const output = execCmd<CommunityCreateResponse>(cmd, { ensureExitCode: 1 }).jsonOutput;

      expect(output.stack).to.include('--urlpathprefix');
      delete output.stack;
      expect(output).to.deep.equal({
        message:
          'Missing required flag:\n -p, --urlpathprefix URLPATHPREFIX  URL to append to the domain created when\n                                    Digital Experiences was enabled for this org\nSee more help with --help', // eslint-disable-line prettier/prettier
        commandName: 'CommunityCreateCommand',
        ...commonRequiredFlagError,
      });
    });

    it('requires alphanumeric for --urlpathprefix flag', () => {
      const cmd = `force:community:create --name "${siteName}" --templatename "Aloha" --urlpathprefix "my-bad-prefix" --json`;
      const output = execCmd<CommunityCreateResponse>(cmd, { ensureExitCode: 1 }).jsonOutput;

      expect(output.stack).to.include('INVALID_INPUT');
      delete output.stack;
      expect(output).to.deep.equal({
        status: 1,
        name: 'INVALID_INPUT',
        message: 'The URL can only contain alphanumeric characters.',
        exitCode: 1,
        commandName: 'CommunityCreateCommand',
        warnings: [],
      });
    });

    it('creates a new community', () => {
      const cmd = `force:community:create --name "${siteName}" --templatename "Aloha" --urlpathprefix "myprefix" --json`;
      const output = execCmd<CommunityCreateResponse>(cmd, { ensureExitCode: 0 }).jsonOutput;

      expect(output.result).to.have.all.keys(['message', 'name', 'action']);
      expect(output.result.name).to.equal(siteName);
      expect(output.result.message).to.equal('Your Site is being created.');
    });
  });

  describe('community:publish', () => {
    it('requires --name flag', () => {
      const cmd = 'force:community:publish --json';
      const output = execCmd<CommunityPublishResponse>(cmd, { ensureExitCode: 1 }).jsonOutput;

      expect(output.stack).to.include('--name');
      delete output.stack;
      expect(output).to.deep.equal({
        message:
          'Missing required flag:\n -n, --name NAME  name of the Experience Builder site to publish\nSee more help with --help', // eslint-disable-line prettier/prettier
        commandName: 'CommunityPublishCommand',
        ...commonRequiredFlagError,
      });
    });

    it('throws an error if published too early', () => {
      const cmd = `force:community:publish --name "${siteName}" --json`;
      const output = execCmd<CommunityPublishResponse>(cmd, { ensureExitCode: 1 }).jsonOutput;

      expect(output.status).to.equal(1);
      expect(output.name).to.equal('error.communityNotExists');
      expect(output.message).to.equal(
        `The ${siteName} site doesn't exist. Verify the site name and try publishing it again.`
      );
      expect(output.exitCode).to.equal(1);
      expect(output.commandName).to.equal('CommunityPublishCommand');
    });

    it('publishes a created community', async () => {
      const maxRetries = 10;
      let sleepFor = 4;
      const retryRate = 1.5;

      async function poll(retry): Promise<CommunityPublishResponse> {
        const cmd = `force:community:publish --name "${siteName}" --json`;
        const output = execCmd<CommunityPublishResponse>(cmd).jsonOutput;

        if (output.result) {
          return output.result;
        } else if (output.name === 'error.communityNotExists') {
          if (retry <= 0) {
            throw new Error(`Max retries (${maxRetries}) reached attempting to run 'force:community:publish'`);
          }
          // Community is still being created, try again
          sleepFor *= retryRate; // wait slightly longer each retry
          return sleep(Duration.seconds(sleepFor)).then(() => poll(retry - 1));
        }

        throw new Error(`Unexpected error occur while running 'force:community:publish': ${output.message}`);
      }

      const result = await poll(maxRetries);

      expect(result.id).to.have.length(18);
      expect(result.message).to.equal(
        'We’re publishing your changes now. You’ll receive an email confirmation when your changes are live.'
      ); // eslint-disable-line prettier/prettier
      expect(result.name).to.equal(siteName);
      expect(result.status).to.equal('UnderConstruction');
      expect(result.url).to.contain('https');
    });
  });

  after(async () => {
    await session?.zip(undefined, 'artifacts');
    await session?.clean();
  });
});
