/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

import WS from "ws";
export type HeartbeatTrackerArgs = {
  socket: WS;
  timeBetweenPings: number;
  minHighPingToReport: number;
  timeoutMs: number;
  onTimeout: (roundtripDuration: number) => void;
  onHighPing: (roundtripDuration: number) => void;
};
declare class InspectorProxyHeartbeat {
  constructor(args: HeartbeatTrackerArgs);
  start(): void;
}
export default InspectorProxyHeartbeat;
