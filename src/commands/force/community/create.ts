/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { JsonMap } from '@salesforce/ts-types';
import { Messages } from '@salesforce/core';
import { CommunityNameValueParser } from '../../../lib/community/commands/CommunityNameValueParser';
import { ConnectExecutor } from '../../../lib/connect/services/ConnectExecutor';
import { CommunityCreateResource } from '../../../lib/community/connect/CommunityCreateResource';
import { CommunityCreateResponse } from '../../../lib/community/defs/CommunityCreateResponse';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');
/**
 * A command to create a community.
 * This is just an sfdx wrapper around the community create connect endpoint
 */
export class CommunityCreateCommand extends SfdxCommand {
  public static readonly requiresUsername = true;
  public static readonly varargs = true;
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly flagsConfig: FlagsConfig = {
    name: flags.string({
      char: 'n',
      description: messages.getMessage('flags.name.description'),
      required: true,
    }),
    templatename: flags.string({
      char: 't',
      description: messages.getMessage('flags.templateName.description'),
      required: true,
    }),
    urlpathprefix: flags.string({
      char: 'p',
      description: messages.getMessage('flags.urlPathPrefix.description'),
      required: true,
    }),
    description: flags.string({
      char: 'd',
      description: messages.getMessage('flags.description.description'),
    }),
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

  public async run(): Promise<CommunityCreateResponse | Error> {
    const createCommand = new CommunityCreateResource(this.flags, this.varargs, this.ux);
    return new ConnectExecutor(createCommand, this.org).callConnectApi();
  }

  protected parseVarargs(args?: string[]): JsonMap {
    this.logger.debug(`parseVarargs(${args})`);

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
}
