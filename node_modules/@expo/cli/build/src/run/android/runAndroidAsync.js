"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "runAndroidAsync", {
    enumerable: true,
    get: function() {
        return runAndroidAsync;
    }
});
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
const _resolveInstallApkName = require("./resolveInstallApkName");
const _resolveOptions = require("./resolveOptions");
const _exportEager = require("../../export/embed/exportEager");
const _log = require("../../log");
const _gradle = require("../../start/platforms/android/gradle");
const _buildcacheproviders = require("../../utils/build-cache-providers");
const _errors = require("../../utils/errors");
const _nodeEnv = require("../../utils/nodeEnv");
const _port = require("../../utils/port");
const _scheme = require("../../utils/scheme");
const _ensureNativeProject = require("../ensureNativeProject");
const _hints = require("../hints");
const _startBundler = require("../startBundler");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:run:android');
async function runAndroidAsync(projectRoot, { install, ...options }) {
    var _options_variant, _this;
    // NOTE: This is a guess, the developer can overwrite with `NODE_ENV`.
    const isProduction = (_options_variant = options.variant) == null ? void 0 : _options_variant.toLowerCase().endsWith('release');
    (0, _nodeEnv.setNodeEnv)(isProduction ? 'production' : 'development');
    require('@expo/env').load(projectRoot);
    await (0, _ensureNativeProject.ensureNativeProjectAsync)(projectRoot, {
        platform: 'android',
        install
    });
    const props = await (0, _resolveOptions.resolveOptionsAsync)(projectRoot, options);
    if (!options.binary && props.buildCacheProvider) {
        const localPath = await (0, _buildcacheproviders.resolveBuildCache)({
            projectRoot,
            platform: 'android',
            provider: props.buildCacheProvider,
            runOptions: options
        });
        if (localPath) {
            options.binary = localPath;
        }
    }
    debug('Package name: ' + props.packageName);
    _log.Log.log('› Building app...');
    const androidProjectRoot = _path().default.join(projectRoot, 'android');
    let shouldUpdateBuildCache = false;
    if (!options.binary) {
        let eagerBundleOptions;
        if (isProduction) {
            eagerBundleOptions = JSON.stringify(await (0, _exportEager.exportEagerAsync)(projectRoot, {
                dev: false,
                platform: 'android'
            }));
        }
        await (0, _gradle.assembleAsync)(androidProjectRoot, {
            variant: props.variant,
            port: props.port,
            appName: props.appName,
            buildCache: props.buildCache,
            architectures: props.architectures,
            eagerBundleOptions
        });
        shouldUpdateBuildCache = true;
        // Ensure the port hasn't become busy during the build.
        if (props.shouldStartBundler && !await (0, _port.ensurePortAvailabilityAsync)(projectRoot, props)) {
            props.shouldStartBundler = false;
        }
    }
    const manager = await (0, _startBundler.startBundlerAsync)(projectRoot, {
        port: props.port,
        // If a scheme is specified then use that instead of the package name.
        scheme: (_this = await (0, _scheme.getSchemesForAndroidAsync)(projectRoot)) == null ? void 0 : _this[0],
        headless: !props.shouldStartBundler
    });
    if (!options.binary) {
        // Find the APK file path
        const apkFile = await (0, _resolveInstallApkName.resolveInstallApkNameAsync)(props.device.device, props);
        if (apkFile) {
            // Attempt to install the APK from the file path
            options.binary = _path().default.join(props.apkVariantDirectory, apkFile);
        }
    }
    if (options.binary) {
        // Attempt to install the APK from the file path
        const binaryPath = _path().default.join(options.binary);
        if (!_fs().default.existsSync(binaryPath)) {
            throw new _errors.CommandError(`The path to the custom Android binary does not exist: ${binaryPath}`);
        }
        _log.Log.log(_chalk().default.gray`\u203A Installing ${binaryPath}`);
        await props.device.installAppAsync(binaryPath);
    } else {
        await installAppAsync(androidProjectRoot, props);
    }
    await manager.getDefaultDevServer().openCustomRuntimeAsync('emulator', {
        applicationId: props.packageName,
        customAppId: props.customAppId,
        launchActivity: props.launchActivity
    }, {
        device: props.device.device
    });
    if (props.shouldStartBundler) {
        (0, _hints.logProjectLogsLocation)();
    } else {
        await manager.stopAsync();
    }
    if (options.binary && shouldUpdateBuildCache && props.buildCacheProvider) {
        await (0, _buildcacheproviders.uploadBuildCache)({
            projectRoot,
            platform: 'android',
            provider: props.buildCacheProvider,
            buildPath: options.binary,
            runOptions: options
        });
    }
}
async function installAppAsync(androidProjectRoot, props) {
    // If we cannot resolve the APK file path then we can attempt to install using Gradle.
    // This offers more advanced resolution that we may not have first class support for.
    _log.Log.log('› Failed to locate binary file, installing with Gradle...');
    await (0, _gradle.installAsync)(androidProjectRoot, {
        variant: props.variant ?? 'debug',
        appName: props.appName ?? 'app',
        port: props.port
    });
}

//# sourceMappingURL=runAndroidAsync.js.map