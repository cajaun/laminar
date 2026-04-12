"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "runIosAsync", {
    enumerable: true,
    get: function() {
        return runIosAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
const _XcodeBuild = /*#__PURE__*/ _interop_require_wildcard(require("./XcodeBuild"));
const _launchApp = require("./launchApp");
const _resolveOptions = require("./options/resolveOptions");
const _validateExternalBinary = require("./validateExternalBinary");
const _exportEager = require("../../export/embed/exportEager");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _AppleAppIdResolver = require("../../start/platforms/ios/AppleAppIdResolver");
const _simctl = require("../../start/platforms/ios/simctl");
const _buildcacheproviders = require("../../utils/build-cache-providers");
const _cocoapods = require("../../utils/cocoapods");
const _errors = require("../../utils/errors");
const _nodeEnv = require("../../utils/nodeEnv");
const _port = require("../../utils/port");
const _profile = require("../../utils/profile");
const _scheme = require("../../utils/scheme");
const _ensureNativeProject = require("../ensureNativeProject");
const _hints = require("../hints");
const _startBundler = require("../startBundler");
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
const debug = require('debug')('expo:run:ios');
async function runIosAsync(projectRoot, options) {
    var _this;
    (0, _nodeEnv.setNodeEnv)(options.configuration === 'Release' ? 'production' : 'development');
    require('@expo/env').load(projectRoot);
    assertPlatform();
    const install = !!options.install;
    if (await (0, _ensureNativeProject.ensureNativeProjectAsync)(projectRoot, {
        platform: 'ios',
        install
    }) && install) {
        await (0, _cocoapods.maybePromptToSyncPodsAsync)(projectRoot);
    }
    // Resolve the CLI arguments into useable options.
    const props = await (0, _profile.profile)(_resolveOptions.resolveOptionsAsync)(projectRoot, options);
    const projectConfig = (0, _config().getConfig)(projectRoot);
    // We only support build cache for simulator builds for now.
    if (!options.binary && props.buildCacheProvider && props.isSimulator) {
        const localPath = await (0, _buildcacheproviders.resolveBuildCache)({
            projectRoot,
            platform: 'ios',
            runOptions: options,
            provider: props.buildCacheProvider
        });
        if (localPath) {
            options.binary = localPath;
        }
    }
    if (options.rebundle) {
        _log.warn(`The --unstable-rebundle flag is experimental and may not work as expected.`);
        // Get the existing binary path to re-bundle the app.
        let binaryPath;
        if (!options.binary) {
            if (!props.isSimulator) {
                throw new Error('Re-bundling on physical devices requires the --binary flag.');
            }
            const appId = await new _AppleAppIdResolver.AppleAppIdResolver(projectRoot).getAppIdAsync();
            const possibleBinaryPath = await (0, _simctl.getContainerPathAsync)(props.device, {
                appId
            });
            if (!possibleBinaryPath) {
                throw new _errors.CommandError(`Cannot rebundle because no --binary was provided and no existing binary was found on the device for ID: ${appId}.`);
            }
            binaryPath = possibleBinaryPath;
            _log.log('Re-using existing binary path:', binaryPath);
            // Set the binary path to the existing binary path.
            options.binary = binaryPath;
        }
        _log.log('Rebundling the Expo config file');
        // Re-bundle the config file the same way the app was originally bundled.
        await (0, _spawnasync().default)('node', [
            // TODO(@kitten): This isn't correct. The template installs expo-constants, but expo also depends on it
            // This however means that the top-level module doesn't have to exist. With isolated dependencies this will then fail
            // But we can't resolve via `expo` because that then may do something differently than autolinking if the root has a different version
            _path().default.join(require.resolve('expo-constants/package.json'), '../scripts/getAppConfig.js'),
            projectRoot,
            _path().default.join(options.binary, 'EXConstants.bundle')
        ]);
        // Re-bundle the app.
        const possibleBundleOutput = _path().default.join(options.binary, 'main.jsbundle');
        if (_fs().default.existsSync(possibleBundleOutput)) {
            _log.log('Rebundling the app...');
            await (0, _exportEager.exportEagerAsync)(projectRoot, {
                resetCache: false,
                dev: false,
                platform: 'ios',
                assetsDest: _path().default.join(options.binary, 'assets'),
                bundleOutput: possibleBundleOutput
            });
        } else {
            _log.warn('Bundle output not found at expected location:', possibleBundleOutput);
        }
    }
    let binaryPath;
    let shouldUpdateBuildCache = false;
    if (options.binary) {
        binaryPath = await (0, _validateExternalBinary.getValidBinaryPathAsync)(options.binary, props);
        _log.log('Using custom binary path:', binaryPath);
    } else {
        let eagerBundleOptions;
        if (options.configuration === 'Release') {
            eagerBundleOptions = JSON.stringify(await (0, _exportEager.exportEagerAsync)(projectRoot, {
                dev: false,
                platform: 'ios'
            }));
        }
        // Spawn the `xcodebuild` process to create the app binary.
        const buildOutput = await _XcodeBuild.buildAsync({
            ...props,
            eagerBundleOptions
        });
        // Find the path to the built app binary, this will be used to install the binary
        // on a device.
        binaryPath = await (0, _profile.profile)(_XcodeBuild.getAppBinaryPath)(buildOutput);
        // We only support build cache for simulator builds for now.
        shouldUpdateBuildCache = props.isSimulator;
    }
    debug('Binary path:', binaryPath);
    // Ensure the port hasn't become busy during the build.
    if (props.shouldStartBundler && !await (0, _port.ensurePortAvailabilityAsync)(projectRoot, props)) {
        props.shouldStartBundler = false;
    }
    const launchInfo = await (0, _launchApp.getLaunchInfoForBinaryAsync)(binaryPath);
    const isCustomBinary = !!options.binary;
    // Always close the app before launching on a simulator. Otherwise certain cached resources like the splashscreen will not be available.
    if (props.isSimulator) {
        try {
            await (0, _simctl.simctlAsync)([
                'terminate',
                props.device.udid,
                launchInfo.bundleId
            ]);
        } catch (error) {
            // If we failed it's likely that the app was not running to begin with and we will get an `invalid device` error
            debug('Failed to terminate app (possibly because it was not running):', error);
        }
    }
    // Start the dev server which creates all of the required info for
    // launching the app on a simulator.
    const manager = await (0, _startBundler.startBundlerAsync)(projectRoot, {
        port: props.port,
        headless: !props.shouldStartBundler,
        // If a scheme is specified then use that instead of the package name.
        scheme: isCustomBinary ? launchInfo.schemes[0] : (_this = await (0, _scheme.getSchemesForIosAsync)(projectRoot)) == null ? void 0 : _this[0]
    });
    // Install and launch the app binary on a device.
    await (0, _launchApp.launchAppAsync)(binaryPath, manager, {
        isSimulator: props.isSimulator,
        device: props.device,
        shouldStartBundler: props.shouldStartBundler
    }, launchInfo.bundleId);
    // Log the location of the JS logs for the device.
    if (props.shouldStartBundler) {
        (0, _hints.logProjectLogsLocation)();
    } else {
        await manager.stopAsync();
    }
    if (shouldUpdateBuildCache && props.buildCacheProvider) {
        await (0, _buildcacheproviders.uploadBuildCache)({
            projectRoot,
            platform: 'ios',
            provider: props.buildCacheProvider,
            buildPath: binaryPath,
            runOptions: options
        });
    }
}
function assertPlatform() {
    if (process.platform !== 'darwin') {
        _log.exit((0, _chalk().default)`iOS apps can only be built on macOS devices. Use {cyan eas build -p ios} to build in the cloud.`);
    }
}

//# sourceMappingURL=runIosAsync.js.map