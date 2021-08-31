/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { CommunitiesServices } from '../../../../lib/community/service/CommunitiesServices';
import { Org } from '@salesforce/core';
import { CommunityInfo } from '../../../../lib/community/defs/CommunityInfo';

const sinon = require('sinon');
const { expect } = require('chai');
const should = require('chai').should();

describe('CommunitiesServices', () => {
  describe('runQuery', () => {
    it('should return undefined when no query is passed', async () => {
      should.not.exist(await CommunitiesServices.runQuery(null, null));
      should.not.exist(await CommunitiesServices.runQuery(null, undefined));
    });
  });

  describe('fetchCommunityInfoFromName', () => {
    it('should return undefined when no community name is passed', async () => {
      should.not.exist(await CommunitiesServices.fetchCommunityInfoFromName(null, null));
      should.not.exist(await CommunitiesServices.fetchCommunityInfoFromName(null, undefined));
    });

    it('should return CommunityInfo when valid community name is passed', async () => {
      let runQueryStub = sinon.stub(CommunitiesServices, 'runQuery');
      runQueryStub.returns(
        Promise.resolve({
          totalSize: 1,
          records: [
            {
              Id: '0D5000000000000',
              Status: 'UnderConstruction',
            },
          ],
        })
      );
      let info: CommunityInfo = await CommunitiesServices.fetchCommunityInfoFromName(new Org(null), 'communityName');
      should.exist(info);
      expect(info.id).to.equal('0D5000000000000');
      expect(info.status).to.equal('UnderConstruction');
      expect(info.name).to.equal('communityName');

      runQueryStub.restore();
    });

    it('should return undefined when invalid community name is passed', async () => {
      let runQueryStub = sinon.stub(CommunitiesServices, 'runQuery');
      runQueryStub.returns(
        Promise.resolve({
          totalSize: 0,
          records: [],
        })
      );
      should.not.exist(await CommunitiesServices.fetchCommunityInfoFromName(new Org(null), 'communityName'));
      runQueryStub.restore();
    });
  });
});
