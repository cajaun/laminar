"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SimulatorAppPrerequisite", {
    enumerable: true,
    get: function() {
        return SimulatorAppPrerequisite;
    }
});
function _osascript() {
    const data = require("@expo/osascript");
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
const _Prerequisite = require("../Prerequisite");
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
const debug = require('debug')('expo:doctor:apple:simulatorApp');
async function getSimulatorAppIdAsync() {
    try {
        return (await (0, _osascript().execAsync)('id of app "Simulator"')).trim();
    } catch  {
    // This error may occur in CI where the users intends to install just the simulators but no Xcode.
    }
    return null;
}
class SimulatorAppPrerequisite extends _Prerequisite.Prerequisite {
    static #_ = this.instance = new SimulatorAppPrerequisite();
    async assertImplementation() {
        const result = await getSimulatorAppIdAsync();
        if (!result) {
            // This error may occur in CI where the users intends to install just the simulators but no Xcode.
            throw new _Prerequisite.PrerequisiteCommandError('SIMULATOR_APP', "Can't determine id of Simulator app; the Simulator is most likely not installed on this machine. Run `sudo xcode-select -s /Applications/Xcode.app`");
        }
        if (result !== 'com.apple.iphonesimulator' && result !== 'com.apple.CoreSimulator.SimulatorTrampoline') {
            throw new _Prerequisite.PrerequisiteCommandError('SIMULATOR_APP', "Simulator is installed but is identified as '" + result + "'; don't know what that is.");
        }
        debug(`Simulator app id: ${result}`);
        try {
            // make sure we can run simctl
            await (0, _spawnasync().default)('xcrun', [
                'simctl',
                'help'
            ]);
        } catch (error) {
            _log.warn(`Unable to run simctl:\n${error.toString()}`);
            throw new _Prerequisite.PrerequisiteCommandError('SIMCTL', 'xcrun is not configured correctly. Ensure `sudo xcode-select --reset` works before running this command again.');
        }
    }
}

//# sourceMappingURL=SimulatorAppPrerequisite.js.map