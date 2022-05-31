/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import { Org, Connection } from '@salesforce/core';
import { Result } from '@salesforce/command';
import { HttpMethods, HttpRequest } from 'jsforce';
import { ConnectExecutor } from '../../../../../src/shared/connect/services/ConnectExecutor';
import { ConnectResource } from '../../../../../src/shared/connect/services/ConnectResource';

describe('ConnectExecutor', () => {
  const relativeUrl = '/relativeUrl/';

  class DummyPostConnectResource implements ConnectResource<Result> {
    public fetchRelativeConnectUrl(): Promise<string> {
      return Promise.resolve(relativeUrl + this.getRequestMethod());
    }

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
    public handleSuccess(result: import('@salesforce/ts-types').JsonCollection): import('@salesforce/command').Result {
      return {
        data: 'success',
        ux: null,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        display: () => {},
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public handleError(error: Error): import('@salesforce/command').Result {
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
    it('should not call fetchPostParams for a GET call', async () => {
      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyGetConnectResource(), new Org(null));
      // If fetchPostParams was called, it will throw an exception
      const ri: HttpRequest = await executor.fetchRequestInfo();
      expect(ri).to.exist;
      expect(ri.url).to.be.equal(relativeUrl + 'GET');
      expect(ri.method).to.be.equal('GET');
      expect(ri.body).to.be.equal(null);
      expect(ri.headers).to.be.undefined;
    });

    it('should call fetchPostParams for a POST call', async () => {
      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyPostConnectResource(), new Org(null));
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
      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyPatchConnectResource(), new Org(null));

      try {
        await executor.fetchRequestInfo();
      } catch (err) {
        const error = err as Error;
        expect(error.name).to.equal('UNSUPPORTED_OPERATION');
        expect(error.message).to.equal('Unsupported method is given: PATCH');
      }
    });
  });

  describe('callConnectApi', () => {
    const sandbox = sinon.createSandbox();
    const connectionStub = sinon.createStubInstance(Connection);

    beforeEach(() => {
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, Org.prototype, 'getConnection').returns(connectionStub);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call handleSuccess on success response', async () => {
      connectionStub.request.resolves('yay');

      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyGetConnectResource(), Org.prototype);
      const response: Result = await executor.callConnectApi();
      expect(response.data).to.be.equal('success');
      expect(response.ux).to.be.equal(null);
    });

    it('should call handleError on error response', async () => {
      connectionStub.request.rejects('nay');

      const executor: ConnectExecutor<Result> = new ConnectExecutor(new DummyGetConnectResource(), Org.prototype);

      try {
        await executor.callConnectApi();
        expect('uh oh...').to.equal('this code should not be reached');
      } catch (err) {
        const error = err as Error;
        expect(error.name).to.equal('Error');
        expect(error.message).to.equal('handleError is called');
      }
    });
  });
});
