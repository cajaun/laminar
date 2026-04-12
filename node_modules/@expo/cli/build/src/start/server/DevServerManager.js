"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DevServerManager", {
    enumerable: true,
    get: function() {
        return DevServerManager;
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
const _DevToolsPluginManager = /*#__PURE__*/ _interop_require_default(require("./DevToolsPluginManager"));
const _platformBundlers = require("./platformBundlers");
const _log = require("../../log");
const _FileNotifier = require("../../utils/FileNotifier");
const _env = require("../../utils/env");
const _TypeScriptProjectPrerequisite = require("../doctor/typescript/TypeScriptProjectPrerequisite");
const _commandsTable = require("../interface/commandsTable");
const _adb = /*#__PURE__*/ _interop_require_wildcard(require("../platforms/android/adb"));
const _resolveOptions = require("../resolveOptions");
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
const debug = require('debug')('expo:start:server:devServerManager');
const BUNDLERS = {
    webpack: ()=>require('./webpack/WebpackBundlerDevServer').WebpackBundlerDevServer,
    metro: ()=>require('./metro/MetroBundlerDevServer').MetroBundlerDevServer
};
class DevServerManager {
    static async startMetroAsync(projectRoot, startOptions) {
        const devServerManager = new DevServerManager(projectRoot, startOptions);
        await devServerManager.startAsync([
            {
                type: 'metro',
                options: startOptions
            }
        ]);
        return devServerManager;
    }
    constructor(projectRoot, /** Keep track of the original CLI options for bundlers that are started interactively. */ options){
        this.projectRoot = projectRoot;
        this.options = options;
        this.devServers = [];
        this.projectPrerequisites = [];
        this.notifier = null;
        if (!options.isExporting) {
            this.notifier = this.watchBabelConfig();
        }
        this.devtoolsPluginManager = new _DevToolsPluginManager.default(projectRoot);
    }
    watchBabelConfig() {
        const notifier = new _FileNotifier.FileNotifier(this.projectRoot, [
            './babel.config.js',
            './babel.config.json',
            './.babelrc.json',
            './.babelrc',
            './.babelrc.js'
        ], {
            additionalWarning: (0, _chalk().default)` You may need to clear the bundler cache with the {bold --clear} flag for your changes to take effect.`
        });
        notifier.startObserving();
        return notifier;
    }
    /** Lazily load and assert a project-level prerequisite. */ async ensureProjectPrerequisiteAsync(PrerequisiteClass) {
        let prerequisite = this.projectPrerequisites.find((prerequisite)=>prerequisite instanceof PrerequisiteClass);
        if (!prerequisite) {
            prerequisite = new PrerequisiteClass(this.projectRoot);
            this.projectPrerequisites.push(prerequisite);
        }
        return await prerequisite.assertAsync();
    }
    /**
   * Sends a message over web sockets to all connected devices,
   * does nothing when the dev server is not running.
   *
   * @param method name of the command. In RN projects `reload`, and `devMenu` are available. In Expo Go, `sendDevCommand` is available.
   * @param params extra event info to send over the socket.
   */ broadcastMessage(method, params) {
        this.devServers.forEach((server)=>{
            server.broadcastMessage(method, params);
        });
    }
    /** Get the port for the dev server (either Webpack or Metro) that is hosting code for React Native runtimes. */ getNativeDevServerPort() {
        var _server_getInstance;
        const server = this.devServers.find((server)=>server.isTargetingNative());
        return (server == null ? void 0 : (_server_getInstance = server.getInstance()) == null ? void 0 : _server_getInstance.location.port) ?? null;
    }
    /** Get the first server that targets web. */ getWebDevServer() {
        const server = this.devServers.find((server)=>server.isTargetingWeb());
        return server ?? null;
    }
    getDefaultDevServer() {
        // Return the first native dev server otherwise return the first dev server.
        const server = this.devServers.find((server)=>server.isTargetingNative());
        const defaultServer = server ?? this.devServers[0];
        (0, _assert().default)(defaultServer, 'No dev servers are running');
        return defaultServer;
    }
    async ensureWebDevServerRunningAsync() {
        const [server] = this.devServers.filter((server)=>server.isTargetingWeb());
        if (server) {
            return;
        }
        const { exp } = (0, _config().getConfig)(this.projectRoot, {
            skipPlugins: true,
            skipSDKVersionRequirement: true
        });
        const bundler = (0, _platformBundlers.getPlatformBundlers)(this.projectRoot, exp).web;
        debug(`Starting ${bundler} dev server for web`);
        return this.startAsync([
            {
                type: bundler,
                options: this.options
            }
        ]);
    }
    /** Switch between Expo Go and Expo Dev Clients. */ async toggleRuntimeMode(isUsingDevClient = !this.options.devClient) {
        const nextMode = isUsingDevClient ? '--dev-client' : '--go';
        _log.Log.log((0, _commandsTable.printItem)((0, _chalk().default)`Switching to {bold ${nextMode}}`));
        const nextScheme = await (0, _resolveOptions.resolveSchemeAsync)(this.projectRoot, {
            devClient: isUsingDevClient
        });
        this.options.location.scheme = nextScheme;
        this.options.devClient = isUsingDevClient;
        for (const devServer of this.devServers){
            devServer.isDevClient = isUsingDevClient;
            const urlCreator = devServer.getUrlCreator();
            urlCreator.defaults ??= {};
            urlCreator.defaults.scheme = nextScheme;
        }
        debug(`New runtime options (runtime: ${nextMode}):`, this.options);
        return true;
    }
    /** Start all dev servers. */ async startAsync(startOptions) {
        const { exp } = (0, _config().getConfig)(this.projectRoot, {
            skipSDKVersionRequirement: true
        });
        const platformBundlers = (0, _platformBundlers.getPlatformBundlers)(this.projectRoot, exp);
        // Start all dev servers...
        for (const { type, options } of startOptions){
            const BundlerDevServerClass = await BUNDLERS[type]();
            const server = new BundlerDevServerClass(this.projectRoot, platformBundlers, {
                devToolsPluginManager: this.devtoolsPluginManager,
                isDevClient: !!(options == null ? void 0 : options.devClient)
            });
            await server.startAsync(options ?? this.options);
            this.devServers.push(server);
        }
        return exp;
    }
    async bootstrapTypeScriptAsync() {
        const typescriptPrerequisite = await this.ensureProjectPrerequisiteAsync(_TypeScriptProjectPrerequisite.TypeScriptProjectPrerequisite);
        if (_env.env.EXPO_NO_TYPESCRIPT_SETUP) {
            return;
        }
        // Optionally, wait for the user to add TypeScript during the
        // development cycle.
        const server = this.devServers.find((server)=>server.name === 'metro');
        if (!server) {
            return;
        }
        // The dev server shouldn't wait for the typescript services
        if (!typescriptPrerequisite) {
            server.waitForTypeScriptAsync().then(async (success)=>{
                if (success) {
                    server.startTypeScriptServices();
                }
            });
        } else {
            server.startTypeScriptServices();
        }
    }
    async watchEnvironmentVariables() {
        var _this_devServers_find;
        await ((_this_devServers_find = this.devServers.find((server)=>server.name === 'metro')) == null ? void 0 : _this_devServers_find.watchEnvironmentVariables());
    }
    /** Stop all servers including ADB. */ async stopAsync() {
        var _this_notifier;
        await Promise.allSettled([
            (_this_notifier = this.notifier) == null ? void 0 : _this_notifier.stopObserving(),
            // Stop ADB
            _adb.getServer().stopAsync(),
            // Stop all dev servers
            ...this.devServers.map((server)=>server.stopAsync().catch((error)=>{
                    _log.Log.error(`Failed to stop dev server (bundler: ${server.name})`);
                    _log.Log.exception(error);
                }))
        ]);
    }
}

//# sourceMappingURL=DevServerManager.js.map