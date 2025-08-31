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
