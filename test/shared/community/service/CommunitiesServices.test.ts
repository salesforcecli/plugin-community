/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Org } from '@salesforce/core';
import { CommunitiesServices } from '../../../../src/shared/community/service/CommunitiesServices';
import { CommunityInfo } from '../../../../src/shared/community/defs/CommunityInfo';

describe('CommunitiesServices', () => {
  describe('runQuery', () => {
    it('should return undefined when no query is passed', async () => {
      expect(await CommunitiesServices.runQuery(null, null)).to.be.undefined;
      expect(await CommunitiesServices.runQuery(null, undefined)).to.be.undefined;
    });
  });

  describe('fetchCommunityInfoFromName', () => {
    it('should return undefined when no community name is passed', async () => {
      expect(await CommunitiesServices.fetchCommunityInfoFromName(null, null)).to.be.undefined;
      expect(await CommunitiesServices.fetchCommunityInfoFromName(null, undefined)).to.be.undefined;
    });

    it('should return CommunityInfo when valid community name is passed', async () => {
      const runQueryStub = sinon.stub(CommunitiesServices, 'runQuery');
      runQueryStub.returns(
        Promise.resolve({
          totalSize: 1,
          records: [
            {
              Id: '0D5000000000000',
              Status: 'UnderConstruction',
            },
          ],
          done: true,
        })
      );
      const info: CommunityInfo = await CommunitiesServices.fetchCommunityInfoFromName(new Org(null), 'communityName');
      expect(info).to.exist;
      expect(info.id).to.equal('0D5000000000000');
      expect(info.status).to.equal('UnderConstruction');
      expect(info.name).to.equal('communityName');

      runQueryStub.restore();
    });

    it('should return undefined when invalid community name is passed', async () => {
      const runQueryStub = sinon.stub(CommunitiesServices, 'runQuery');
      runQueryStub.returns(
        Promise.resolve({
          totalSize: 0,
          records: [],
          done: true,
        })
      );
      expect(await CommunitiesServices.fetchCommunityInfoFromName(new Org(null), 'communityName')).to.be.undefined;
      runQueryStub.restore();
    });
  });
});
