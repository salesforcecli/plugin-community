/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { UX } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { HttpMethods } from 'jsforce';
import { ConnectResource } from '../../connect/services/ConnectResource';
import { CommunityTemplatesListResponse } from '../defs/CommunityTemplatesListResponse';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'template.list');

/**
 * A connect api resource for fetching community templates available to context user
 */
export class CommunityTemplatesResource implements ConnectResource<CommunityTemplatesListResponse> {
  public constructor(private ux: UX) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async fetchRelativeConnectUrl(): Promise<string> {
    return '/connect/communities/templates';
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  public async fetchPostParams(): Promise<string> {
    return JSON.stringify({});
  }

  public getRequestMethod(): HttpMethods {
    return 'GET';
  }

  public handleSuccess(result: CommunityTemplatesListResponse): CommunityTemplatesListResponse {
    const columns = {
      templateName: { header: 'Template Name' },
      publisher: { header: 'Publisher' },
    };
    this.ux.styledHeader(messages.getMessage('response.styledHeader'));
    this.ux.table(result.templates, columns);
    this.ux.log();
    this.ux.log(messages.getMessage('response.TotalField'), result.total.toString());
    return result;
  }

  public handleError(error: Error): CommunityTemplatesListResponse {
    throw error;
  }
}
