"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _perf_hooks = require("perf_hooks");
var _timers = require("timers");
class EventLoopPerfTracker {
  #perfMeasurementDuration;
  #minDelayPercentToReport;
  #onHighDelay;
  #eventLoopPerfMeasurementOngoing;
  constructor(args) {
    this.#perfMeasurementDuration = args.perfMeasurementDuration;
    this.#minDelayPercentToReport = args.minDelayPercentToReport;
    this.#onHighDelay = args.onHighDelay;
    this.#eventLoopPerfMeasurementOngoing = false;
  }
  trackPerfThrottled(debuggerSessionIDs, connectionUptime) {
    if (this.#eventLoopPerfMeasurementOngoing) {
      return;
    }
    this.#eventLoopPerfMeasurementOngoing = true;
    const eluStart = _perf_hooks.performance.eventLoopUtilization();
    const h = (0, _perf_hooks.monitorEventLoopDelay)({
      resolution: 20,
    });
    h.enable();
    (0, _timers.setTimeout)(() => {
      const eluEnd = _perf_hooks.performance.eventLoopUtilization(eluStart);
      h.disable();
      const eventLoopUtilization = Math.floor(eluEnd.utilization * 100);
      const maxEventLoopDelayPercent = Math.floor(
        (h.max / 1e6 / this.#perfMeasurementDuration) * 100
      );
      if (maxEventLoopDelayPercent >= this.#minDelayPercentToReport) {
        this.#onHighDelay({
          eventLoopUtilization,
          maxEventLoopDelayPercent,
          duration: this.#perfMeasurementDuration,
          debuggerSessionIDs,
          connectionUptime,
        });
      }
      this.#eventLoopPerfMeasurementOngoing = false;
    }, this.#perfMeasurementDuration).unref();
  }
}
exports.default = EventLoopPerfTracker;
