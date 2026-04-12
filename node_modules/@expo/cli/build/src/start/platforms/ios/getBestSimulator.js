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
    getBestBootedSimulatorAsync: function() {
        return getBestBootedSimulatorAsync;
    },
    getBestSimulatorAsync: function() {
        return getBestSimulatorAsync;
    },
    getBestUnbootedSimulatorAsync: function() {
        return getBestUnbootedSimulatorAsync;
    },
    getSelectableSimulatorsAsync: function() {
        return getSelectableSimulatorsAsync;
    }
});
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
const _simctl = /*#__PURE__*/ _interop_require_wildcard(require("./simctl"));
const _errors = require("../../../utils/errors");
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
const debug = require('debug')('expo:start:platforms:ios:getBestSimulator');
/**
 * Returns the default device stored in the Simulator.app settings.
 * This helps us to get the device that the user opened most recently regardless of which tool they used.
 */ function getDefaultSimulatorDeviceUDID() {
    try {
        const defaultDeviceUDID = (0, _child_process().execSync)(`defaults read com.apple.iphonesimulator CurrentDeviceUDID`, {
            stdio: 'pipe'
        }).toString();
        return defaultDeviceUDID.trim();
    } catch  {
        return null;
    }
}
async function getBestBootedSimulatorAsync({ osType } = {}) {
    const [simulatorOpenedByApp] = await _simctl.getBootedSimulatorsAsync();
    // This should prevent opening a second simulator in the chance that default
    // simulator doesn't match what the Simulator app would open by default.
    if ((simulatorOpenedByApp == null ? void 0 : simulatorOpenedByApp.udid) && (!osType || osType && simulatorOpenedByApp.osType === osType)) {
        debug(`First booted simulator: ${simulatorOpenedByApp == null ? void 0 : simulatorOpenedByApp.windowName}`);
        return simulatorOpenedByApp;
    }
    debug(`No booted simulator matching requirements (osType: ${osType}).`);
    return null;
}
async function getBestUnbootedSimulatorAsync({ osType } = {}) {
    var _simulators_;
    const defaultId = getDefaultSimulatorDeviceUDID();
    debug(`Default simulator ID: ${defaultId}`);
    if (defaultId && !osType) {
        return defaultId;
    }
    const simulators = await getSelectableSimulatorsAsync({
        osType
    });
    if (!simulators.length) {
        // TODO: Prompt to install the simulators
        throw new _errors.CommandError('UNSUPPORTED_OS_TYPE', `No ${osType || 'iOS'} devices available in Simulator.app`);
    }
    // If the default udid is defined, then check to ensure its osType matches the required os.
    if (defaultId) {
        const defaultSimulator = simulators.find((device)=>device.udid === defaultId);
        if ((defaultSimulator == null ? void 0 : defaultSimulator.osType) === osType) {
            return defaultId;
        }
    }
    // Return first selectable device.
    return ((_simulators_ = simulators[0]) == null ? void 0 : _simulators_.udid) ?? null;
}
async function getSelectableSimulatorsAsync({ osType = 'iOS' } = {}) {
    const simulators = await _simctl.getDevicesAsync();
    return simulators.filter((device)=>device.isAvailable && device.osType === osType);
}
async function getBestSimulatorAsync({ osType }) {
    const simulatorOpenedByApp = await getBestBootedSimulatorAsync({
        osType
    });
    if (simulatorOpenedByApp) {
        return simulatorOpenedByApp.udid;
    }
    return await getBestUnbootedSimulatorAsync({
        osType
    });
}

//# sourceMappingURL=getBestSimulator.js.map