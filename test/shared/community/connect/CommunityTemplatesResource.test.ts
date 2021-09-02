/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { UX } from '@salesforce/command';
import { CommunityTemplatesResource } from '../../../../src/shared/community/connect/CommunityTemplatesResource';

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
    it('should not have any post params', () => {
      return communityTemplatesResource.fetchPostParams().then((params) => {
        expect(params).to.equal('{}');
      });
    });
  });
  describe('handleError', () => {
    it('should throw an error', () => {
      const errorMsg = 'An Error Occured';
      try {
        communityTemplatesResource.handleError(new Error(errorMsg));
        throw new Error('Should have thrown an error here');
      } catch (e) {
        expect(e.message).to.equal(errorMsg);
      }
    });
  });
  function getCommunityTemplatesResource(): CommunityTemplatesResource {
    return new CommunityTemplatesResource(new UX(null));
  }
});
