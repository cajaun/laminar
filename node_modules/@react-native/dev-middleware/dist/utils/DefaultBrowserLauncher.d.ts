/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

/**
 * Default `BrowserLauncher` implementation which opens URLs on the host
 * machine.
 */
declare const DefaultBrowserLauncher: {
  /**
   * Attempt to open the debugger frontend in a Google Chrome or Microsoft Edge
   * app window.
   */
  launchDebuggerAppWindow: (url: string) => Promise<void>;
};
declare const $$EXPORT_DEFAULT_DECLARATION$$: typeof DefaultBrowserLauncher;
declare type $$EXPORT_DEFAULT_DECLARATION$$ =
  typeof $$EXPORT_DEFAULT_DECLARATION$$;
export default $$EXPORT_DEFAULT_DECLARATION$$;
