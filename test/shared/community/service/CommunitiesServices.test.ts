/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import sinon from 'sinon';
import { assert, expect } from 'chai';
import { Org } from '@salesforce/core';
import CommunitiesServices from '../../../../src/shared/community/service/CommunitiesServices.js';

describe('CommunitiesServices', () => {
  describe('fetchCommunityInfoFromName', () => {
    it('should return undefined when no community name is passed', async () => {
      expect(await CommunitiesServices.fetchCommunityInfoFromName(new Org(undefined), undefined)).to.be.undefined;
      expect(await CommunitiesServices.fetchCommunityInfoFromName(new Org(undefined), undefined)).to.be.undefined;
    });

    it('should return CommunityInfo when valid community name is passed', async () => {
      const runQueryStub = sinon.stub(CommunitiesServices, 'runQuery').returns(
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

      const info = await CommunitiesServices.fetchCommunityInfoFromName(new Org(undefined), 'communityName');
      assert(info);
      expect(info.id).to.equal('0D5000000000000');
      expect(info.status).to.equal('UnderConstruction');
      expect(info.name).to.equal('communityName');

      runQueryStub.restore();
    });

    it('should return undefined when invalid community name is passed', async () => {
      const runQueryStub = sinon.stub(CommunitiesServices, 'runQuery').returns(
        Promise.resolve({
          totalSize: 0,
          records: [],
          done: true,
        })
      );
      expect(await CommunitiesServices.fetchCommunityInfoFromName(new Org(undefined), 'communityName')).to.be.undefined;
      runQueryStub.restore();
    });
  });
});
