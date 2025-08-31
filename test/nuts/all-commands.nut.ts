/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import path from 'node:path';
import { assert, expect } from 'chai';
import { Duration, sleep } from '@salesforce/kit';

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';

import { CommunityCreateResponse } from '../../src/shared/community/defs/CommunityCreateResponse.js';
import { CommunityPublishResponse } from '../../src/shared/community/defs/CommunityPublishResponse.js';
import { CommunityTemplatesListResponse } from '../../src/shared/community/defs/CommunityTemplatesListResponse.js';

let session: TestSession;

const siteName = 'my-site';

describe('plugin-community commands', () => {
  before(async () => {
    session = await TestSession.create({
      project: {
        sourceDir: path.join('test', 'community-project'),
      },
      devhubAuthStrategy: 'AUTO',
      scratchOrgs: [
        {
          setDefault: true,
          config: path.join('config', 'project-scratch-def.json'),
        },
      ],
    });

    execCmd('force:source:push');
  });

  describe('community:template:list', () => {
    it('ensures templates:list lists templates', () => {
      // locally --user is set with the `TESTKIT_HUB_USERNAME` env var.
      const cmd = 'force:community:template:list --json';
      let output = execCmd<CommunityTemplatesListResponse>(cmd, { ensureExitCode: 0 }).jsonOutput;

      // There seems to be a race condition where this will sometimes fail on the first try.
      if (!output) {
        output = execCmd<CommunityTemplatesListResponse>(cmd, { ensureExitCode: 0 }).jsonOutput;
      }
      assert(output);

      expect(output.result).to.have.all.keys(['templates', 'total']);
      expect(output.result.templates[0]).to.have.all.keys(['publisher', 'templateName']);
    });
  });

  describe('community:create', () => {
    const createResultProps = ['message', 'name', 'action', 'jobId'];
    it('creates a new community', () => {
      const cmd = `force:community:create --name "${siteName}" --template-name "Aloha" --url-path-prefix "myprefix" --json`;
      const output = execCmd<CommunityCreateResponse>(cmd, { ensureExitCode: 0 }).jsonOutput;
      assert(output);

      expect(output.result).to.have.all.keys(createResultProps);
      expect(output.result.name).to.equal(siteName);
      expect(output.result.message).to.equal('Your Site is being created.');
    });

    it('creates a new community without a url-prefix (empty string)', () => {
      const cmd = `force:community:create --name "${siteName}-no-prefix" --template-name "Aloha" --json`;
      const output = execCmd<CommunityCreateResponse>(cmd, { ensureExitCode: 0 }).jsonOutput;
      assert(output);

      expect(output.result).to.have.all.keys(createResultProps);
      expect(output.result.name).to.equal(`${siteName}-no-prefix`);
      expect(output.result.message).to.equal('Your Site is being created.');
    });
  });

  describe('community:publish', () => {
    it('throws an error if published too early', () => {
      const cmd = `force:community:publish --name "${siteName}" --json`;
      const output = execCmd<CommunityPublishResponse>(cmd, { ensureExitCode: 1 }).jsonOutput;
      assert(output);

      expect(output.status).to.equal(1);
      expect(output.name).to.equal('CommunityNotExistsError');
      expect(output.message).to.equal(
        `The ${siteName} site doesn't exist. Verify the site name and try publishing it again.`
      );
      expect(output.exitCode).to.equal(1);
    });

    it('publishes a created community', async () => {
      const maxRetries = 15;
      let sleepFor = 4;
      const retryRate = 1.5;

      async function poll(retry: number): Promise<CommunityPublishResponse> {
        const cmd = `force:community:publish --name "${siteName}" --json`;
        const output = execCmd<CommunityPublishResponse>(cmd).jsonOutput;

        if (output?.result) {
          return output.result;
        } else if (output?.name === 'CommunityNotExistsError') {
          if (retry <= 0) {
            throw new Error(`Max retries (${maxRetries}) reached attempting to run 'force:community:publish'`);
          }
          // Community is still being created, try again
          sleepFor *= retryRate; // wait slightly longer each retry
          return sleep(Duration.seconds(sleepFor)).then(() => poll(retry - 1));
        }

        throw new Error(`Unexpected error occur while running 'force:community:publish': ${output?.message}`);
      }

      const result = await poll(maxRetries);

      expect(result.id).to.have.length(18);
      expect(result.message).to.equal(
        'We’re publishing your changes now. You’ll receive an email confirmation when your changes are live.'
      );
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
