"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExpoGoInstaller", {
    enumerable: true,
    get: function() {
        return ExpoGoInstaller;
    }
});
function _semver() {
    const data = /*#__PURE__*/ _interop_require_default(require("semver"));
    _semver = function() {
        return data;
    };
    return data;
}
const _getVersions = require("../../api/getVersions");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _downloadExpoGoAsync = require("../../utils/downloadExpoGoAsync");
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
const _link = require("../../utils/link");
const _ora = require("../../utils/ora");
const _prompts = require("../../utils/prompts");
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
const debug = require('debug')('expo:utils:ExpoGoInstaller');
class ExpoGoInstaller {
    static #_ = // Keep a list of [platform-deviceId] so we can prevent asking multiple times if a user wants to upgrade.
    // This can prevent annoying interactions when they don't want to upgrade for whatever reason.
    this.cache = {};
    constructor(platform, // Ultimately this should be inlined since we know the platform.
    appId, sdkVersion){
        this.platform = platform;
        this.appId = appId;
        this.sdkVersion = sdkVersion;
    }
    /** Returns true if the installed app matching the previously provided `appId` is outdated. */ isInstalledClientVersionMismatched(installedVersion, expectedExpoGoVersion) {
        if (!installedVersion) {
            return true;
        }
        debug(`Expected Expo Go version: ${expectedExpoGoVersion}, installed version: ${installedVersion}`);
        return expectedExpoGoVersion ? !_semver().default.eq(installedVersion, expectedExpoGoVersion) : true;
    }
    /** Returns the expected version of Expo Go given the project SDK Version. Exposed for testing. */ async getExpectedExpoGoClientVersionAsync() {
        var _versions_sdkVersions_this_sdkVersion, _versions_sdkVersions;
        const versions = await (0, _getVersions.getVersionsAsync)();
        // Like `sdkVersions['44.0.0']['androidClientVersion'] = '1.0.0'`
        const specificVersion = versions == null ? void 0 : (_versions_sdkVersions = versions.sdkVersions) == null ? void 0 : (_versions_sdkVersions_this_sdkVersion = _versions_sdkVersions[this.sdkVersion]) == null ? void 0 : _versions_sdkVersions_this_sdkVersion[`${this.platform}ClientVersion`];
        const latestVersion = versions[`${this.platform}Version`];
        return specificVersion ?? latestVersion ?? null;
    }
    /** Returns a boolean indicating if Expo Go should be installed. Returns `true` if the app was uninstalled. */ async promptForUninstallExpoGoIfInstalledClientVersionMismatchedAndReturnShouldInstallAsync(deviceManager, { containerPath } = {}) {
        const cacheId = `${this.platform}-${deviceManager.identifier}`;
        if (ExpoGoInstaller.cache[cacheId]) {
            debug('skipping subsequent upgrade check');
            return false;
        }
        ExpoGoInstaller.cache[cacheId] = true;
        const [installedExpoGoVersion, expectedExpoGoVersion] = await Promise.all([
            deviceManager.getAppVersionAsync(this.appId, {
                containerPath
            }),
            this.getExpectedExpoGoClientVersionAsync()
        ]);
        if (this.isInstalledClientVersionMismatched(installedExpoGoVersion, expectedExpoGoVersion)) {
            if (this.sdkVersion === 'UNVERSIONED') {
                // This should only happen in the expo/expo repo, e.g. `apps/test-suite`
                _log.log(`Skipping Expo Go upgrade check for UNVERSIONED project. Manually ensure the Expo Go app is built from source.`);
                return false;
            }
            // Only prompt once per device, per run.
            const confirm = await (0, _prompts.confirmAsync)({
                initial: true,
                message: `Expo Go ${expectedExpoGoVersion} is recommended for SDK ${this.sdkVersion} (${deviceManager.name} is using ${installedExpoGoVersion}). ${(0, _link.learnMore)('https://docs.expo.dev/develop/tools/#expo-go')}. Install the recommended Expo Go version?`
            });
            if (confirm) {
                // Don't need to uninstall to update on iOS.
                if (this.platform !== 'ios') {
                    _log.log(`Uninstalling Expo Go from ${this.platform} device ${deviceManager.name}.`);
                    await deviceManager.uninstallAppAsync(this.appId);
                }
                return true;
            }
        }
        return false;
    }
    /** Check if a given device has Expo Go installed, if not then download and install it. */ async ensureAsync(deviceManager) {
        const isExpoGoInstalledAndIfSoContainerPathForIOS = await deviceManager.isAppInstalledAndIfSoReturnContainerPathForIOSAsync(this.appId);
        let shouldInstall = !isExpoGoInstalledAndIfSoContainerPathForIOS;
        if (_env.env.EXPO_OFFLINE) {
            if (isExpoGoInstalledAndIfSoContainerPathForIOS) {
                _log.warn(`Skipping Expo Go version validation in offline mode`);
                return false;
            }
            throw new _errors.CommandError('NO_EXPO_GO', `Expo Go is not installed on device "${deviceManager.name}", while running in offline mode. Manually install Expo Go or run without --offline flag (or EXPO_OFFLINE environment variable).`);
        }
        if (isExpoGoInstalledAndIfSoContainerPathForIOS) {
            shouldInstall = await this.promptForUninstallExpoGoIfInstalledClientVersionMismatchedAndReturnShouldInstallAsync(deviceManager, {
                // iOS optimization to prevent duplicate calls to `getContainerPathAsync`.
                containerPath: typeof isExpoGoInstalledAndIfSoContainerPathForIOS === 'string' ? isExpoGoInstalledAndIfSoContainerPathForIOS : undefined
            });
        }
        if (shouldInstall) {
            // Download the Expo Go app from the Expo servers.
            const binaryPath = await (0, _downloadExpoGoAsync.downloadExpoGoAsync)(this.platform, {
                sdkVersion: this.sdkVersion
            });
            // Install the app on the device.
            const ora = (0, _ora.logNewSection)(`Installing Expo Go on ${deviceManager.name}`);
            try {
                await deviceManager.installAppAsync(binaryPath);
            } finally{
                ora.stop();
            }
            return true;
        }
        return false;
    }
}

//# sourceMappingURL=ExpoGoInstaller.js.map