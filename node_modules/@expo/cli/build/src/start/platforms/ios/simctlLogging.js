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
    SimulatorLogStreamer: function() {
        return SimulatorLogStreamer;
    },
    onMessage: function() {
        return onMessage;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
function _os() {
    const data = require("os");
    _os = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _wrapansi() {
    const data = /*#__PURE__*/ _interop_require_default(require("wrap-ansi"));
    _wrapansi = function() {
        return data;
    };
    return data;
}
const _simctl = require("./simctl");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
const _exit = require("../../../utils/exit");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
class SimulatorLogStreamer {
    static #_ = this.cache = [];
    static #_2 = this.getStreamer = (device, resolver)=>{
        return SimulatorLogStreamer.cache.find((streamer)=>streamer.device.udid === device.udid) ?? new SimulatorLogStreamer(device, resolver);
    };
    constructor(device, resolver){
        this.device = device;
        this.resolver = resolver;
        this.childProcess = null;
        this.off = null;
    }
    isAttached() {
        return !!this.childProcess;
    }
    async resolvePidAsync() {
        if ('pid' in this.resolver) {
            return this.resolver.pid;
        }
        return getImageNameFromBundleIdentifierAsync(this.device.udid, this.resolver.appId);
    }
    async attachAsync() {
        await this.detachAsync();
        const pid = await this.resolvePidAsync();
        if (!pid) {
            throw new _errors.CommandError(`Could not find pid for ${this.device.udid}`);
        }
        // xcrun simctl spawn booted log stream --process --style json
        this.childProcess = (0, _child_process().spawn)('xcrun', [
            'simctl',
            'spawn',
            this.device.udid,
            'log',
            'stream',
            '--process',
            pid,
            // ndjson provides a better format than json.
            '--style',
            'ndjson',
            // Provide the source so we can filter logs better
            '--source',
            // log, activity, trace -- activity was related to layouts, trace didn't work, so that leaves log.
            // Passing nothing combines all three, but we don't use activity.
            '--type',
            'log',
            // backtrace doesn't seem very useful in basic cases.
            // TODO: Maybe we can format as a stack trace for native errors.
            '--no-backtrace'
        ]);
        this.childProcess.stdout.on('data', (data)=>{
            // Sometimes more than one chunk comes at a time, here we split by system newline,
            // then trim and filter.
            const strings = data.toString().split(_os().EOL).map((value)=>value.trim())// This filters out the first log which says something like:
            // Filtering the log data using "process BEGINSWITH[cd] "my-app" AND type == 1024"
            .filter((value)=>value.startsWith('{'));
            strings.forEach((str)=>{
                const simLog = parseMessageJson(str);
                if (!simLog) {
                    return;
                }
                onMessage(simLog);
            });
        });
        this.childProcess.on('error', ({ message })=>{
            _log.debug('[simctl error]:', message);
        });
        this.off = (0, _exit.installExitHooks)(()=>{
            this.detachAsync.bind(this);
        });
    }
    detachAsync() {
        this.off == null ? void 0 : this.off.call(this);
        this.off = null;
        if (this.childProcess) {
            return new Promise((resolve)=>{
                var _this_childProcess, _this_childProcess1;
                (_this_childProcess = this.childProcess) == null ? void 0 : _this_childProcess.on('close', resolve);
                (_this_childProcess1 = this.childProcess) == null ? void 0 : _this_childProcess1.kill();
                this.childProcess = null;
            });
        }
        return Promise.resolve();
    }
}
function parseMessageJson(data) {
    const stringData = data.toString();
    try {
        return JSON.parse(stringData);
    } catch  {
        _log.debug('Failed to parse simctl JSON message:\n' + stringData);
    }
    return null;
}
// There are a lot of networking logs in RN that aren't relevant to the user.
function isNetworkLog(simLog) {
    var _simLog_source;
    return simLog.subsystem === 'com.apple.network' || simLog.category === 'connection' || ((_simLog_source = simLog.source) == null ? void 0 : _simLog_source.image) === 'CFNetwork';
}
function isReactLog(simLog) {
    var _simLog_source;
    return simLog.subsystem === 'com.facebook.react.log' && ((_simLog_source = simLog.source) == null ? void 0 : _simLog_source.file) === 'RCTLog.mm';
}
// It's not clear what these are but they aren't very useful.
// (The connection to service on pid 0 named com.apple.commcenter.coretelephony.xpc was invalidated)
// We can add them later if need.
function isCoreTelephonyLog(simLog) {
    // [CoreTelephony] Updating selectors failed with: Error Domain=NSCocoaErrorDomain Code=4099
    // "The connection to service on pid 0 named com.apple.commcenter.coretelephony.xpc was invalidated." UserInfo={NSDebugDescription=The connection to service on pid 0 named com.apple.commcenter.coretelephony.xpc was invalidated.}
    return simLog.subsystem === 'com.apple.CoreTelephony';
}
// https://stackoverflow.com/a/65313219/4047926
function isWebKitLog(simLog) {
    // [WebKit] 0x1143ca500 - ProcessAssertion: Failed to acquire RBS Background assertion 'WebProcess Background Assertion' for process with PID 27084, error: Error Domain=RBSAssertionErrorDomain Code=3 "Target is not running or required target
    // entitlement is missing" UserInfo={RBSAssertionAttribute=<RBSDomainAttribute| domain:"com.apple.webkit" name:"Background" sourceEnvironment:"(null)">, NSLocalizedFailureReason=Target is not running or required target entitlement is missing}
    return simLog.subsystem === 'com.apple.WebKit';
}
// Similar to WebKit logs
function isRunningBoardServicesLog(simLog) {
    // [RunningBoardServices] Error acquiring assertion: <Error Domain=RBSAssertionErrorDomain Code=3 "Target is not running or required target entitlement is missing" UserInfo={RBSAssertionAttribute=<RBSDomainAttribute| domain:"com.apple.webkit"
    // name:"Background" sourceEnvironment:"(null)">, NSLocalizedFailureReason=Target is not running or required target entitlement is missing}>
    return simLog.subsystem === 'com.apple.runningboard';
}
function formatMessage(simLog) {
    var _simLog_source;
    // TODO: Maybe change "TCC" to "Consent" or "System".
    const category = _chalk().default.gray(`[${((_simLog_source = simLog.source) == null ? void 0 : _simLog_source.image) ?? simLog.subsystem}]`);
    const message = simLog.eventMessage;
    return (0, _wrapansi().default)(category + ' ' + message, process.stdout.columns || 80);
}
function onMessage(simLog) {
    let hasLogged = false;
    if (simLog.messageType === 'Error') {
        if (// Hide all networking errors which are mostly useless.
        !isNetworkLog(simLog) && // Showing React errors will result in duplicate messages.
        !isReactLog(simLog) && !isCoreTelephonyLog(simLog) && !isWebKitLog(simLog) && !isRunningBoardServicesLog(simLog)) {
            hasLogged = true;
            // Sim: This app has crashed because it attempted to access privacy-sensitive data without a usage description.  The app's Info.plist must contain an NSCameraUsageDescription key with a string value explaining to the user how the app uses this data.
            _log.error(formatMessage(simLog));
        }
    } else if (simLog.eventMessage) {
        var _simLog_source;
        // If the source has a file (i.e. not a system log).
        if (((_simLog_source = simLog.source) == null ? void 0 : _simLog_source.file) || simLog.eventMessage.includes('Terminating app due to uncaught exception')) {
            hasLogged = true;
            _log.log(formatMessage(simLog));
        }
    }
    if (!hasLogged) {
        _log.debug(formatMessage(simLog));
    } else {
    // console.log('DATA:', JSON.stringify(simLog));
    }
}
/**
 *
 * @param udid
 * @param bundleIdentifier
 * @returns Image name like `Exponent` and `null` when the app is not installed on the provided simulator.
 */ async function getImageNameFromBundleIdentifierAsync(udid, bundleIdentifier) {
    const containerPath = await (0, _simctl.getContainerPathAsync)({
        udid
    }, {
        appId: bundleIdentifier
    });
    if (containerPath) {
        return getImageNameFromContainerPath(containerPath);
    }
    return null;
}
function getImageNameFromContainerPath(binaryPath) {
    return _path().default.basename(binaryPath).split('.')[0];
}

//# sourceMappingURL=simctlLogging.js.map