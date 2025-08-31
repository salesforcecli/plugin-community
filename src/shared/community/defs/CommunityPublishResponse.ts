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

import { CommunityStatus } from './CommunityStatusEnum.js';
/**
 * SFDX command output when publishing a community
 */
export type CommunityPublishResponse = {
  /**
   * community ID
   */
  id: string;

  /**
   * output message
   */
  message: string;

  /**
   * name of the community
   */
  name: string;

  /**
   * community status (Active/Inactive/DownForMaintainance)
   */
  status?: CommunityStatus;

  /**
   * url to access the community
   */
  url: string;

  /**
   * id of the BackgroundOperation that runs the publish job
   */
  jobId?: string;
};
