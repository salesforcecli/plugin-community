/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org } from '@salesforce/core';
import type { QueryResult, Record } from '@jsforce/jsforce-node';
import { CommunityInfo } from '../defs/CommunityInfo.js';
import { CommunityStatus } from '../defs/CommunityStatusEnum.js';

/**
 * Helper services for Communities
 */
export default class CommunitiesServices {
  /**
   * Get community name from the given id
   *
   * @param org - the org to query
   * @param name - the given community name
   *
   * @returns - the community id for the given name
   */
  public static async fetchCommunityInfoFromName(org: Org, name?: string): Promise<CommunityInfo | undefined> {
    if (!name) {
      return undefined;
    }

    const result: QueryResult<{ Id: string; Status: CommunityStatus }> = await CommunitiesServices.runQuery(
      org,
      `SELECT Id, Status FROM NETWORK WHERE NAME = '${name}'`
    );
    if (result.totalSize > 0) {
      const record = result.records[0];
      return {
        name,
        id: record.Id,
        status: record.Status,
      };
    }
  }

  public static async runQuery<T extends Record>(org: Org, query: string): Promise<QueryResult<T>> {
    return org.getConnection().query<T>(query);
  }
}
