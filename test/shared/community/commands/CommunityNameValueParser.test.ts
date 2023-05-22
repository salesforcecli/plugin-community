/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/require-await */

import { expect } from 'chai';
import { Config } from '@oclif/core';
import { SfError } from '@salesforce/core';
import { assert } from '@salesforce/ts-types';
import { parseVarArgs } from '@salesforce/sf-plugins-core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { getTemplateParamObjectFromArgs, CommunityCreateCommand } from '../../../../src/commands/community/create';

class Wrapper extends CommunityCreateCommand {
  public async getParsedArgs(): Promise<Record<string, string | undefined>> {
    const { args, argv } = await this.parse(CommunityCreateCommand);
    return parseVarArgs(args, argv as string[]);
  }
}

const getParsedVarArgs = async (args: string[]): Promise<Record<string, string | undefined>> => {
  const wrapper = new Wrapper(args, {} as Config);
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
