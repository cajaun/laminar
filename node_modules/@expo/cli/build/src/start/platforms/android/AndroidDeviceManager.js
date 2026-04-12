"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AndroidDeviceManager", {
    enumerable: true,
    get: function() {
        return AndroidDeviceManager;
    }
});
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
const _activateWindow = require("./activateWindow");
const _adb = /*#__PURE__*/ _interop_require_wildcard(require("./adb"));
const _emulator = require("./emulator");
const _getDevices = require("./getDevices");
const _promptAndroidDevice = require("./promptAndroidDevice");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
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
const EXPO_GO_APPLICATION_IDENTIFIER = 'host.exp.exponent';
class AndroidDeviceManager extends _DeviceManager.DeviceManager {
    static async resolveFromNameAsync(name) {
        const devices = await (0, _getDevices.getDevicesAsync)();
        const device = devices.find((device)=>device.name === name);
        if (!device) {
            throw new _errors.CommandError('Could not find device with name: ' + name);
        }
        return AndroidDeviceManager.resolveAsync({
            device,
            shouldPrompt: false
        });
    }
    static async resolveAsync({ device, shouldPrompt } = {}) {
        if (device) {
            const manager = new AndroidDeviceManager(device);
            if (!await manager.attemptToStartAsync()) {
                throw new _errors.AbortCommandError();
            }
            return manager;
        }
        const devices = await (0, _getDevices.getDevicesAsync)();
        const _device = shouldPrompt ? await (0, _promptAndroidDevice.promptForDeviceAsync)(devices) : devices[0];
        return AndroidDeviceManager.resolveAsync({
            device: _device,
            shouldPrompt: false
        });
    }
    get name() {
        // TODO: Maybe strip `_` from the device name?
        return this.device.name;
    }
    get identifier() {
        return this.device.pid ?? 'unknown';
    }
    async getAppVersionAsync(applicationId) {
        var _regex_exec;
        const info = await _adb.getPackageInfoAsync(this.device, {
            appId: applicationId
        });
        const regex = /versionName=([0-9.]+)/;
        return ((_regex_exec = regex.exec(info)) == null ? void 0 : _regex_exec[1]) ?? null;
    }
    async attemptToStartAsync() {
        // TODO: Add a light-weight method for checking since a device could disconnect.
        if (!await _adb.isDeviceBootedAsync(this.device)) {
            this.device = await (0, _emulator.startDeviceAsync)(this.device);
        }
        if (this.device.isAuthorized === false) {
            _adb.logUnauthorized(this.device);
            return null;
        }
        return this.device;
    }
    async startAsync() {
        const device = await this.attemptToStartAsync();
        (0, _assert().default)(device, `Failed to boot emulator.`);
        return this.device;
    }
    async installAppAsync(binaryPath) {
        await _adb.installAsync(this.device, {
            filePath: binaryPath
        });
    }
    async uninstallAppAsync(appId) {
        // we need to check if the app is installed, else we might bump into "Failure [DELETE_FAILED_INTERNAL_ERROR]"
        const isInstalled = await this.isAppInstalledAndIfSoReturnContainerPathForIOSAsync(appId);
        if (!isInstalled) {
            return;
        }
        try {
            await _adb.uninstallAsync(this.device, {
                appId
            });
        } catch (e) {
            _log.error(`Could not uninstall app "${appId}" from your device, please uninstall it manually and try again.`);
            throw e;
        }
    }
    /**
   * @param launchActivity Activity to launch `[application identifier]/.[main activity name]`, ex: `com.bacon.app/.MainActivity`
   */ async launchActivityAsync(launchActivity, url) {
        try {
            return await _adb.launchActivityAsync(this.device, {
                launchActivity,
                url
            });
        } catch (error) {
            let errorMessage = `Couldn't open Android app with activity "${launchActivity}" on device "${this.name}".`;
            if (error instanceof _errors.CommandError && error.code === 'APP_NOT_INSTALLED') {
                errorMessage += `\nThe app might not be installed, try installing it with: ${_chalk().default.bold(`npx expo run:android -d ${this.name}`)}`;
            }
            errorMessage += _chalk().default.gray(`\n${error.message}`);
            error.message = errorMessage;
            throw error;
        }
    }
    async isAppInstalledAndIfSoReturnContainerPathForIOSAsync(applicationId) {
        return await _adb.isPackageInstalledAsync(this.device, applicationId);
    }
    async openUrlAsync(url) {
        // Non-compliant URLs will be treated as application identifiers.
        if (!(0, _url.validateUrl)(url, {
            requireProtocol: true
        })) {
            await this.launchActivityAsync(url);
            return;
        }
        const parsed = new URL(url);
        if (parsed.protocol === 'exp:') {
            // NOTE(brentvatne): temporary workaround! launch Expo Go first, then
            // launch the project!
            // https://github.com/expo/expo/issues/7772
            // adb shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1
            // Note: this is not needed in Expo Development Client, it only applies to Expo Go
            await _adb.openAppIdAsync({
                pid: this.device.pid
            }, {
                applicationId: EXPO_GO_APPLICATION_IDENTIFIER
            });
        }
        await _adb.openUrlAsync({
            pid: this.device.pid
        }, {
            url
        });
    }
    async activateWindowAsync() {
        // Bring the emulator window to the front on macos devices.
        await (0, _activateWindow.activateWindowAsync)(this.device);
    }
    getExpoGoAppId() {
        return EXPO_GO_APPLICATION_IDENTIFIER;
    }
    async ensureExpoGoAsync(sdkVersion) {
        const installer = new _ExpoGoInstaller.ExpoGoInstaller('android', EXPO_GO_APPLICATION_IDENTIFIER, sdkVersion);
        return installer.ensureAsync(this);
    }
}

//# sourceMappingURL=AndroidDeviceManager.js.map