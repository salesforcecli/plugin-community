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
import type { HttpMethods } from '@jsforce/jsforce-node';
import { ConnectResource } from '../../connect/services/ConnectResource.js';
import { CommunityTemplatesListResponse } from '../defs/CommunityTemplatesListResponse.js';

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
