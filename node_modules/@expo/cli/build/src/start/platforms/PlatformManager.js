"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlatformManager", {
    enumerable: true,
    get: function() {
        return PlatformManager;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
const _log = require("../../log");
const _errors = require("../../utils/errors");
const _link = require("../../utils/link");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:platforms:platformManager');
class PlatformManager {
    constructor(projectRoot, props){
        this.projectRoot = projectRoot;
        this.props = props;
    }
    /** Returns the project application identifier or asserts that one is not defined. Exposed for testing. */ _getAppIdResolver() {
        throw new _errors.UnimplementedError();
    }
    /**
   * Get the URL for users intending to launch the project in Expo Go.
   * The CLI will check if the project has a custom dev client and if the redirect page feature is enabled.
   * If both are true, the CLI will return the redirect page URL.
   */ async getExpoGoOrCustomRuntimeUrlAsync(deviceManager) {
        // Determine if the redirect page feature is enabled first since it's the cheapest to check.
        const redirectUrl = this.props.getRedirectUrl();
        if (redirectUrl) {
            // If the redirect page feature is enabled, check if the project has a resolvable native identifier.
            let applicationId;
            try {
                applicationId = await this._getAppIdResolver().getAppIdAsync();
            } catch  {
                _log.Log.warn((0, _chalk().default)`\u203A Launching in Expo Go. If you want to use a ` + `development build, you need to create and install one first, or, if you already ` + (0, _chalk().default)`have a build, add {bold ios.bundleIdentifier} and {bold android.package} to ` + `this project's app config.\n${(0, _link.learnMore)('https://docs.expo.dev/development/build/')}`);
            }
            if (applicationId) {
                debug(`Resolving launch URL: (appId: ${applicationId}, redirect URL: ${redirectUrl})`);
                // NOTE(EvanBacon): This adds considerable amount of time to the command, we should consider removing or memoizing it.
                // Finally determine if the target device has a custom dev client installed.
                if (await deviceManager.isAppInstalledAndIfSoReturnContainerPathForIOSAsync(applicationId)) {
                    return redirectUrl;
                } else {
                    // Log a warning if no development build is available on the device, but the
                    // interstitial page would otherwise be opened.
                    _log.Log.warn((0, _chalk().default)`\u203A The {bold expo-dev-client} package is installed, but a development build is not ` + (0, _chalk().default)`installed on {bold ${deviceManager.name}}.\nLaunching in Expo Go. If you want to use a ` + `development build, you need to create and install one first.\n${(0, _link.learnMore)('https://docs.expo.dev/development/build/')}`);
                }
            }
        }
        return this.props.getExpoGoUrl();
    }
    async openProjectInExpoGoAsync(resolveSettings = {}) {
        const deviceManager = await this.props.resolveDeviceAsync(resolveSettings);
        const url = await this.getExpoGoOrCustomRuntimeUrlAsync(deviceManager);
        deviceManager.logOpeningUrl(url);
        // TODO: Expensive, we should only do this once.
        const { exp } = (0, _config().getConfig)(this.projectRoot);
        const sdkVersion = exp.sdkVersion;
        (0, _assert().default)(sdkVersion, 'sdkVersion should be resolved by getConfig');
        await deviceManager.ensureExpoGoAsync(sdkVersion);
        deviceManager.activateWindowAsync();
        await deviceManager.openUrlAsync(url, {
            appId: deviceManager.getExpoGoAppId()
        });
        return {
            url
        };
    }
    async openProjectInCustomRuntimeAsync(resolveSettings = {}, props = {}) {
        debug(`open custom (${Object.entries(props).map(([k, v])=>`${k}: ${v}`).join(', ')})`);
        let url = this.props.getCustomRuntimeUrl({
            scheme: props.scheme
        });
        debug(`Opening project in custom runtime: ${url} -- %O`, props);
        // TODO: It's unclear why we do application id validation when opening with a URL
        // NOTE: But having it enables us to allow the deep link to directly open on iOS simulators without the modal.
        const applicationId = props.applicationId ?? await this._getAppIdResolver().getAppIdAsync();
        const deviceManager = await this.props.resolveDeviceAsync(resolveSettings);
        if (!await deviceManager.isAppInstalledAndIfSoReturnContainerPathForIOSAsync(applicationId)) {
            throw new _errors.CommandError(`No development build (${applicationId}) for this project is installed. ` + `Install a development build on the target device and try again.\n${(0, _link.learnMore)('https://docs.expo.dev/development/build/')}`);
        }
        if (!url) {
            url = this._resolveAlternativeLaunchUrl(applicationId, props);
        }
        deviceManager.logOpeningUrl(url);
        await deviceManager.activateWindowAsync();
        await deviceManager.openUrlAsync(url, {
            appId: applicationId
        });
        return {
            url
        };
    }
    /** Launch the project on a device given the input runtime. */ async openAsync(options, resolveSettings = {}) {
        debug(`open (runtime: ${options.runtime}, platform: ${this.props.platform}, device: %O, shouldPrompt: ${resolveSettings.shouldPrompt})`, resolveSettings.device);
        if (options.runtime === 'expo') {
            return this.openProjectInExpoGoAsync(resolveSettings);
        } else if (options.runtime === 'web') {
            return this.openWebProjectAsync(resolveSettings);
        } else if (options.runtime === 'custom') {
            return this.openProjectInCustomRuntimeAsync(resolveSettings, options.props);
        } else {
            throw new _errors.CommandError(`Invalid runtime target: ${options.runtime}`);
        }
    }
    /** Open the current web project (Webpack) in a device . */ async openWebProjectAsync(resolveSettings = {}) {
        const url = this.props.getDevServerUrl();
        (0, _assert().default)(url, 'Dev server is not running.');
        const deviceManager = await this.props.resolveDeviceAsync(resolveSettings);
        deviceManager.logOpeningUrl(url);
        await deviceManager.activateWindowAsync();
        await deviceManager.openUrlAsync(url);
        return {
            url
        };
    }
    /** If the launch URL cannot be determined (`custom` runtimes) then an alternative string can be provided to open the device. Often a device ID or activity to launch. Exposed for testing. */ _resolveAlternativeLaunchUrl(applicationId, props = {}) {
        throw new _errors.UnimplementedError();
    }
}

//# sourceMappingURL=PlatformManager.js.map