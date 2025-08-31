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
