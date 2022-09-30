/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { OutputFlags } from '@oclif/parser';
import { JsonCollection, AnyJson, JsonMap } from '@salesforce/ts-types';
import { UX } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { HttpMethods } from 'jsforce';
import { CommunityCreateResponse } from '../defs/CommunityCreateResponse';
import { CommunityCreateParams } from '../defs/CommunityCreateParams';
import { ConnectResource } from '../../connect/services/ConnectResource';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');

const MESSAGE_KEY = 'message';
const NAME_KEY = 'name';
const ACTION_KEY = 'action';
/**
 * A connect api resource for creating a community
 */
export class CommunityCreateResource implements ConnectResource<CommunityCreateResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(private flags: OutputFlags<any>, private params: AnyJson, private ux: UX) {}

  public handleSuccess(result: JsonCollection & { [NAME_KEY]?: string }): CommunityCreateResponse {
    const response: CommunityCreateResponse = {
      message: messages.getMessage('response.createMessage'),
      name: result[NAME_KEY],
      action: messages.getMessage('response.action'),
    };
    const columns = {
      [NAME_KEY]: { header: 'Name' },
      [MESSAGE_KEY]: { header: 'Message' },
      [ACTION_KEY]: { header: 'Action' },
    };
    this.ux.styledHeader(messages.getMessage('response.styleHeader'));
    this.ux.table([response], columns);
    return response;
  }

  // eslint-disable-next-line class-methods-use-this
  public handleError(error: Error): CommunityCreateResponse {
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  public async fetchRelativeConnectUrl(): Promise<string> {
    return '/connect/communities';
  }

  // eslint-disable-next-line class-methods-use-this
  public getRequestMethod(): HttpMethods {
    return 'POST';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async fetchPostParams(): Promise<string> {
    const params: CommunityCreateParams = {
      name: this.flags.name as string,
      urlPathPrefix: this.flags.urlpathprefix as string,
      templateName: this.flags.templatename as string,
      description: this.flags.description as string,
      templateParams: this.params['templateParams'] as JsonMap,
    };

    return JSON.stringify(params);
  }
}
