"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _getBaseUrlFromRequest = _interopRequireDefault(
  require("../utils/getBaseUrlFromRequest")
);
var _getDevToolsFrontendUrl = _interopRequireDefault(
  require("../utils/getDevToolsFrontendUrl")
);
var _Device = _interopRequireDefault(require("./Device"));
var _EventLoopPerfTracker = _interopRequireDefault(
  require("./EventLoopPerfTracker")
);
var _InspectorProxyHeartbeat = _interopRequireDefault(
  require("./InspectorProxyHeartbeat")
);
var _nullthrows = _interopRequireDefault(require("nullthrows"));
var _url = _interopRequireDefault(require("url"));
var _ws = _interopRequireDefault(require("ws"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const debug = require("debug")("Metro:InspectorProxy");
const WS_DEVICE_URL = "/inspector/device";
const WS_DEBUGGER_URL = "/inspector/debug";
const PAGES_LIST_JSON_URL = "/json";
const PAGES_LIST_JSON_URL_2 = "/json/list";
const PAGES_LIST_JSON_VERSION_URL = "/json/version";
const HEARTBEAT_TIME_BETWEEN_PINGS_MS = 5000;
const HEARTBEAT_TIMEOUT_MS = 60000;
const MIN_PING_TO_REPORT = 500;
const EVENT_LOOP_PERF_MEASUREMENT_MS = 5000;
const MIN_EVENT_LOOP_DELAY_PERCENT_TO_REPORT = 20;
const INTERNAL_ERROR_CODE = 1011;
const INTERNAL_ERROR_MESSAGES = {
  UNREGISTERED_DEVICE:
    "[UNREGISTERED_DEVICE] Debugger connection attempted for a device that was not registered",
  INCORRECT_URL:
    "[INCORRECT_URL] Incorrect URL - device and page IDs must be provided",
};
class InspectorProxy {
  #projectRoot;
  #serverBaseUrl;
  #devices;
  #deviceCounter = 0;
  #eventReporter;
  #experiments;
  #customMessageHandler;
  #logger;
  #lastMessageTimestamp = null;
  #eventLoopPerfTracker;
  constructor(
    projectRoot,
    serverBaseUrl,
    eventReporter,
    experiments,
    logger,
    customMessageHandler,
    trackEventLoopPerf = false
  ) {
    this.#projectRoot = projectRoot;
    this.#serverBaseUrl = new URL(serverBaseUrl);
    this.#devices = new Map();
    this.#eventReporter = eventReporter;
    this.#experiments = experiments;
    this.#logger = logger;
    this.#customMessageHandler = customMessageHandler;
    if (trackEventLoopPerf) {
      this.#eventLoopPerfTracker = new _EventLoopPerfTracker.default({
        perfMeasurementDuration: EVENT_LOOP_PERF_MEASUREMENT_MS,
        minDelayPercentToReport: MIN_EVENT_LOOP_DELAY_PERCENT_TO_REPORT,
        onHighDelay: ({
          eventLoopUtilization,
          maxEventLoopDelayPercent,
          duration,
          debuggerSessionIDs,
          connectionUptime,
        }) => {
          debug(
            "[perf] high event loop delay in the last %ds- event loop utilization='%d%' max event loop delay percent='%d%'",
            duration / 1000,
            eventLoopUtilization,
            maxEventLoopDelayPercent
          );
          this.#eventReporter?.logEvent({
            type: "high_event_loop_delay",
            eventLoopUtilization,
            maxEventLoopDelayPercent,
            duration,
            connectionUptime,
            ...debuggerSessionIDs,
          });
        },
      });
    }
  }
  getPageDescriptions({
    requestorRelativeBaseUrl,
    logNoPagesForConnectedDevice = false,
  }) {
    let result = [];
    Array.from(this.#devices.entries()).forEach(([deviceId, device]) => {
      const devicePages = device
        .getPagesList()
        .map((page) =>
          this.#buildPageDescription(
            deviceId,
            device,
            page,
            requestorRelativeBaseUrl
          )
        );
      if (
        logNoPagesForConnectedDevice &&
        devicePages.length === 0 &&
        device.dangerouslyGetSocket()?.readyState === _ws.default.OPEN
      ) {
        this.#logger?.warn(
          `Waiting for a DevTools connection to app='%s' on device='%s'.
    Try again when the main bundle for the app is built and connection is established.
    If no connection occurs, try to:
    - Restart the app. For Android, force stopping the app first might be required.
    - Ensure a stable connection to the device.
    - Ensure that the app is built in a mode that supports debugging.
    - Take the app out of running in the background.`,
          device.getApp(),
          device.getName()
        );
        this.#eventReporter?.logEvent({
          type: "no_debug_pages_for_device",
          appId: device.getApp(),
          deviceName: device.getName(),
          deviceId: deviceId,
          pageId: null,
        });
      }
      result = result.concat(devicePages);
    });
    return result;
  }
  processRequest(request, response, next) {
    const pathname = _url.default.parse(request.url).pathname;
    if (
      pathname === PAGES_LIST_JSON_URL ||
      pathname === PAGES_LIST_JSON_URL_2
    ) {
      this.#sendJsonResponse(
        response,
        this.getPageDescriptions({
          requestorRelativeBaseUrl:
            (0, _getBaseUrlFromRequest.default)(request) ?? this.#serverBaseUrl,
          logNoPagesForConnectedDevice: true,
        })
      );
    } else if (pathname === PAGES_LIST_JSON_VERSION_URL) {
      this.#sendJsonResponse(response, {
        Browser: "Mobile JavaScript",
        "Protocol-Version": "1.1",
      });
    } else {
      next();
    }
  }
  createWebSocketListeners() {
    return {
      [WS_DEVICE_URL]: this.#createDeviceConnectionWSServer(),
      [WS_DEBUGGER_URL]: this.#createDebuggerConnectionWSServer(),
    };
  }
  #buildPageDescription(deviceId, device, page, requestorRelativeBaseUrl) {
    const { host, protocol } = requestorRelativeBaseUrl;
    const webSocketScheme = protocol === "https:" ? "wss" : "ws";
    const webSocketUrlWithoutProtocol = `${host}${WS_DEBUGGER_URL}?device=${deviceId}&page=${page.id}`;
    const webSocketDebuggerUrl = `${webSocketScheme}://${webSocketUrlWithoutProtocol}`;
    const devtoolsFrontendUrl = (0, _getDevToolsFrontendUrl.default)(
      this.#experiments,
      webSocketDebuggerUrl,
      this.#serverBaseUrl.origin,
      {
        relative: true,
        useFuseboxEntryPoint: page.capabilities.prefersFuseboxFrontend,
      }
    );
    return {
      id: `${deviceId}-${page.id}`,
      title: page.title,
      description: page.description ?? page.app,
      appId: page.app,
      type: "node",
      devtoolsFrontendUrl,
      webSocketDebuggerUrl,
      ...(page.vm != null
        ? {
            vm: page.vm,
          }
        : null),
      deviceName: device.getName(),
      reactNative: {
        logicalDeviceId: deviceId,
        capabilities: (0, _nullthrows.default)(page.capabilities),
      },
    };
  }
  #sendJsonResponse(response, object) {
    const data = JSON.stringify(object, null, 2);
    response.writeHead(200, {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-cache",
      "Content-Length": Buffer.byteLength(data).toString(),
      Connection: "close",
    });
    response.end(data);
  }
  #getTimeSinceLastCommunication() {
    const timestamp = this.#lastMessageTimestamp;
    return timestamp == null ? null : Date.now() - timestamp;
  }
  #onMessageFromDeviceOrDebugger(
    message,
    debuggerSessionIDs,
    connectionUptime
  ) {
    if (message.includes('"event":"getPages"')) {
      return;
    }
    this.#lastMessageTimestamp = Date.now();
    this.#eventLoopPerfTracker?.trackPerfThrottled(
      debuggerSessionIDs,
      connectionUptime
    );
  }
  #createDeviceConnectionWSServer() {
    const wss = new _ws.default.Server({
      noServer: true,
      perMessageDeflate: true,
      maxPayload: 0,
    });
    wss.on("connection", async (socket, req) => {
      const wssTimestamp = Date.now();
      const fallbackDeviceId = String(this.#deviceCounter++);
      const query = _url.default.parse(req.url || "", true).query || {};
      const deviceId = query.device || fallbackDeviceId;
      const deviceName = query.name || "Unknown";
      const appName = query.app || "Unknown";
      const isProfilingBuild = query.profiling === "true";
      try {
        const deviceRelativeBaseUrl =
          (0, _getBaseUrlFromRequest.default)(req) ?? this.#serverBaseUrl;
        const oldDevice = this.#devices.get(deviceId);
        let newDevice;
        const deviceOptions = {
          id: deviceId,
          name: deviceName,
          app: appName,
          socket,
          projectRoot: this.#projectRoot,
          eventReporter: this.#eventReporter,
          createMessageMiddleware: this.#customMessageHandler,
          deviceRelativeBaseUrl,
          serverRelativeBaseUrl: this.#serverBaseUrl,
          isProfilingBuild,
        };
        if (oldDevice) {
          oldDevice.dangerouslyRecreateDevice(deviceOptions);
          newDevice = oldDevice;
        } else {
          newDevice = new _Device.default(deviceOptions);
        }
        this.#devices.set(deviceId, newDevice);
        this.#logger?.info(
          "Connection established to app='%s' on device='%s'.",
          appName,
          deviceName
        );
        debug(
          "Got new device connection: name='%s', app=%s, device=%s, via=%s",
          deviceName,
          appName,
          deviceId,
          deviceRelativeBaseUrl.origin
        );
        const debuggerSessionIDs = {
          appId: newDevice?.getApp() || null,
          deviceId,
          deviceName: newDevice?.getName() || null,
          pageId: null,
        };
        const heartbeat = new _InspectorProxyHeartbeat.default({
          socket,
          timeBetweenPings: HEARTBEAT_TIME_BETWEEN_PINGS_MS,
          minHighPingToReport: MIN_PING_TO_REPORT,
          timeoutMs: HEARTBEAT_TIMEOUT_MS,
          onHighPing: (roundtripDuration) => {
            debug(
              "[high ping] [ Device ] %sms for app='%s' on device='%s'",
              String(roundtripDuration).padStart(5),
              debuggerSessionIDs.appId,
              debuggerSessionIDs.deviceName
            );
            this.#eventReporter?.logEvent({
              type: "device_high_ping",
              duration: roundtripDuration,
              timeSinceLastCommunication: this.#getTimeSinceLastCommunication(),
              connectionUptime: Date.now() - wssTimestamp,
              ...debuggerSessionIDs,
            });
          },
          onTimeout: (roundtripDuration) => {
            socket.terminate();
            this.#logger?.error(
              "[timeout] connection terminated with Device for app='%s' on device='%s' after not responding for %s seconds.",
              debuggerSessionIDs.appId ?? "unknown",
              debuggerSessionIDs.deviceName ?? "unknown",
              String(roundtripDuration / 1000)
            );
            this.#eventReporter?.logEvent({
              type: "device_timeout",
              duration: roundtripDuration,
              timeSinceLastCommunication: this.#getTimeSinceLastCommunication(),
              connectionUptime: Date.now() - wssTimestamp,
              ...debuggerSessionIDs,
            });
          },
        });
        heartbeat.start();
        socket.on("message", (message) =>
          this.#onMessageFromDeviceOrDebugger(
            message.toString(),
            debuggerSessionIDs,
            Date.now() - wssTimestamp
          )
        );
        socket.on("close", (code, reason) => {
          this.#logger?.info(
            "Connection closed to device='%s' for app='%s' with code='%s' and reason='%s'.",
            deviceName,
            appName,
            String(code),
            reason
          );
          this.#eventReporter?.logEvent({
            type: "device_connection_closed",
            code,
            reason,
            timeSinceLastCommunication: this.#getTimeSinceLastCommunication(),
            connectionUptime: Date.now() - wssTimestamp,
            ...debuggerSessionIDs,
          });
          if (this.#devices.get(deviceId)?.dangerouslyGetSocket() === socket) {
            this.#devices.delete(deviceId);
          }
        });
      } catch (error) {
        this.#logger?.error(
          "Connection failed to be established with app='%s' on device='%s' with error:",
          appName,
          deviceName,
          error
        );
        socket.close(INTERNAL_ERROR_CODE, error?.toString() ?? "Unknown error");
      }
    });
    return wss;
  }
  #createDebuggerConnectionWSServer() {
    const wss = new _ws.default.Server({
      noServer: true,
      perMessageDeflate: false,
      maxPayload: 0,
    });
    wss.on("connection", async (socket, req) => {
      const wssTimestamp = Date.now();
      const query = _url.default.parse(req.url || "", true).query || {};
      const deviceId = query.device;
      const pageId = query.page;
      const debuggerRelativeBaseUrl =
        (0, _getBaseUrlFromRequest.default)(req) ?? this.#serverBaseUrl;
      const device = deviceId ? this.#devices.get(deviceId) : undefined;
      const debuggerSessionIDs = {
        appId: device?.getApp() || null,
        deviceId,
        deviceName: device?.getName() || null,
        pageId,
      };
      try {
        if (deviceId == null || pageId == null) {
          throw new Error(INTERNAL_ERROR_MESSAGES.INCORRECT_URL);
        }
        if (device == null) {
          throw new Error(INTERNAL_ERROR_MESSAGES.UNREGISTERED_DEVICE);
        }
        this.#logger?.info(
          "Connection established to DevTools for app='%s' on device='%s'.",
          device.getApp() || "unknown",
          device.getName() || "unknown"
        );
        const heartbeat = new _InspectorProxyHeartbeat.default({
          socket,
          timeBetweenPings: HEARTBEAT_TIME_BETWEEN_PINGS_MS,
          minHighPingToReport: MIN_PING_TO_REPORT,
          timeoutMs: HEARTBEAT_TIMEOUT_MS,
          onHighPing: (roundtripDuration) => {
            debug(
              "[high ping] [DevTools] %sms for app='%s' on device='%s'",
              String(roundtripDuration).padStart(5),
              debuggerSessionIDs.appId,
              debuggerSessionIDs.deviceName
            );
            this.#eventReporter?.logEvent({
              type: "debugger_high_ping",
              duration: roundtripDuration,
              timeSinceLastCommunication: this.#getTimeSinceLastCommunication(),
              connectionUptime: Date.now() - wssTimestamp,
              ...debuggerSessionIDs,
            });
          },
          onTimeout: (roundtripDuration) => {
            socket.terminate();
            this.#logger?.error(
              "[timeout] connection terminated with DevTools for app='%s' on device='%s' after not responding for %s seconds.",
              debuggerSessionIDs.appId ?? "unknown",
              debuggerSessionIDs.deviceName ?? "unknown",
              String(roundtripDuration / 1000)
            );
            this.#eventReporter?.logEvent({
              type: "debugger_timeout",
              duration: roundtripDuration,
              timeSinceLastCommunication: this.#getTimeSinceLastCommunication(),
              connectionUptime: Date.now() - wssTimestamp,
              ...debuggerSessionIDs,
            });
          },
        });
        heartbeat.start();
        socket.on("message", (message) =>
          this.#onMessageFromDeviceOrDebugger(
            message.toString(),
            debuggerSessionIDs,
            Date.now() - wssTimestamp
          )
        );
        device.handleDebuggerConnection(socket, pageId, {
          debuggerRelativeBaseUrl,
          userAgent: req.headers["user-agent"] ?? query.userAgent ?? null,
        });
        socket.on("close", (code, reason) => {
          this.#logger?.info(
            "Connection closed to DevTools for app='%s' on device='%s' with code='%s' and reason='%s'.",
            device.getApp() || "unknown",
            device.getName() || "unknown",
            String(code),
            reason
          );
          this.#eventReporter?.logEvent({
            type: "debugger_connection_closed",
            code,
            reason,
            timeSinceLastCommunication: this.#getTimeSinceLastCommunication(),
            connectionUptime: Date.now() - wssTimestamp,
            ...debuggerSessionIDs,
          });
        });
      } catch (error) {
        this.#logger?.error(
          "Connection failed to be established with DevTools for app='%s' on device='%s' and device id='%s' with error:",
          device?.getApp() || "unknown",
          device?.getName() || "unknown",
          deviceId,
          error
        );
        socket.close(INTERNAL_ERROR_CODE, error?.toString() ?? "Unknown error");
        this.#eventReporter?.logEvent({
          type: "connect_debugger_frontend",
          status: "error",
          error,
          ...debuggerSessionIDs,
        });
      }
    });
    return wss;
  }
}
exports.default = InspectorProxy;
