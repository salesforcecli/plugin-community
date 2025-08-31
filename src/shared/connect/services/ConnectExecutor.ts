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
import { Connection, Messages, SfError } from '@salesforce/core';
import type { HttpRequest } from '@jsforce/jsforce-node';
import { ConnectResource } from './ConnectResource.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'connect-executor');

/**
 * An executor which calls a connect api for the given org
 */
export class ConnectExecutor<T> {
  public constructor(private connectService: ConnectResource<T>, private connection: Connection) {}

  /**
   * Call the connect resource as defined by the given ConnectResource for the given org
   */
  public async callConnectApi(): Promise<T> {
    return this.connection
      .request(await this.fetchRequestInfo())
      .then((result) => this.connectService.handleSuccess(result as JsonCollection))
      .catch((err) => this.connectService.handleError(err as Error));
  }

  public async fetchRequestInfo(): Promise<HttpRequest> {
    const connectUrl = encodeURI(await this.connectService.fetchRelativeConnectUrl());
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
      throw new SfError(messages.getMessage('unsupportedOperation', [method]), 'UNSUPPORTED_OPERATION');
    }
  }
}
