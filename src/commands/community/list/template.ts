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
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { CommunityTemplatesResource } from '../../../shared/community/connect/CommunityTemplatesResource.js';
import { ConnectExecutor } from '../../../shared/connect/services/ConnectExecutor.js';
import { CommunityTemplatesListResponse } from '../../../shared/community/defs/CommunityTemplatesListResponse.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'template.list');

/**
 * A command to fetch available community templates a community. This is just an sfdx wrapper around
 * the get available community templates connect endpoint
 */
export class CommunityListTemplatesCommand extends SfCommand<CommunityTemplatesListResponse> {
  public static readonly deprecateAliases = true;
  public static readonly aliases = ['force:community:template:list'];
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    loglevel,
  };

  public async run(): Promise<CommunityTemplatesListResponse> {
    const { flags } = await this.parse(CommunityListTemplatesCommand);
    const listTemplateCommand = new CommunityTemplatesResource();
    return new ConnectExecutor(listTemplateCommand, flags['target-org'].getConnection(flags['api-version']))
      .callConnectApi()
      .then((results: CommunityTemplatesListResponse) => {
        this.displayResults(results);
        return results;
      });
  }

  private displayResults(results: CommunityTemplatesListResponse): void {
    this.table({
      data: results.templates,
      columns: [{ key: 'templateName', name: 'Template Name' }, 'publisher'],
      title: messages.getMessage('response.styledHeader'),
    });
    this.log(messages.getMessage('response.TotalField'), results.total.toString());
  }
}
