// This file represents an abstraction on the metro TerminalReporter.
// We use this abstraction to safely extend the TerminalReporter for our own custom logging.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    TerminalReporter: function() {
        return TerminalReporter;
    },
    logError: function() {
        return logError;
    },
    logWarning: function() {
        return logWarning;
    }
});
function _TerminalReporter() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro/lib/TerminalReporter"));
    _TerminalReporter = function() {
        return data;
    };
    return data;
}
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _util() {
    const data = /*#__PURE__*/ _interop_require_default(require("util"));
    _util = function() {
        return data;
    };
    return data;
}
const _ansi = require("../../../utils/ansi");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:metro:logger');
function logWarning(terminal, format, ...args) {
    const str = _util().default.format(format, ...args);
    terminal.log('%s: %s', _chalk().default.yellow('warning'), str);
}
function logError(terminal, format, ...args) {
    terminal.log('%s: %s', _chalk().default.red('error'), // Syntax errors may have colors applied for displaying code frames
    // in various places outside of where Metro is currently running.
    // If the current terminal does not support color, we'll strip the colors
    // here.
    _util().default.format(_chalk().default.supportsColor ? format : (0, _ansi.stripAnsi)(format), ...args));
}
const XTerminalReporter = _TerminalReporter().default;
class TerminalReporter extends XTerminalReporter {
    _log(event) {
        switch(event.type){
            case 'transform_cache_reset':
                return this.transformCacheReset();
            case 'dep_graph_loading':
                return this.dependencyGraphLoading(event.hasReducedPerformance);
            case 'client_log':
                if (this.shouldFilterClientLog(event)) {
                    return;
                }
                break;
        }
        return super._log(event);
    }
    /** Gives subclasses an easy interface for filtering out logs. Return `true` to skip. */ shouldFilterClientLog(event) {
        return false;
    }
    /** Gives subclasses an easy interface for filtering out bundle events, specifically for source maps. Return `true` to skip. */ shouldFilterBundleEvent(event) {
        return false;
    }
    /** Cache has been reset. */ transformCacheReset() {}
    /** One of the first logs that will be printed. */ dependencyGraphLoading(hasReducedPerformance) {}
    /**
   * Custom log event representing the end of the bundling.
   *
   * @param event event object.
   * @param duration duration of the build in milliseconds.
   */ bundleBuildEnded(event, duration) {}
    // Add a custom format to logs that come from the worker threads.
    // `| <contents>`
    _logWorkerChunk(origin, chunk) {
        const lines = chunk.split('\n');
        if (lines.length >= 1 && lines[lines.length - 1] === '') {
            lines.splice(lines.length - 1, 1);
        }
        const originTag = origin === 'stdout' ? _chalk().default.dim('|') : _chalk().default.yellow('|');
        lines.forEach((line)=>{
            this.terminal.log(originTag, line);
        });
    }
    _logWatcherStatus(status) {
        // Metro logs this warning twice. This helps reduce the noise.
        if (status.type === 'watchman_warning') {
            return;
        }
        return super._logWatcherStatus(status);
    }
    /**
   * This function is exclusively concerned with updating the internal state.
   * No logging or status updates should be done at this point.
   */ _updateState(event) {
        var _event_bundleDetails;
        // Append the buildID to the bundleDetails.
        if (event.bundleDetails) {
            event.bundleDetails.buildID = event.buildID;
        }
        const buildID = ((_event_bundleDetails = event.bundleDetails) == null ? void 0 : _event_bundleDetails.buildID) ?? event.buildID;
        if (buildID && !this._hiddenBundleEvents.has(buildID)) {
            if (this.shouldFilterBundleEvent(event)) {
                debug('skipping bundle events for', buildID, event);
                this._hiddenBundleEvents.add(buildID);
            } else {
                super._updateState(event);
            }
        } else {
            super._updateState(event);
        }
        switch(event.type){
            case 'bundle_build_done':
            case 'bundle_build_failed':
                {
                    const startTime = this._bundleTimers.get(event.buildID);
                    // Observed a bug in Metro where the `bundle_build_done` is invoked twice during a static bundle
                    // i.e. `expo export`.
                    if (startTime == null) {
                        break;
                    }
                    this.bundleBuildEnded(event, startTime ? process.hrtime.bigint() - startTime : 0);
                    this._bundleTimers.delete(event.buildID);
                    break;
                }
            case 'bundle_build_started':
                this._bundleDetails.set(event.buildID, event.bundleDetails);
                this._bundleTimers.set(event.buildID, process.hrtime.bigint());
                break;
        }
    }
    /**
   * We use Math.pow(ratio, 2) to as a conservative measure of progress because
   * we know the `totalCount` is going to progressively increase as well. We
   * also prevent the ratio from going backwards.
   */ _updateBundleProgress(options) {
        super._updateBundleProgress(options);
        const currentProgress = this._activeBundles.get(options.buildID);
        if (!currentProgress) {
            return;
        }
        // Fix an issue where the transformer is faster than the resolver,
        // locking the progress bar at 100% after transforming the first and only resolved file (1/1).
        if (currentProgress.ratio === 1 && options.totalFileCount === 1) {
            Object.assign(currentProgress, {
                ...currentProgress,
                ratio: 0
            });
        }
    }
    constructor(...args){
        super(...args), /**
   * A cache of { [buildID]: BundleDetails } which can be used to
   * add more contextual logs. BundleDetails is currently only sent with `bundle_build_started`
   * so we need to cache the details in order to print the platform info with other event types.
   */ this._bundleDetails = new Map(), /** Keep track of how long a bundle takes to complete */ this._bundleTimers = new Map(), /** Keep track of bundle processes that should not be logged. */ this._hiddenBundleEvents = new Set();
    }
}

//# sourceMappingURL=TerminalReporter.js.map