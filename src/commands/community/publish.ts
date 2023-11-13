/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
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
    const columns = {
      id: { header: 'Id' },
      message: { header: 'Message' },
      name: { header: 'Name' },
      status: { header: 'Status' },
      url: { header: 'Url' },
      jobId: { header: 'JobId' },
    };
    this.styledHeader(messages.getMessage('response.styleHeader'));
    this.table([results], columns);
  }
}
