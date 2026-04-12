/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

import type { EventReporter } from "../types/EventReporter";
import type { CreateCustomMessageHandlerFn } from "./CustomMessageHandler";
import type { Page } from "./types";
import WS from "ws";
export declare const WS_CLOSE_REASON: {
  PAGE_NOT_FOUND: "[PAGE_NOT_FOUND] Debugger page not found";
  CONNECTION_LOST: "[CONNECTION_LOST] Connection lost to corresponding device";
  RECREATING_DEVICE: "[RECREATING_DEVICE] Recreating device connection";
  NEW_DEBUGGER_OPENED: "[NEW_DEBUGGER_OPENED] New debugger opened for the same app instance";
};
export declare type WS_CLOSE_REASON = typeof WS_CLOSE_REASON;
export type DeviceOptions = Readonly<{
  id: string;
  name: string;
  app: string;
  socket: WS;
  projectRoot: string;
  eventReporter: null | undefined | EventReporter;
  createMessageMiddleware: null | undefined | CreateCustomMessageHandlerFn;
  deviceRelativeBaseUrl: URL;
  serverRelativeBaseUrl: URL;
  isProfilingBuild: boolean;
}>;
/**
 * Device class represents single device connection to Inspector Proxy. Each device
 * can have multiple inspectable pages.
 */
declare class Device {
  constructor(deviceOptions: DeviceOptions);
  /**
   * Used to recreate the device connection if there is a device ID collision.
   * 1. Checks if the same device is attempting to reconnect for the same app.
   * 2. If not, close both the device and debugger socket.
   * 3. If the debugger connection can be reused, close the device socket only.
   *
   * This hack attempts to allow users to reload the app, either as result of a
   * crash, or manually reloading, without having to restart the debugger.
   */
  dangerouslyRecreateDevice(deviceOptions: DeviceOptions): void;
  getName(): string;
  getApp(): string;
  getPagesList(): ReadonlyArray<Page>;
  handleDebuggerConnection(
    socket: WS,
    pageId: string,
    $$PARAM_2$$: Readonly<{
      debuggerRelativeBaseUrl: URL;
      userAgent: string | null;
    }>
  ): void;
  dangerouslyGetSocket(): WS;
}
export default Device;
