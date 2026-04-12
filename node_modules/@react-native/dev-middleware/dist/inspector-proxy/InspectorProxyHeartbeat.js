"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _timers = require("timers");
var _ws = _interopRequireDefault(require("ws"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
class InspectorProxyHeartbeat {
  #socket;
  #timeBetweenPings;
  #minHighPingToReport;
  #timeoutMs;
  #onTimeout;
  #onHighPing;
  constructor(args) {
    this.#socket = args.socket;
    this.#timeBetweenPings = args.timeBetweenPings;
    this.#minHighPingToReport = args.minHighPingToReport;
    this.#timeoutMs = args.timeoutMs;
    this.#onTimeout = args.onTimeout;
    this.#onHighPing = args.onHighPing;
  }
  start() {
    let latestPingMs = Date.now();
    let terminateTimeout;
    const pingTimeout = (0, _timers.setTimeout)(() => {
      if (this.#socket.readyState !== _ws.default.OPEN) {
        pingTimeout.refresh();
        return;
      }
      if (!terminateTimeout) {
        terminateTimeout = (0, _timers.setTimeout)(() => {
          if (this.#socket.readyState !== _ws.default.OPEN) {
            terminateTimeout?.refresh();
            return;
          }
          this.#onTimeout(this.#timeoutMs);
        }, this.#timeoutMs).unref();
      }
      latestPingMs = Date.now();
      this.#socket.ping();
    }, this.#timeBetweenPings).unref();
    this.#socket.on("pong", () => {
      const roundtripDuration = Date.now() - latestPingMs;
      if (roundtripDuration >= this.#minHighPingToReport) {
        this.#onHighPing(roundtripDuration);
      }
      terminateTimeout?.refresh();
      pingTimeout.refresh();
    });
    this.#socket.on("message", () => {
      terminateTimeout?.refresh();
    });
    this.#socket.on("close", (code, reason) => {
      terminateTimeout && (0, _timers.clearTimeout)(terminateTimeout);
      (0, _timers.clearTimeout)(pingTimeout);
    });
  }
}
exports.default = InspectorProxyHeartbeat;
