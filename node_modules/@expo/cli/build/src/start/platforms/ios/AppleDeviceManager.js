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
    AppleDeviceManager: function() {
        return AppleDeviceManager;
    },
    ensureSimulatorOpenAsync: function() {
        return ensureSimulatorOpenAsync;
    }
});
function _osascript() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/osascript"));
    _osascript = function() {
        return data;
    };
    return data;
}
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
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
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
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
const _assertSystemRequirements = require("./assertSystemRequirements");
const _ensureSimulatorAppRunning = require("./ensureSimulatorAppRunning");
const _getBestSimulator = require("./getBestSimulator");
const _promptAppleDevice = require("./promptAppleDevice");
const _simctl = /*#__PURE__*/ _interop_require_wildcard(require("./simctl"));
const _delay = require("../../../utils/delay");
const _errors = require("../../../utils/errors");
const _plist = require("../../../utils/plist");
const _url = require("../../../utils/url");
const _DeviceManager = require("../DeviceManager");
const _ExpoGoInstaller = require("../ExpoGoInstaller");
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
const debug = require('debug')('expo:start:platforms:ios:AppleDeviceManager');
const EXPO_GO_BUNDLE_IDENTIFIER = 'host.exp.Exponent';
async function ensureSimulatorOpenAsync({ udid, osType } = {}, tryAgain = true) {
    // Use a default simulator if none was specified
    if (!udid) {
        // If a simulator is open, side step the entire booting sequence.
        const simulatorOpenedByApp = await (0, _getBestSimulator.getBestBootedSimulatorAsync)({
            osType
        });
        if (simulatorOpenedByApp) {
            return simulatorOpenedByApp;
        }
        // Otherwise, find the best possible simulator from user defaults and continue
        const bestUdid = await (0, _getBestSimulator.getBestUnbootedSimulatorAsync)({
            osType
        });
        if (!bestUdid) {
            throw new _errors.CommandError('No simulators found.');
        }
        udid = bestUdid;
    }
    const bootedDevice = await (0, _delay.waitForActionAsync)({
        action: ()=>{
            // Just for the type check.
            (0, _assert().default)(udid);
            return _simctl.bootAsync({
                udid
            });
        }
    });
    if (!bootedDevice) {
        // Give it a second chance, this might not be needed but it could potentially lead to a better UX on slower devices.
        if (tryAgain) {
            return await ensureSimulatorOpenAsync({
                udid,
                osType
            }, false);
        }
        // TODO: We should eliminate all needs for a timeout error, it's bad UX to get an error about the simulator not starting while the user can clearly see it starting on their slow computer.
        throw new _errors.CommandError('SIMULATOR_TIMEOUT', `Simulator didn't boot fast enough. Try opening Simulator first, then running your app.`);
    }
    return bootedDevice;
}
class AppleDeviceManager extends _DeviceManager.DeviceManager {
    static #_ = this.assertSystemRequirementsAsync = _assertSystemRequirements.assertSystemRequirementsAsync;
    static async resolveAsync({ device, shouldPrompt } = {}) {
        if (shouldPrompt) {
            const devices = await (0, _getBestSimulator.getSelectableSimulatorsAsync)(device);
            device = await (0, _promptAppleDevice.promptAppleDeviceAsync)(devices, device == null ? void 0 : device.osType);
        }
        const booted = await ensureSimulatorOpenAsync(device);
        return new AppleDeviceManager(booted);
    }
    get name() {
        return this.device.name;
    }
    get identifier() {
        return this.device.udid;
    }
    async getAppVersionAsync(appId, { containerPath } = {}) {
        return await _simctl.getInfoPlistValueAsync(this.device, {
            appId,
            key: 'CFBundleShortVersionString',
            containerPath
        });
    }
    async startAsync() {
        return ensureSimulatorOpenAsync({
            osType: this.device.osType,
            udid: this.device.udid
        });
    }
    async launchApplicationIdAsync(appId) {
        try {
            const result = await _simctl.openAppIdAsync(this.device, {
                appId
            });
            if (result.status === 0) {
                await this.activateWindowAsync();
            } else {
                throw new _errors.CommandError(result.stderr);
            }
        } catch (error) {
            let errorMessage = `Couldn't open iOS app with ID "${appId}" on device "${this.name}".`;
            if (error instanceof _errors.CommandError && error.code === 'APP_NOT_INSTALLED') {
                if (appId === EXPO_GO_BUNDLE_IDENTIFIER) {
                    errorMessage = `Couldn't open Expo Go app on device "${this.name}". Install it: https://expo.dev/go.`;
                } else {
                    errorMessage += `\nThe app might not be installed, try installing it with: ${_chalk().default.bold(`npx expo run:ios -d ${this.device.udid}`)}`;
                }
            }
            if (error.stderr) {
                errorMessage += _chalk().default.gray(`\n${error.stderr}`);
            } else if (error.message) {
                errorMessage += _chalk().default.gray(`\n${error.message}`);
            }
            throw new _errors.CommandError(errorMessage);
        }
    }
    async installAppAsync(filePath) {
        await _simctl.installAsync(this.device, {
            filePath
        });
        await this.waitForAppInstalledAsync(await this.getApplicationIdFromBundle(filePath));
    }
    async getApplicationIdFromBundle(filePath) {
        debug('getApplicationIdFromBundle:', filePath);
        const builtInfoPlistPath = _path().default.join(filePath, 'Info.plist');
        if (_fs().default.existsSync(builtInfoPlistPath)) {
            const { CFBundleIdentifier } = await (0, _plist.parsePlistAsync)(builtInfoPlistPath);
            debug('getApplicationIdFromBundle: using built Info.plist', CFBundleIdentifier);
            return CFBundleIdentifier;
        }
        debug('getApplicationIdFromBundle: no Info.plist found');
        return EXPO_GO_BUNDLE_IDENTIFIER;
    }
    async waitForAppInstalledAsync(applicationId) {
        while(true){
            if (await this.isAppInstalledAndIfSoReturnContainerPathForIOSAsync(applicationId)) {
                return true;
            }
            await (0, _delay.delayAsync)(100);
        }
    }
    async uninstallAppAsync(appId) {
        await _simctl.uninstallAsync(this.device, {
            appId
        });
    }
    async isAppInstalledAndIfSoReturnContainerPathForIOSAsync(appId) {
        return await _simctl.getContainerPathAsync(this.device, {
            appId
        }) ?? false;
    }
    async openUrlAsync(url, options = {}) {
        // Non-compliant URLs will be treated as application identifiers.
        if (!(0, _url.validateUrl)(url, {
            requireProtocol: true
        })) {
            return await this.launchApplicationIdAsync(url);
        }
        try {
            await _simctl.openUrlAsync(this.device, {
                url,
                appId: options.appId
            });
        } catch (error) {
            // 194 means the device does not conform to a given URL, in this case we'll assume that the desired app is not installed.
            if (error.status === 194) {
                // An error was encountered processing the command (domain=NSOSStatusErrorDomain, code=-10814):
                // The operation couldn’t be completed. (OSStatus error -10814.)
                //
                // This can be thrown when no app conforms to the URI scheme that we attempted to open.
                throw new _errors.CommandError('APP_NOT_INSTALLED', `Device ${this.device.name} (${this.device.udid}) has no app to handle the URI: ${url}`);
            }
            throw error;
        }
    }
    async activateWindowAsync() {
        await (0, _ensureSimulatorAppRunning.ensureSimulatorAppRunningAsync)(this.device);
        // TODO: Focus the individual window
        await _osascript().execAsync(`tell application "Simulator" to activate`);
    }
    getExpoGoAppId() {
        return EXPO_GO_BUNDLE_IDENTIFIER;
    }
    async ensureExpoGoAsync(sdkVersion) {
        const installer = new _ExpoGoInstaller.ExpoGoInstaller('ios', EXPO_GO_BUNDLE_IDENTIFIER, sdkVersion);
        return installer.ensureAsync(this);
    }
}

//# sourceMappingURL=AppleDeviceManager.js.map