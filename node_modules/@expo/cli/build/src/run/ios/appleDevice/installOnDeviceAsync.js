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
    getAppDeltaDirectory: function() {
        return getAppDeltaDirectory;
    },
    installOnDeviceAsync: function() {
        return installOnDeviceAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _os() {
    const data = /*#__PURE__*/ _interop_require_default(require("os"));
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
const _AppleDevice = /*#__PURE__*/ _interop_require_wildcard(require("./AppleDevice"));
const _devicectl = /*#__PURE__*/ _interop_require_wildcard(require("../../../start/platforms/ios/devicectl"));
const _dir = require("../../../utils/dir");
const _errors = require("../../../utils/errors");
const _interactive = require("../../../utils/interactive");
const _ora = require("../../../utils/ora");
const _prompts = require("../../../utils/prompts");
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
function getAppDeltaDirectory(bundleId) {
    // TODO: Maybe use .expo folder instead for debugging
    // TODO: Reuse existing folder from xcode?
    const deltaFolder = _path().default.join(_os().default.tmpdir(), 'ios', 'app-delta', bundleId);
    (0, _dir.ensureDirectory)(deltaFolder);
    return deltaFolder;
}
async function installOnDeviceAsync(props) {
    const { bundle, bundleIdentifier, appDeltaDirectory, udid, deviceName } = props;
    let indicator;
    try {
        // TODO: Connect for logs
        await _AppleDevice.runOnDevice({
            udid,
            appPath: bundle,
            bundleId: bundleIdentifier,
            waitForApp: false,
            deltaPath: appDeltaDirectory,
            onProgress ({ status, isComplete, progress }) {
                if (!indicator) {
                    indicator = (0, _ora.ora)(status).start();
                }
                indicator.text = `${_chalk().default.bold(status)} ${progress}%`;
                if (isComplete) {
                    indicator.succeed();
                }
            }
        });
    } catch (error) {
        if (error instanceof _errors.CommandError) {
            if (error.code === 'APPLE_DEVICE_USBMUXD') {
                // Couldn't find device, could be OTA...
                // Fallback on much slower devicectl method which supports OTA installs.
                if (_devicectl.hasDevicectlEverBeenInstalled()) {
                    // This should never happen.
                    if (indicator) {
                        indicator.clear();
                    }
                    return await _devicectl.installAndLaunchAppAsync(props);
                }
            }
        }
        if (indicator) {
            indicator.fail();
        }
        if (error.code === 'APPLE_DEVICE_LOCKED') {
            // Get the app name from the binary path.
            const appName = _path().default.basename(bundle).split('.')[0] ?? 'app';
            if ((0, _interactive.isInteractive)() && await (0, _prompts.confirmAsync)({
                message: `Cannot launch ${appName} because the device is locked. Unlock ${deviceName} to continue...`,
                initial: true
            })) {
                return installOnDeviceAsync(props);
            }
            throw new _errors.CommandError(`Cannot launch ${appName} on ${deviceName} because the device is locked.`);
        }
        throw error;
    }
}

//# sourceMappingURL=installOnDeviceAsync.js.map