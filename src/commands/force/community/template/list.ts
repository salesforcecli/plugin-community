/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { CommunityTemplatesResource } from '../../../../shared/community/connect/CommunityTemplatesResource';
import { ConnectExecutor } from '../../../../shared/connect/services/ConnectExecutor';
import { CommunityTemplatesListResponse } from '../../../../shared/community/defs/CommunityTemplatesListResponse';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'template.list');

/**
 * A command to fetch available community templates a community. This is just an sfdx wrapper around
 * the get available community templates connect endpoint
 */
export class CommunityListTemplatesCommand extends SfdxCommand {
  public static readonly requiresUsername = true;
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);

  public async run(): Promise<CommunityTemplatesListResponse | Error> {
    const listTemplateCommand = new CommunityTemplatesResource();
    return new ConnectExecutor(listTemplateCommand, this.org)
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
    this.ux.styledHeader(messages.getMessage('response.styledHeader'));
    this.ux.table(results.templates, columns);
    this.ux.log();
    this.ux.log(messages.getMessage('response.TotalField'), results.total.toString());
  }
}
