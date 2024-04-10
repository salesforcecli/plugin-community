/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
