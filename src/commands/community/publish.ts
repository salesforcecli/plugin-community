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

import { Messages } from '@salesforce/core';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { CommunityPublishResource } from '../../shared/community/connect/CommunityPublishResource.js';
import { ConnectExecutor } from '../../shared/connect/services/ConnectExecutor.js';
import { CommunityPublishResponse } from '../../shared/community/defs/CommunityPublishResponse.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'publish');

/**
 * A command to publish a community. This is just an sfdx wrapper around
 * the community publish connect endpoint
 */
export class CommunityPublishCommand extends SfCommand<CommunityPublishResponse> {
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:community:publish'];
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    name: Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.name.summary'),
      required: true,
    }),
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    loglevel,
  };

  public async run(): Promise<CommunityPublishResponse> {
    const { flags } = await this.parse(CommunityPublishCommand);
    const publishCommand = new CommunityPublishResource({
      name: flags.name,
      org: flags['target-org'],
    });
    return new ConnectExecutor(publishCommand, flags['target-org'].getConnection(flags['api-version']))
      .callConnectApi()
      .then((results: CommunityPublishResponse) => {
        this.displayResults(results);
        return results;
      });
  }

  private displayResults(results: CommunityPublishResponse): void {
    this.table({
      data: [results],
      columns: ['id', 'message', 'name', 'status', 'url', 'jobId'],
      title: messages.getMessage('response.styleHeader'),
    });
  }
}
