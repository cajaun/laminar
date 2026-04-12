/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 * @oncall react_native
 */

import type { IncomingMessage } from "node:http";
/**
 * Attempt to parse a request body as JSON.
 */
declare function parseJsonBody(req: IncomingMessage, options?: {
  strict?: boolean;
}): Promise<any>;
export default parseJsonBody;