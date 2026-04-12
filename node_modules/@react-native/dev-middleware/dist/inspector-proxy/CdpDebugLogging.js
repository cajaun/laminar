"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _timers = require("timers");
var _util = _interopRequireDefault(require("util"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const debug = require("debug")("Metro:InspectorProxy");
const debugCDPMessages = require("debug")("Metro:InspectorProxyCDPMessages");
const CDP_MESSAGES_BATCH_DEBUGGING_THROTTLE_MS = 5000;
function getCDPLogPrefix(destination) {
  return _util.default.format(
    "[(Debugger) %s (Proxy) %s (Device)]",
    destination === "DebuggerToProxy"
      ? "->"
      : destination === "ProxyToDebugger"
      ? "<-"
      : "  ",
    destination === "ProxyToDevice"
      ? "->"
      : destination === "DeviceToProxy"
      ? "<-"
      : "  "
  );
}
class CdpDebugLogging {
  #cdpMessagesLoggingBatchingFn = {
    DebuggerToProxy: () => {},
    ProxyToDebugger: () => {},
    DeviceToProxy: () => {},
    ProxyToDevice: () => {},
  };
  constructor() {
    if (debug.enabled) {
      this.#initializeThrottledCDPMessageLogging();
    }
  }
  #initializeThrottledCDPMessageLogging() {
    const batchingCounters = {
      DebuggerToProxy: {
        count: 0,
        size: 0,
      },
      ProxyToDebugger: {
        count: 0,
        size: 0,
      },
      DeviceToProxy: {
        count: 0,
        size: 0,
      },
      ProxyToDevice: {
        count: 0,
        size: 0,
      },
    };
    Object.keys(batchingCounters).forEach((destination) => {
      let timeout = null;
      this.#cdpMessagesLoggingBatchingFn[destination] = (message) => {
        if (message.length > 1024 * 100) {
          const messagePreview = JSON.stringify(
            JSON.parse(message, (key, value) => {
              if (Array.isArray(value)) {
                return "[ARRAY]";
              }
              if (typeof value === "string" && value.length > 50) {
                return value.slice(0, 50) + "...";
              }
              return value;
            }),
            null,
            2
          );
          debug(
            "%s A large message (%s MB) was %s- %s",
            getCDPLogPrefix(destination),
            (message.length / (1024 * 1024)).toFixed(2),
            destination.startsWith("Proxy") ? "  sent  " : "received",
            messagePreview
          );
        }
        if (timeout == null) {
          timeout = (0, _timers.setTimeout)(() => {
            debug(
              "%s %s CDP messages of size %s MB %s in the last %ss.",
              getCDPLogPrefix(destination),
              String(batchingCounters[destination].count).padStart(4),
              String(
                (batchingCounters[destination].size / (1024 * 1024)).toFixed(2)
              ).padStart(6),
              destination.startsWith("Proxy") ? "  sent  " : "received",
              CDP_MESSAGES_BATCH_DEBUGGING_THROTTLE_MS / 1000
            );
            batchingCounters[destination].count = 0;
            batchingCounters[destination].size = 0;
            timeout = null;
          }, CDP_MESSAGES_BATCH_DEBUGGING_THROTTLE_MS).unref();
        }
        batchingCounters[destination].count++;
        batchingCounters[destination].size += message.length;
      };
    });
  }
  log(destination, message) {
    if (debugCDPMessages.enabled) {
      debugCDPMessages("%s message: %s", getCDPLogPrefix(destination), message);
    }
    if (debug.enabled) {
      this.#cdpMessagesLoggingBatchingFn[destination](message);
    }
  }
}
exports.default = CdpDebugLogging;
