/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url)
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
    const columns = {
      templateName: { header: 'Template Name' },
      publisher: { header: 'Publisher' },
    };
    this.styledHeader(messages.getMessage('response.styledHeader'));
    this.table(results.templates, columns);
    this.log();
    this.log(messages.getMessage('response.TotalField'), results.total.toString());
  }
}
