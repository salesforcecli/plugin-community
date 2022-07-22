/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/require-await */

import { expect } from 'chai';

import { Messages } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';

import { CommunityNameValueParser } from '../../../../src/shared/community/commands/CommunityNameValueParser';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-community', 'create');

describe('CommunityNameValueParser (Unit Test)', () => {
  describe('Using the default validation pattern', () => {
    it('Empty input should result in empty result', async () => {
      const parser = new CommunityNameValueParser();
      expect(parser.parse([])).to.eql({});
    });

    it('Any name=value input should validate and return map with all values', async () => {
      const input: string[] = ['Astro=is', 'the=best mascot!', 'even.better=than SaaSy'];
      const expected: JsonMap = {
        Astro: 'is',
        the: 'best mascot!',
        even: {
          better: 'than SaaSy',
        },
      };

      const parser = new CommunityNameValueParser();
      expect(parser.parse(input)).to.eql(expected);
    });

    describe('Handles invalid/odd name=value inputs robustly', () => {
      it('single space value', async () => {
        const input: string[] = ['space= '];
        const expected: JsonMap = { space: ' ' };

        const parser = new CommunityNameValueParser();
        expect(parser.parse(input)).to.eql(expected);
      });

      it('"name =value" keeps space after name', async () => {
        const input: string[] = ['spaceAfter =value'];
        const expected: JsonMap = { 'spaceAfter ': 'value' };

        const parser = new CommunityNameValueParser();
        expect(parser.parse(input)).to.eql(expected);
      });

      it('"name=", value becomes empty string', async () => {
        const input: string[] = ['missing='];
        const expected: JsonMap = { missing: '' };

        const parser = new CommunityNameValueParser();
        expect(parser.parse(input)).to.eql(expected);
      });

      // Do we want it be undefined or empty string??
      it('"nameByItself" becomes undefined', async () => {
        const input: string[] = ['byMyself'];
        const expected: JsonMap = { byMyself: undefined };

        const parser = new CommunityNameValueParser();
        expect(parser.parse(input)).to.eql(expected);
      });

      it('"many=equals=equals=equals" will parse properly into name and value', async () => {
        const input: string[] = ['many=equals=with=more=equals'];
        const expected: JsonMap = { many: 'equals=with=more=equals' };

        const parser = new CommunityNameValueParser();
        expect(parser.parse(input)).to.eql(expected);
      });
    });
  });

  describe('Using simple validation patterns', () => {
    const pattern: string[] = ['name', 'template', 'path', 'param.sub'];
    let parser: CommunityNameValueParser;

    before(() => {
      parser = new CommunityNameValueParser(pattern);
    });

    it('Parses and validates all accepted patterns', async () => {
      const input: string[] = [
        'name=My Name',
        'template=Some Template',
        'path=/path/to/me',
        'param.sub=Some Sub Param',
      ];
      const expected: JsonMap = {
        name: 'My Name',
        template: 'Some Template',
        path: '/path/to/me',
        param: {
          sub: 'Some Sub Param nooooooooooooo',
        },
      };

      expect(parser.parse(input)).to.eql(expected);
    });

    it('Invalidates non-valid patterns', async () => {
      const input: string[] = ['name=Valid', 'invalid=Should Not Pass Validation', 'also.invalid=Should Fail'];
      const expectedErrorTokens: string[] = ['invalid="Should Not Pass Validation"', 'also.invalid="Should Fail"'];

      expect(() => parser.parse(input)).to.throw(messages.getMessage('error.invalidVarargs', expectedErrorTokens));
    });
  });

  describe('Using complex validation patterns', () => {
    const pattern: string[] = ['specific.one', 'singleLevel\\.\\w+', 'prefix\\w+', 'manyLevels(\\.\\w+)+'];
    let parser: CommunityNameValueParser;

    before(() => {
      parser = new CommunityNameValueParser(pattern);
    });

    it('Parses and validates all accepted patterns', async () => {
      const input: string[] = [
        'specific.one=This is Nested',
        'singleLevel.a=A',
        'singleLevel.1=One',
        'prefix1=P1',
        'prefixMoreThanOne=PMany',
        'manyLevels.okayAtOne=Just One',
        'manyLevels.More.Than=One',
      ];
      const expected: JsonMap = {
        specific: {
          one: 'This is Nested',
        },
        singleLevel: {
          a: 'A',
          '1': 'One',
        },
        prefix1: 'P1',
        prefixMoreThanOne: 'PMany',
        manyLevels: {
          okayAtOne: 'Just One',
          More: {
            Than: 'One',
          },
        },
      };

      expect(parser.parse(input)).to.eql(expected);
    });

    it('Invalid patterns are rejected', async () => {
      const input: string[] = [
        'singleLevel.more.than.one.level=Too deep',
        'prefix.sub.values=Also Not Allowed',
        'manyLevels=fail',
      ];
      const expectedTokens: string[] = [
        'singleLevel.more.than.one.level="Too deep"',
        'prefix.sub.values="Also Not Allowed"',
        'manyLevels="fail"',
      ];

      expect(() => parser.parse(input)).to.throw(messages.getMessage('error.invalidVarargs', expectedTokens));
    });

    it('Cannot clobber', async () => {
      const input: string[] = ['manyLevels.immortal=Immortal', 'manyLevels.immortal.attemptToClobber=Will Fail'];

      expect(() => parser.parse(input)).to.throw("Cannot create property 'attemptToClobber' on string 'Immortal'");
    });
  });
});
