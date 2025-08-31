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
import type { HttpMethods } from '@jsforce/jsforce-node';

/**
 * Describe of a connect api resource
 * T - type of return type for success/failure
 */
export type ConnectResource<T> = {
  /**
   * Fetch the relative url of the connect end point
   */
  fetchRelativeConnectUrl(): Promise<string>;

  /**
   * HttpMethods
   */
  getRequestMethod(): HttpMethods;

  /**
   * This will be called only when this#getRequestMethod() is 'POST'
   * Return the post params in stringified version
   */
  fetchPostParams(): Promise<string>;

  /**
   * Called if the request is successful
   *
   * @param result - the result returned by the request
   */
  handleSuccess(result: JsonCollection): T;

  /**
   * Called if the request errored out
   *
   * @param error - the corresponding error
   */
  handleError(error: Error): T;
};
