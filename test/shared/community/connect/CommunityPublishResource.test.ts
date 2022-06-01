/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as util from 'util';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { UX } from '@salesforce/command';
import { JsonCollection } from '@salesforce/ts-types';
import { Messages, Org } from '@salesforce/core';
import { CommunitiesServices } from '../../../../src/shared/community/service/CommunitiesServices';
import { CommunityPublishResource } from '../../../../src/shared/community/connect/CommunityPublishResource';
import { CommunityPublishResponse } from '../../../../src/shared/community/defs/CommunityPublishResponse';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'publish');

describe('CommunityPublishResource', () => {
  let org: Org;
  let communityPublishResource: CommunityPublishResource;
  const communityName = 'communityName';
  const validCommunityId = '0DB0000000000';
  let table: sinon.SinonStub;
  let styledHeader: sinon.SinonStub;

  before(() => {
    org = new Org(null);
    table = sinon.stub(UX.prototype, 'table');
    styledHeader = sinon.stub(UX.prototype, 'styledHeader');
    communityPublishResource = getCommunityPublishResource();
  });

  after(() => {
    table.restore();
    styledHeader.restore();
  });

  describe('fetchRelativeConnectUrl', () => {
    let communitiesServices: sinon.SinonStub;
    beforeEach(() => {
      communitiesServices = sinon.stub(CommunitiesServices, 'fetchCommunityInfoFromName');
    });
    afterEach(() => {
      communitiesServices.restore();
    });

    it('should throw when invalid id is given', async () => {
      communitiesServices.returns(Promise.resolve(undefined));

      try {
        await communityPublishResource.fetchRelativeConnectUrl();
      } catch (err) {
        const error = err as Error;
        const errorMessage = util.format(messages.getMessage('error.communityNotExists'), communityName);
        expect(error.name).to.equal('CommunityNotExistsError');
        expect(error.message).to.equal(errorMessage);
      }
    });

    it('should return relative url with community id', async () => {
      communitiesServices.returns(
        Promise.resolve({
          id: validCommunityId,
        })
      );
      expect(await communityPublishResource.fetchRelativeConnectUrl()).to.equal(
        `/connect/communities/${validCommunityId}/publish`
      );
    });
  });

  describe('getRequestMethod', () => {
    it('should POST', () => {
      expect(communityPublishResource.getRequestMethod()).to.equal('POST');
    });
  });

  describe('fetchPostParams', () => {
    it('should not have any post params', async () => {
      expect(await communityPublishResource.fetchPostParams()).to.equal('{}');
    });
  });

  describe('handleSuccess', () => {
    let communitiesServices: sinon.SinonStub;
    beforeEach(() => {
      communitiesServices = sinon.stub(CommunitiesServices, 'fetchCommunityInfoFromName');
    });
    afterEach(() => {
      communitiesServices.restore();
    });

    it('should return community info', async () => {
      communitiesServices.returns(
        Promise.resolve({
          id: validCommunityId,
          status: 'UnderConstruction',
        })
      );
      const connectResponse: JsonCollection = {
        id: validCommunityId,
        message: 'message',
        name: communityName,
        url: 'http://someurl.com/s',
      };
      // This sets up CommunityInfo
      await communityPublishResource.fetchCommunityId();
      const result: CommunityPublishResponse = communityPublishResource.handleSuccess(connectResponse);
      expect(result.id).to.equal(validCommunityId);
      expect(result.message).to.equal(
        'We’re publishing your changes now. You’ll receive an email confirmation when your changes are live.'
      );
      expect(result.name).to.equal(communityName);
      expect(result.status).to.equal('UnderConstruction');
      expect(result.url.toString()).to.equal('http://someurl.com/s');
    });
  });

  describe('handleError', () => {
    it('should throw an error', () => {
      const errorMsg = 'An Error Occured';
      expect(() => communityPublishResource.handleError(new Error(errorMsg))).to.throw(errorMsg);
    });
  });

  function getCommunityPublishResource(): CommunityPublishResource {
    return new CommunityPublishResource(
      {
        name: communityName,
      },
      org,
      new UX(null)
    );
  }
});
