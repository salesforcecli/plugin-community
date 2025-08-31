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

import type { JsonMap } from '@salesforce/ts-types';
import { Messages, SfError } from '@salesforce/core';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
  parseVarArgs,
} from '@salesforce/sf-plugins-core';
import { ConnectExecutor } from '../../shared/connect/services/ConnectExecutor.js';
import { CommunityCreateResource } from '../../shared/community/connect/CommunityCreateResource.js';
import { CommunityCreateResponse } from '../../shared/community/defs/CommunityCreateResponse.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');

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
      summary: messages.getMessage('flags.template-name.summary'),
      description: messages.getMessage('flags.template-name.description'),
      required: true,
      deprecateAliases: true,
      aliases: ['templatename'],
    }),
    'url-path-prefix': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.url-path-prefix.summary'),
      description: messages.getMessage('flags.url-path-prefix.description'),
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
    this.table({
      data: [results],
      columns: ['message', 'name', 'jobId', 'action'],
      title: messages.getMessage('response.styleHeader'),
      overflow: 'wrap',
    });
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
