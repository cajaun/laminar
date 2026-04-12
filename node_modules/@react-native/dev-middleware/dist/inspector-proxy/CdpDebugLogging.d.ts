/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

export type CDPMessageDestination =
  | "DebuggerToProxy"
  | "ProxyToDebugger"
  | "DeviceToProxy"
  | "ProxyToDevice";
declare class CdpDebugLogging {
  constructor();
  log(destination: CDPMessageDestination, message: string): void;
}
export default CdpDebugLogging;
