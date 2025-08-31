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
/* eslint-disable @typescript-eslint/require-await */

import { expect, assert } from 'chai';
import { Config } from '@oclif/core';
import { SfError } from '@salesforce/core/sfError';
import { parseVarArgs } from '@salesforce/sf-plugins-core';
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { getTemplateParamObjectFromArgs, CommunityCreateCommand } from '../../../../src/commands/community/create.js';

class Wrapper extends CommunityCreateCommand {
  public async getParsedArgs(): Promise<Record<string, string | undefined>> {
    const { args, argv } = await this.parse(CommunityCreateCommand);
    return parseVarArgs(args, argv as string[]);
  }
}

const getParsedVarArgs = async (args: string[]): Promise<Record<string, string | undefined>> => {
  const wrapper = new Wrapper(args, { runHook: async () => ({ successes: [], failures: [] }) } as unknown as Config);
  return wrapper.getParsedArgs();
};

const baseFlags = ['--name', 'foo', '--template-name', 'bar'];

describe('getTemplateParamObjectFromArgs (Unit Test)', () => {
  const $$ = new TestContext();
  const org = new MockTestOrgData();

  beforeEach(async () => {
    await $$.stubAuths(org);
    await $$.stubConfig({ 'target-org': org.username });
  });

  describe('Using the default validation pattern', () => {
    it('Empty input should result in empty result', async () => {
      const varArgs = await getParsedVarArgs(baseFlags);
      expect(getTemplateParamObjectFromArgs(varArgs)).to.eql({});
    });

    it('handle template params', async () => {
      const varArgs = await getParsedVarArgs(baseFlags.concat(['templateParams.foo=bar']));
      expect(getTemplateParamObjectFromArgs(varArgs)).to.deep.equal({ foo: 'bar' });
    });

    it('handle 2 template params', async () => {
      const varArgs = await getParsedVarArgs(baseFlags.concat(['templateParams.foo=bar', 'templateParams.baz=qux']));
      expect(getTemplateParamObjectFromArgs(varArgs)).to.deep.equal({ foo: 'bar', baz: 'qux' });
    });

    it('Any name=value input should validate and return map with all values', async () => {
      const varArgs = await getParsedVarArgs(baseFlags.concat(['bad=throw']));
      try {
        getTemplateParamObjectFromArgs(varArgs);
        throw new Error('Should have thrown');
      } catch (e) {
        assert(e instanceof SfError);
        expect(e.name).to.equal('InvalidArgument');
      }
    });
  });
});
