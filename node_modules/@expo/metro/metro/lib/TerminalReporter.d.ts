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

import type { BundleDetails, ReportableEvent } from "./reporting";
import type { Terminal } from "../../metro-core";
import type { HealthCheckResult, WatcherStatus } from "../../metro-file-map";
export interface BundleProgress {
  bundleDetails: BundleDetails;
  transformedFileCount: number;
  totalFileCount: number;
  ratio: number;
  isPrefetch?: boolean;
}
export type TerminalReportableEvent = ReportableEvent | {
  buildID: string;
  type: "bundle_transform_progressed_throttled";
  transformedFileCount: number;
  totalFileCount: number;
} | {
  type: "unstable_server_log";
  level?: "info" | "warn" | "error";
  data?: string | Array<any>;
} | {
  type: "unstable_server_menu_updated";
  message: string;
} | {
  type: "unstable_server_menu_cleared";
};
export declare const enum _BuildPhase {
  in_progress = "in_progress",
  done = "done",
  failed = "failed",
}
export type BuildPhase = `${_BuildPhase}`;
type SnippetError = any & {
  filename?: string;
  snippet?: string;
};
/**
 * We try to print useful information to the terminal for interactive builds.
 * This implements the `Reporter` interface from the './reporting' module.
 */
declare class TerminalReporter {
  _activeBundles: Map<string, BundleProgress>;
  _interactionStatus: null | undefined | string;
  _scheduleUpdateBundleProgress: {
    cancel(): void;
    (data: {
      buildID: string;
      transformedFileCount: number;
      totalFileCount: number;
    }): void;
  };
  _prevHealthCheckResult: null | undefined | HealthCheckResult;
  readonly terminal: Terminal;
  constructor(terminal: Terminal);
  _getBundleStatusMessage($$PARAM_0$$: BundleProgress, phase: BuildPhase): string;
  _logBundleBuildDone(buildID: string): void;
  _logBundleBuildFailed(buildID: string): void;
  _logInitializing(port: number, hasReducedPerformance: boolean): void;
  _logInitializingFailed(port: number, error: SnippetError): void;
  _log(event: TerminalReportableEvent): void;
  _logBundlingError(error: SnippetError): void;
  _logWorkerChunk(origin: "stdout" | "stderr", chunk: string): void;
  _updateBundleProgress($$PARAM_0$$: {
    buildID: string;
    transformedFileCount: number;
    totalFileCount: number;
  }): void;
  _updateState(event: TerminalReportableEvent): void;
  _getStatusMessage(): string;
  _logHmrClientError(e: Error): void;
  _logWarning(message: string): void;
  _logWatcherHealthCheckResult(result: HealthCheckResult): void;
  _logWatcherStatus(status: WatcherStatus): void;
  update(event: TerminalReportableEvent): void;
}
export default TerminalReporter;