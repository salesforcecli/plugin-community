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
import { URL } from 'node:url';

import type { JsonCollection } from '@salesforce/ts-types';
import { Messages, Org } from '@salesforce/core';
import type { HttpMethods } from '@jsforce/jsforce-node';
import { CommunityPublishResponse } from '../defs/CommunityPublishResponse.js';
import { CommunityInfo } from '../defs/CommunityInfo.js';
import CommunitiesServices from '../service/CommunitiesServices.js';
import { ConnectResource } from '../../connect/services/ConnectResource.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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

  public constructor(private options: CommunityPublishResourceOptions) {}

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
    result: JsonCollection & { id: string; name: string; url: string; jobId: string }
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
