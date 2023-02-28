/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap } from '@salesforce/ts-types';
import { Messages, SfError } from '@salesforce/core';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
  parseVarArgs,
} from '@salesforce/sf-plugins-core';
import { ConnectExecutor } from '../../shared/connect/services/ConnectExecutor';
import { CommunityCreateResource } from '../../shared/community/connect/CommunityCreateResource';
import { CommunityCreateResponse } from '../../shared/community/defs/CommunityCreateResponse';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');

const MESSAGE_KEY = 'message';
const NAME_KEY = 'name';
const JOBID_KEY = 'jobId';
const ACTION_KEY = 'action';

/**
 * A command to create a community.
 * This is just an sfdx wrapper around the community create connect endpoint
 */
export class CommunityCreateCommand extends SfCommand<CommunityCreateResponse> {
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:community:create'];
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly strict = false;
  public static readonly flags = {
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      required: true,
    }),
    'template-name': Flags.string({
      char: 't',
      summary: messages.getMessage('flags.templateName.summary'),
      description: messages.getMessage('flags.templateName.description'),
      required: true,
      deprecateAliases: true,
      aliases: ['templatename'],
    }),
    'url-path-prefix': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.urlPathPrefix.summary'),
      description: messages.getMessage('flags.urlPathPrefix.description'),
      // The api requires you to pass this, it accepts an empty string
      default: '',
      deprecateAliases: true,
      aliases: ['urlpathprefix'],
    }),
    description: Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.description.summary'),
      description: messages.getMessage('flags.description.description'),
    }),
    'target-org': requiredOrgFlagWithDeprecations,
    loglevel,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  public async run(): Promise<CommunityCreateResponse> {
    const { flags, argv, args } = await this.parse(CommunityCreateCommand);

    const templateParams = getTemplateParamObjectFromArgs(parseVarArgs(args, argv as string[]));

    const createCommand = new CommunityCreateResource({
      name: flags.name,
      urlPathPrefix: flags['url-path-prefix'],
      templateName: flags['template-name'],
      description: flags.description,
      templateParams,
    });
    return new ConnectExecutor(createCommand, flags['target-org'].getConnection(flags['api-version']))
      .callConnectApi()
      .then((results) => {
        this.displayResults(results);
        return results;
      });
  }

  private displayResults(results: CommunityCreateResponse): void {
    const columns = {
      [NAME_KEY]: { header: 'Name' },
      [MESSAGE_KEY]: { header: 'Message' },
      [JOBID_KEY]: { header: 'JobId' },
      [ACTION_KEY]: { header: 'Action' },
    };
    this.styledHeader(messages.getMessage('response.styleHeader'));
    this.table([results], columns, { 'no-truncate': true });
  }
}

export const getTemplateParamObjectFromArgs = (args: Record<string, string | undefined>): JsonMap => {
  // make sure there's nothing bad
  const badArgs = Object.keys(args).filter((key) => !key.startsWith('templateParams'));
  if (badArgs.length) {
    throw new SfError(`Invalid argument(s): ${badArgs.join(', ')}`, 'InvalidArgument', [
      'Arguments should start with templateParams, like templateParams.AuthenticationType=UNAUTHENTICATED',
    ]);
  }
  // construct the return object
  const templateParams = Object.fromEntries(
    Object.entries(args).map(([key, value]) => [key.replace('templateParams.', ''), value])
  );

  return templateParams;
};
