/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

import type { DebuggerSessionIDs } from "../types/EventReporter";
export type EventLoopPerfTrackerArgs = {
  perfMeasurementDuration: number;
  minDelayPercentToReport: number;
  onHighDelay: (args: OnHighDelayArgs) => void;
};
export type OnHighDelayArgs = {
  eventLoopUtilization: number;
  maxEventLoopDelayPercent: number;
  duration: number;
  debuggerSessionIDs: DebuggerSessionIDs;
  connectionUptime: number;
};
declare class EventLoopPerfTracker {
  constructor(args: EventLoopPerfTrackerArgs);
  trackPerfThrottled(
    debuggerSessionIDs: DebuggerSessionIDs,
    connectionUptime: number
  ): void;
}
export default EventLoopPerfTracker;
