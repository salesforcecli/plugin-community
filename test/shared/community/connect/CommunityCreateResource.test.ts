/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as sinon from 'sinon';
import { AnyJson, JsonMap, JsonCollection } from '@salesforce/ts-types';
import { expect } from 'chai';
import { Messages } from '@salesforce/core';
import { UX } from '@salesforce/command';
import { CommunityCreateParams } from '../../../../src/shared/community/defs/CommunityCreateParams';
import { CommunityCreateResource } from '../../../../src/shared/community/connect/CommunityCreateResource';
import { CommunityCreateResponse } from '../../../../src/shared/community/defs/CommunityCreateResponse';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');

describe('CommunityCreateResource', () => {
  let communityCreateResource: CommunityCreateResource;
  const communityName = 'communityName';
  const urlPathPrefix = 'urlPathPrefix';
  const templateName = 'templateName';
  const description = 'description';
  let table: sinon.SinonStub;
  let styledHeader: sinon.SinonStub;

  before(() => {
    communityCreateResource = getCommunityCreateResource();
    table = sinon.stub(UX.prototype, 'table');
    styledHeader = sinon.stub(UX.prototype, 'styledHeader');
  });
  after(() => {
    table.restore();
    styledHeader.restore();
  });
  describe('fetchRelativeConnectUrl', () => {
    it('should return the expected URL', async () => {
      const url = await communityCreateResource.fetchRelativeConnectUrl();
      const RELATIVE_URL = '/connect/communities';
      expect(url).to.equal(RELATIVE_URL);
    });
  });

  describe('getRequestMethod', () => {
    it('should POST', () => {
      expect(communityCreateResource.getRequestMethod()).to.equal('POST');
    });
  });

  describe('fetchPostParams', () => {
    const expectedPostParams: CommunityCreateParams = {
      name: communityName,
      urlPathPrefix,
      templateName,
      description,
    };

    it('should have proper post params', async () => {
      const params = await communityCreateResource.fetchPostParams();
      const paramsObject = JSON.parse(params) as CommunityCreateParams;
      expect(paramsObject.name).to.equal(expectedPostParams.name);
      expect(paramsObject.templateName).to.equal(expectedPostParams.templateName);
      expect(paramsObject.description).to.equal(expectedPostParams.description);
      expect(paramsObject.urlPathPrefix).to.equal(expectedPostParams.urlPathPrefix);
    });
  });

  describe('handleSuccess', () => {
    it('should return community info', () => {
      const connectResponse: JsonCollection = {
        message: 'message',
        name: communityName,
      };

      const result: CommunityCreateResponse = communityCreateResource.handleSuccess(connectResponse);
      expect(result.message).to.equal(messages.getMessage('response.createMessage'));
      expect(result.name).to.equal(communityName);
      expect(result.action).to.equal(messages.getMessage('response.action'));
    });
  });

  describe('handleError', () => {
    it('should throw an error', () => {
      const errorMsg = 'An Error Occured';
      try {
        communityCreateResource.handleError(new Error(errorMsg));
        throw new Error('Should have thrown an error here');
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.equal(errorMsg);
      }
    });
  });

  function getCommunityCreateResource(): CommunityCreateResource {
    return new CommunityCreateResource(
      {
        name: communityName,
        urlpathprefix: urlPathPrefix,
        templatename: templateName,
        description,
      },
      {},
      new UX(null)
    );
  }
});

describe('CommunityCreateResource with templateParams', () => {
  const communityName = 'communityName';
  const urlPathPrefix = 'urlPathPrefix';
  const templateName = 'templateName';
  const description = 'description';
  const templateParams: JsonMap = {
    optional1: 'This is optional',
    optional2: 'This is also optional',
  };
  let table: sinon.SinonStub;
  let styledHeader: sinon.SinonStub;

  before(() => {
    table = sinon.stub(UX.prototype, 'table');
    styledHeader = sinon.stub(UX.prototype, 'styledHeader');
  });
  after(() => {
    table.restore();
    styledHeader.restore();
  });

  describe('fetchPostParamsWithTemplateParams', () => {
    const expectedPostParams: CommunityCreateParams = {
      name: communityName,
      urlPathPrefix,
      templateName,
      description,
      templateParams,
    };

    it('should have proper post params that contain templateParams', async () => {
      const communityCreateResource: CommunityCreateResource = getCommunityCreateResourceWithParams({
        templateParams,
      });
      const params = await communityCreateResource.fetchPostParams();
      const paramsObject = JSON.parse(params) as CommunityCreateParams;
      expect(JSON.stringify(paramsObject)).to.equal(JSON.stringify(expectedPostParams));
    });
  });

  describe('fetchPostParamsWithUnsupportedParams', () => {
    const expectedPostParams: CommunityCreateParams = {
      name: communityName,
      urlPathPrefix,
      templateName,
      description,
    };

    it('should not have invalid or unsupported post params', async () => {
      const communityCreateResource: CommunityCreateResource = getCommunityCreateResourceWithParams({
        random: 'this should not show up',
        nested: {
          invalid: 'Should not be included',
        },
      });
      const params = await communityCreateResource.fetchPostParams();
      const paramsObject = JSON.parse(params) as CommunityCreateParams;
      expect(JSON.stringify(paramsObject)).to.equal(JSON.stringify(expectedPostParams));
    });
  });

  function getCommunityCreateResourceWithParams(params: AnyJson): CommunityCreateResource {
    return new CommunityCreateResource(
      {
        name: communityName,
        urlpathprefix: urlPathPrefix,
        templatename: templateName,
        description,
      },
      params,
      new UX(null)
    );
  }
});
