/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { URL } from 'url';
import { OutputFlags } from '@oclif/parser';
import { UX } from '@salesforce/command';
import { JsonCollection } from '@salesforce/ts-types';
import { Messages, Org } from '@salesforce/core';
import { HttpMethods } from 'jsforce';
import { CommunityPublishResponse } from '../defs/CommunityPublishResponse';
import { CommunityInfo } from '../defs/CommunityInfo';
import { CommunitiesServices } from '../service/CommunitiesServices';
import { ConnectResource } from '../../connect/services/ConnectResource';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'publish');

/**
 * A connect api resource for publishing a community
 */

export class CommunityPublishResource implements ConnectResource<CommunityPublishResponse> {
  private info: CommunityInfo;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(private flags: OutputFlags<any>, private org: Org, private ux: UX) {}

  public async fetchRelativeConnectUrl(): Promise<string> {
    return `/connect/communities/${await this.fetchCommunityId()}/publish`;
  }

  // eslint-disable-next-line class-methods-use-this
  public getRequestMethod(): HttpMethods {
    return 'POST';
  }

  // eslint-disable-next-line @typescript-eslint/require-await, class-methods-use-this
  public async fetchPostParams(): Promise<string> {
    return JSON.stringify({});
  }

  public handleSuccess(
    result: JsonCollection & { id?: string; name?: string; url?: string }
  ): CommunityPublishResponse {
    const response: CommunityPublishResponse = {
      id: result.id,
      message: messages.getMessage('response.message'),
      name: result.name,
      status: this.info.status,
      url: new URL(result.url).toString(),
    };
    const columns = {
      id: { header: 'Id' },
      message: { header: 'Message' },
      name: { header: 'Name' },
      status: { header: 'Status' },
      url: { header: 'Url' },
    };
    this.ux.styledHeader(messages.getMessage('response.styleHeader'));
    this.ux.table([response], columns);
    return response;
  }

  // eslint-disable-next-line class-methods-use-this
  public handleError(error: Error): CommunityPublishResponse {
    throw error;
  }

  public async fetchCommunityId(): Promise<string> {
    this.info = await CommunitiesServices.fetchCommunityInfoFromName(this.org, this.flags.name as string);
    if (!this.info) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw messages.createError('error.communityNotExists', [this.flags.name as string]);
    }
    return this.info.id;
  }
}
