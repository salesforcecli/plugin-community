/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { HttpMethods } from 'jsforce';
import { ConnectResource } from '../../connect/services/ConnectResource';
import { CommunityTemplatesListResponse } from '../defs/CommunityTemplatesListResponse';

/**
 * A connect api resource for fetching community templates available to context user
 */
export class CommunityTemplatesResource implements ConnectResource<CommunityTemplatesListResponse> {
  // eslint-disable-next-line class-methods-use-this
  public fetchRelativeConnectUrl(): Promise<string> {
    return Promise.resolve('/connect/communities/templates');
  }

  // eslint-disable-next-line class-methods-use-this
  public fetchPostParams(): Promise<string> {
    return Promise.resolve(JSON.stringify({}));
  }

  // eslint-disable-next-line class-methods-use-this
  public getRequestMethod(): HttpMethods {
    return 'GET';
  }

  // eslint-disable-next-line class-methods-use-this
  public handleSuccess(result: CommunityTemplatesListResponse): CommunityTemplatesListResponse {
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  public handleError(error: Error): CommunityTemplatesListResponse {
    throw error;
  }
}
