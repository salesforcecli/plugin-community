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

import type { JsonCollection } from '@salesforce/ts-types';
import { Messages } from '@salesforce/core/messages';
import type { HttpMethods } from '@jsforce/jsforce-node';
import { CommunityCreateResponse } from '../defs/CommunityCreateResponse.js';
import { CommunityCreateParams } from '../defs/CommunityCreateParams.js';
import { ConnectResource } from '../../connect/services/ConnectResource.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');

const NAME_KEY = 'name';
const JOBID_KEY = 'jobId';

/**
 * A connect api resource for creating a community
 */
export class CommunityCreateResource implements ConnectResource<CommunityCreateResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(private options: CommunityCreateParams) {}

  // eslint-disable-next-line class-methods-use-this
  public handleSuccess(result: JsonCollection & { [NAME_KEY]: string; [JOBID_KEY]: string }): CommunityCreateResponse {
    const response: CommunityCreateResponse = {
      message: messages.getMessage('response.createMessage'),
      name: result[NAME_KEY],
      jobId: result[JOBID_KEY],
      action: messages.getMessage('response.action'),
    };
    return response;
  }

  // eslint-disable-next-line class-methods-use-this
  public handleError(error: Error): CommunityCreateResponse {
    throw error;
  }

  // eslint-disable-next-line class-methods-use-this
  public fetchRelativeConnectUrl(): Promise<string> {
    return Promise.resolve('/connect/communities');
  }

  // eslint-disable-next-line class-methods-use-this
  public getRequestMethod(): HttpMethods {
    return 'POST';
  }

  public async fetchPostParams(): Promise<string> {
    const params: CommunityCreateParams = {
      name: this.options.name,
      urlPathPrefix: this.options.urlPathPrefix,
      templateName: this.options.templateName,
      description: this.options.description,
      templateParams: this.options['templateParams'],
    };

    return Promise.resolve(JSON.stringify(params));
  }
}
