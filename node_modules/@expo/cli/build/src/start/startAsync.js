"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "startAsync", {
    enumerable: true,
    get: function() {
        return startAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
const _SimulatorAppPrerequisite = require("./doctor/apple/SimulatorAppPrerequisite");
const _XcodePrerequisite = require("./doctor/apple/XcodePrerequisite");
const _validateDependenciesVersions = require("./doctor/dependencies/validateDependenciesVersions");
const _WebSupportProjectPrerequisite = require("./doctor/web/WebSupportProjectPrerequisite");
const _startInterface = require("./interface/startInterface");
const _resolveOptions = require("./resolveOptions");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _DevServerManager = require("./server/DevServerManager");
const _openPlatforms = require("./server/openPlatforms");
const _platformBundlers = require("./server/platformBundlers");
const _env = require("../utils/env");
const _interactive = require("../utils/interactive");
const _profile = require("../utils/profile");
const _MCP = require("./server/MCP");
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
async function getMultiBundlerStartOptions(projectRoot, options, settings, platformBundlers) {
    const commonOptions = {
        mode: options.dev ? 'development' : 'production',
        devClient: options.devClient,
        privateKeyPath: options.privateKeyPath ?? undefined,
        https: options.https,
        maxWorkers: options.maxWorkers,
        resetDevServer: options.clear,
        minify: options.minify,
        location: {
            hostType: options.host,
            scheme: options.scheme
        }
    };
    const multiBundlerSettings = await (0, _resolveOptions.resolvePortsAsync)(projectRoot, options, settings);
    const optionalBundlers = {
        ...platformBundlers
    };
    // In the default case, we don't want to start multiple bundlers since this is
    // a bit slower. Our priority (for legacy) is native platforms.
    if (!options.web) {
        delete optionalBundlers['web'];
    }
    const bundlers = [
        ...new Set(Object.values(optionalBundlers))
    ];
    const multiBundlerStartOptions = bundlers.map((bundler)=>{
        const port = bundler === 'webpack' ? multiBundlerSettings.webpackPort : multiBundlerSettings.metroPort;
        return {
            type: bundler,
            options: {
                ...commonOptions,
                port
            }
        };
    });
    return [
        commonOptions,
        multiBundlerStartOptions
    ];
}
async function startAsync(projectRoot, options, settings) {
    var _exp_platforms, _devServerManager_getDefaultDevServer;
    _log.log(_chalk().default.gray(`Starting project at ${projectRoot}`));
    const { exp, pkg } = (0, _profile.profile)(_config().getConfig)(projectRoot);
    if (((_exp_platforms = exp.platforms) == null ? void 0 : _exp_platforms.includes('ios')) && process.platform !== 'win32') {
        // If Xcode could potentially be used, then we should eagerly perform the
        // assertions since they can take a while on cold boots.
        (0, _XcodePrerequisite.getXcodeVersionAsync)({
            silent: true
        });
        _SimulatorAppPrerequisite.SimulatorAppPrerequisite.instance.assertAsync().catch(()=>{
        // noop -- this will be thrown again when the user attempts to open the project.
        });
    }
    const platformBundlers = (0, _platformBundlers.getPlatformBundlers)(projectRoot, exp);
    const [defaultOptions, startOptions] = await getMultiBundlerStartOptions(projectRoot, options, settings, platformBundlers);
    const devServerManager = new _DevServerManager.DevServerManager(projectRoot, defaultOptions);
    // Validations
    if (options.web || settings.webOnly) {
        await devServerManager.ensureProjectPrerequisiteAsync(_WebSupportProjectPrerequisite.WebSupportProjectPrerequisite);
    }
    // Start the server as soon as possible.
    await (0, _profile.profile)(devServerManager.startAsync.bind(devServerManager))(startOptions);
    if (!settings.webOnly) {
        await devServerManager.watchEnvironmentVariables();
        // After the server starts, we can start attempting to bootstrap TypeScript.
        await devServerManager.bootstrapTypeScriptAsync();
    }
    if (!_env.env.EXPO_NO_DEPENDENCY_VALIDATION && !settings.webOnly && !options.devClient) {
        await (0, _profile.profile)(_validateDependenciesVersions.validateDependenciesVersionsAsync)(projectRoot, exp, pkg);
    }
    // Open project on devices.
    await (0, _profile.profile)(_openPlatforms.openPlatformsAsync)(devServerManager, options);
    const defaultServerUrl = ((_devServerManager_getDefaultDevServer = devServerManager.getDefaultDevServer()) == null ? void 0 : _devServerManager_getDefaultDevServer.getDevServerUrl()) ?? '';
    const mcpServer = await (0, _profile.profile)(_MCP.maybeCreateMCPServerAsync)({
        projectRoot,
        devServerUrl: defaultServerUrl
    }) ?? undefined;
    // Present the Terminal UI.
    if ((0, _interactive.isInteractive)()) {
        await (0, _profile.profile)(_startInterface.startInterfaceAsync)(devServerManager, {
            platforms: exp.platforms ?? [
                'ios',
                'android',
                'web'
            ],
            mcpServer
        });
    } else {
        // Display the server location in CI...
        if (defaultServerUrl) {
            if (_env.env.__EXPO_E2E_TEST) {
                // Print the URL to stdout for tests
                console.info(`[__EXPO_E2E_TEST:server] ${JSON.stringify({
                    url: defaultServerUrl
                })}`);
            }
            _log.log((0, _chalk().default)`Waiting on {underline ${defaultServerUrl}}`);
        }
    }
    mcpServer == null ? void 0 : mcpServer.start();
    // Final note about closing the server.
    const logLocation = settings.webOnly ? 'in the browser console' : 'below';
    _log.log((0, _chalk().default)`Logs for your project will appear ${logLocation}.${(0, _interactive.isInteractive)() ? _chalk().default.dim(` Press Ctrl+C to exit.`) : ''}`);
}

//# sourceMappingURL=startAsync.js.map