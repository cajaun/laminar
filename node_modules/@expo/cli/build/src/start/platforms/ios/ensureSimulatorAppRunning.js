"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureSimulatorAppRunningAsync", {
    enumerable: true,
    get: function() {
        return ensureSimulatorAppRunningAsync;
    }
});
function _osascript() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/osascript"));
    _osascript = function() {
        return data;
    };
    return data;
}
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _delay = require("../../../utils/delay");
const _errors = require("../../../utils/errors");
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
async function ensureSimulatorAppRunningAsync(device, { maxWaitTime } = {}) {
    if (await isSimulatorAppRunningAsync()) {
        return;
    }
    _log.log(`\u203A Opening the iOS simulator, this might take a moment.`);
    // In theory this would ensure the correct simulator is booted as well.
    // This isn't theory though, this is Xcode.
    await openSimulatorAppAsync(device);
    if (!await waitForSimulatorAppToStart({
        maxWaitTime
    })) {
        throw new _errors.CommandError('SIMULATOR_TIMEOUT', `Simulator app did not open fast enough. Try opening Simulator first, then running your app.`);
    }
}
async function waitForSimulatorAppToStart({ maxWaitTime } = {}) {
    return (0, _delay.waitForActionAsync)({
        interval: 50,
        maxWaitTime,
        action: isSimulatorAppRunningAsync
    });
}
// I think the app can be open while no simulators are booted.
async function isSimulatorAppRunningAsync() {
    try {
        const zeroMeansNo = (await _osascript().execAsync('tell app "System Events" to count processes whose name is "Simulator"')).trim();
        if (zeroMeansNo === '0') {
            return false;
        }
    } catch (error) {
        if (error.message.includes('Application isn’t running')) {
            return false;
        }
        throw error;
    }
    return true;
}
async function openSimulatorAppAsync(device) {
    const args = [
        '-a',
        'Simulator'
    ];
    if (device.udid) {
        // This has no effect if the app is already running.
        args.push('--args', '-CurrentDeviceUDID', device.udid);
    }
    await (0, _spawnasync().default)('open', args);
}

//# sourceMappingURL=ensureSimulatorAppRunning.js.map