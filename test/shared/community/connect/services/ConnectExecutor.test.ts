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
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import sinon from 'sinon';
import { assert, expect } from 'chai';
import { Connection } from '@salesforce/core';
import type { HttpMethods, HttpRequest } from '@jsforce/jsforce-node';
import type { JsonCollection } from '@salesforce/ts-types';
import { ConnectExecutor } from '../../../../../src/shared/connect/services/ConnectExecutor.js';
import { ConnectResource } from '../../../../../src/shared/connect/services/ConnectResource.js';

type Result = {
  data: string;
};

describe('ConnectExecutor', () => {
  const relativeUrl = '/relativeUrl/';

  class DummyPostConnectResource implements ConnectResource<Result> {
    public fetchRelativeConnectUrl(): Promise<string> {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.resolve(`${relativeUrl}${this.getRequestMethod()}`);
    }

    // eslint-disable-next-line class-methods-use-this
    public getRequestMethod(): HttpMethods {
      return 'POST';
    }

    public fetchPostParams(): Promise<string> {
      return Promise.resolve(
        JSON.stringify({
          param: 'value',
        })
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public handleSuccess(result: JsonCollection): Result {
      return {
        data: 'success',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    public handleError(error: Error): Result {
      throw new Error('handleError is called');
    }
  }

  class DummyGetConnectResource extends DummyPostConnectResource {
    public getRequestMethod(): HttpMethods {
      return 'GET';
    }

    public fetchPostParams(): Promise<string> {
      throw new Error('Should not be called');
    }
  }

  // Patch operation is not supported yet
  class DummyPatchConnectResource extends DummyPostConnectResource {
    public getRequestMethod(): HttpMethods {
      return 'PATCH';
    }

    public fetchPostParams(): Promise<string> {
      throw new Error('Should not be called');
    }
  }

  describe('fetchRequestInfo', () => {
    const connectionStub = sinon.createStubInstance(Connection);
    it('should not call fetchPostParams for a GET call', async () => {
      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyGetConnectResource(), connectionStub);
      // If fetchPostParams was called, it will throw an exception
      const ri: HttpRequest = await executor.fetchRequestInfo();
      expect(ri).to.exist;
      expect(ri.url).to.be.equal(relativeUrl + 'GET');
      expect(ri.method).to.be.equal('GET');
      expect(ri.body).to.be.equal(null);
      expect(ri.headers).to.be.undefined;
    });

    it('should call fetchPostParams for a POST call', async () => {
      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyPostConnectResource(), connectionStub);
      const ri: HttpRequest = await executor.fetchRequestInfo();
      expect(ri).to.exist;
      expect(ri.url).to.be.equal(relativeUrl + 'POST');
      expect(ri.method).to.be.equal('POST');
      expect(ri.body).to.be.equal(
        JSON.stringify({
          param: 'value',
        })
      );
      expect(ri.headers).to.be.undefined;
    });

    it('should throw for unsupported method calls', async () => {
      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyPatchConnectResource(), connectionStub);

      try {
        await executor.fetchRequestInfo();
      } catch (error) {
        assert(error instanceof Error);
        expect(error.name).to.equal('UNSUPPORTED_OPERATION');
        expect(error.message).to.equal('Unsupported method is given: PATCH');
      }
    });
  });

  describe('callConnectApi', () => {
    const sandbox = sinon.createSandbox();
    const connectionStub = sinon.createStubInstance(Connection);

    beforeEach(() => {
      // @ts-expect-error stub instance only
      sandbox.stub(Connection, 'create').returns(connectionStub);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call handleSuccess on success response', async () => {
      connectionStub.request.resolves('yay');

      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyGetConnectResource(), connectionStub);
      const response: Result = await executor.callConnectApi();
      expect(response.data).to.be.equal('success');
    });

    it('should call handleError on error response', async () => {
      connectionStub.request.rejects('nay');

      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyGetConnectResource(), connectionStub);

      try {
        await executor.callConnectApi();
        expect('uh oh...').to.equal('this code should not be reached');
      } catch (error) {
        assert(error instanceof Error);
        expect(error.name).to.equal('Error');
        expect(error.message).to.equal('handleError is called');
      }
    });
  });
});
