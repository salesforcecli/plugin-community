/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { URL } from 'url';
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

export type CommunityPublishResourceOptions = {
  name: string;
  org: Org;
};

export class CommunityPublishResource implements ConnectResource<CommunityPublishResponse> {
  private info?: CommunityInfo;

  public constructor(private options: CommunityPublishResourceOptions) { }

  public async fetchRelativeConnectUrl(): Promise<string> {
    return `/connect/communities/${await this.fetchCommunityId()}/publish`;
  }

  // eslint-disable-next-line class-methods-use-this
  public getRequestMethod(): HttpMethods {
    return 'POST';
  }

  // eslint-disable-next-line class-methods-use-this
  public fetchPostParams(): Promise<string> {
    return Promise.resolve(JSON.stringify({}));
  }

  public handleSuccess(
    result: JsonCollection & { id?: string; name?: string; url?: string; jobId?: string }
  ): CommunityPublishResponse {
    return {
      id: result.id,
      message: messages.getMessage('response.message'),
      name: result.name,
      status: this.info?.status,
      url: new URL(result.url).toString(),
      jobId: result.jobId,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  public handleError(error: Error): CommunityPublishResponse {
    throw error;
  }

  public async fetchCommunityId(): Promise<string> {
    this.info = await CommunitiesServices.fetchCommunityInfoFromName(this.options.org, this.options.name);
    if (!this.info) {
      throw messages.createError('error.communityNotExists', [this.options.name]);
    }
    return this.info.id;
  }
}
