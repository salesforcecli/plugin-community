/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap } from '@salesforce/ts-types';
import { Logger, Messages } from '@salesforce/core';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
import { CommunityNameValueParser } from '../../shared/community/commands/CommunityNameValueParser';
import { ConnectExecutor } from '../../shared/connect/services/ConnectExecutor';
import { CommunityCreateResource } from '../../shared/community/connect/CommunityCreateResource';
import { CommunityCreateResponse } from '../../shared/community/defs/CommunityCreateResponse';
import { applyApiVersionToOrg } from '../../shared/utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');

const MESSAGE_KEY = 'message';
const NAME_KEY = 'name';
const ACTION_KEY = 'action';

/**
 * A command to create a community.
 * This is just an sfdx wrapper around the community create connect endpoint
 */
export class CommunityCreateCommand extends SfCommand<CommunityCreateResponse> {
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
      aliases: ['templatename'],
    }),
    'url-path-prefix': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.urlPathPrefix.summary'),
      description: messages.getMessage('flags.urlPathPrefix.description'),
      required: true,
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

  public static readonly validationPatterns: string[] = [
    // Exact matches
    'name',
    'urlPathPrefix',
    'templateName',
    'description',

    // templateParams.*, but must be only word characters (e.g. no spaces, special chars)
    'templateParams(\\.\\w+)+',
  ];
  private logger: Logger;

  public async run(): Promise<CommunityCreateResponse> {
    this.logger = Logger.childFromRoot(this.constructor.name);
    const { flags, argv } = await this.parse(CommunityCreateCommand);
    const varargs = this.parseVarargs(argv as string[]);
    const createCommand = new CommunityCreateResource({
      name: flags.name,
      urlPathPrefix: flags['url-path-prefix'],
      templateName: flags['template-name'],
      description: flags.description,
      templateParams: varargs['templateParams'] as JsonMap,
    });
    return new ConnectExecutor(createCommand, await applyApiVersionToOrg(flags['target-org'], flags['api-version']))
      .callConnectApi()
      .then((results) => {
        this.displayResults(results);
        return results;
      });
  }

  protected parseVarargs(args?: string[]): JsonMap {
    this.logger.debug(`parseVarargs([${args.join(', ')}])`);

    // It never looks like args is ever undefined as long as varargs is turned on for the command...
    // But since the signature says it's optional, we should probably gate this even though it's unnecessary right now.
    if (args === undefined) {
      return {};
    }

    const parser = new CommunityNameValueParser(CommunityCreateCommand.validationPatterns);
    const values: JsonMap = parser.parse(args);

    this.logger.debug('parseVarargs result:' + JSON.stringify(values));
    return values;
  }

  private displayResults(results: CommunityCreateResponse): void {
    const columns = {
      [NAME_KEY]: { header: 'Name' },
      [MESSAGE_KEY]: { header: 'Message' },
      [ACTION_KEY]: { header: 'Action' },
    };
    this.styledHeader(messages.getMessage('response.styleHeader'));
    this.table([results], columns);
  }
}
