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

import util from 'node:util';
import sinon from 'sinon';
import { assert, expect } from 'chai';
import { Messages, Org } from '@salesforce/core';
import { SfCommand } from '@salesforce/sf-plugins-core';
import CommunitiesServices from '../../../../src/shared/community/service/CommunitiesServices.js';
import { CommunityPublishResource } from '../../../../src/shared/community/connect/CommunityPublishResource.js';
import { CommunityPublishResponse } from '../../../../src/shared/community/defs/CommunityPublishResponse.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'publish');

describe('CommunityPublishResource', () => {
  let org: Org;
  let communityPublishResource: CommunityPublishResource;
  const communityName = 'communityName';
  const jobId = '000xx0000000000000';
  const validCommunityId = '0DB0000000000';
  let table: sinon.SinonStub;
  let styledHeader: sinon.SinonStub;

  before(() => {
    org = new Org(undefined);
    table = sinon.stub(SfCommand.prototype, 'table');
    styledHeader = sinon.stub(SfCommand.prototype, 'styledHeader');
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
        assert(err instanceof Error);
        const errorMessage = util.format(messages.getMessage('error.communityNotExists', [communityName]));
        expect(err.name).to.equal('CommunityNotExistsError');
        expect(err.message).to.equal(errorMessage);
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
      const connectResponse = {
        id: validCommunityId,
        message: 'message',
        name: communityName,
        url: 'http://someurl.com/s',
        jobId,
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
      expect(result.jobId).to.equal(jobId);
    });
  });

  describe('handleError', () => {
    it('should throw an error', () => {
      const errorMsg = 'An Error Occurred';
      expect(() => communityPublishResource.handleError(new Error(errorMsg))).to.throw(errorMsg);
    });
  });

  function getCommunityPublishResource(): CommunityPublishResource {
    return new CommunityPublishResource({
      name: communityName,
      org,
    });
  }
});
