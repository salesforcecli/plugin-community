/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonCollection } from '@salesforce/ts-types';
import { Org, SfError } from '@salesforce/core';
import { HttpRequest } from 'jsforce';
import { ConnectResource } from './ConnectResource';

/**
 * An executor which calls a connect api for the given org
 */
export class ConnectExecutor<T> {
  public constructor(private connectService: ConnectResource<T>, private org: Org) {}

  /**
   * Call the connect resource as defined by the given ConnectResource for the given org
   */
  public async callConnectApi(): Promise<T> {
    return this.org
      .getConnection()
      .request(await this.fetchRequestInfo())
      .then((result) => this.connectService.handleSuccess(result as JsonCollection))
      .catch((err) => this.connectService.handleError(err));
  }

  public async fetchRequestInfo(): Promise<HttpRequest> {
    const connectUrl: string = encodeURI(await this.connectService.fetchRelativeConnectUrl());
    const method = this.connectService.getRequestMethod();
    if (method === 'GET') {
      return {
        url: connectUrl,
        method,
        body: null,
      };
    } else if (method === 'POST') {
      return {
        url: connectUrl,
        method,
        body: await this.connectService.fetchPostParams(),
      };
    } else {
      throw new SfError(`Unsupported method is given: ${method}`, 'UNSUPPORTED_OPERATION');
    }
  }
}
