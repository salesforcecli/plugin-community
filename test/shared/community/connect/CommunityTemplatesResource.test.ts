/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import { CommunityTemplatesResource } from '../../../../src/shared/community/connect/CommunityTemplatesResource.js';

describe('CommunityTemplatesResource', () => {
  let communityTemplatesResource: CommunityTemplatesResource;
  before(() => {
    communityTemplatesResource = getCommunityTemplatesResource();
  });
  describe('getRequestMethod', () => {
    it('should GET', () => {
      expect(communityTemplatesResource.getRequestMethod()).to.equal('GET');
    });
  });
  describe('getPostParams', () => {
    it('should not have any post params', () =>
      communityTemplatesResource.fetchPostParams().then((params) => {
        expect(params).to.equal('{}');
      }));
  });
  describe('handleError', () => {
    it('should throw an error', () => {
      const errorMsg = 'An Error Occured';
      try {
        communityTemplatesResource.handleError(new Error(errorMsg));
        throw new Error('Should have thrown an error here');
      } catch (error) {
        assert(error instanceof Error);
        expect(error.message).to.equal(errorMsg);
      }
    });
  });

  function getCommunityTemplatesResource(): CommunityTemplatesResource {
    return new CommunityTemplatesResource();
  }
});
