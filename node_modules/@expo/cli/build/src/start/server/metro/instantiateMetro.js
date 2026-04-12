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
    instantiateMetroAsync: function() {
        return instantiateMetroAsync;
    },
    isWatchEnabled: function() {
        return isWatchEnabled;
    },
    loadMetroConfigAsync: function() {
        return loadMetroConfigAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _paths() {
    const data = require("@expo/config/paths");
    _paths = function() {
        return data;
    };
    return data;
}
function _RevisionNotFoundError() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro/IncrementalBundler/RevisionNotFoundError"));
    _RevisionNotFoundError = function() {
        return data;
    };
    return data;
}
function _formatBundlingError() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro/lib/formatBundlingError"));
    _formatBundlingError = function() {
        return data;
    };
    return data;
}
function _metroconfig() {
    const data = require("@expo/metro/metro-config");
    _metroconfig = function() {
        return data;
    };
    return data;
}
function _metrocore() {
    const data = require("@expo/metro/metro-core");
    _metrocore = function() {
        return data;
    };
    return data;
}
function _metroconfig1() {
    const data = require("@expo/metro-config");
    _metroconfig1 = function() {
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _DevToolsPluginWebsocketEndpoint = require("./DevToolsPluginWebsocketEndpoint");
const _MetroTerminalReporter = require("./MetroTerminalReporter");
const _attachAtlas = require("./debugging/attachAtlas");
const _createDebugMiddleware = require("./debugging/createDebugMiddleware");
const _createMetroMiddleware = require("./dev-server/createMetroMiddleware");
const _runServerfork = require("./runServer-fork");
const _withMetroMultiPlatform = require("./withMetroMultiPlatform");
const _log = require("../../../log");
const _env = require("../../../utils/env");
const _errors = require("../../../utils/errors");
const _CorsMiddleware = require("../middleware/CorsMiddleware");
const _createJsInspectorMiddleware = require("../middleware/inspector/createJsInspectorMiddleware");
const _mutations = require("../middleware/mutations");
const _platformBundlers = require("../platformBundlers");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Wrap terminal and polyfill console.log so we can log during bundling without breaking the indicator.
class LogRespectingTerminal extends _metrocore().Terminal {
    constructor(stream){
        super(stream, {
            ttyPrint: true
        });
        const sendLog = (...msg)=>{
            if (!msg.length) {
                this.log('');
            } else {
                const [format, ...args] = msg;
                this.log(format, ...args);
            }
            // Flush the logs to the terminal immediately so logs at the end of the process are not lost.
            this.flush();
        };
        console.log = sendLog;
        console.info = sendLog;
    }
}
// Share one instance of Terminal for all instances of Metro.
const terminal = new LogRespectingTerminal(process.stdout);
async function loadMetroConfigAsync(projectRoot, options, { exp, isExporting, getMetroBundler }) {
    var _exp_experiments, _exp_experiments1, _exp_experiments2, _exp_experiments3, _exp_experiments4, _config_resolver, _exp_experiments5, _exp_experiments6, _exp_experiments7;
    let reportEvent;
    const autolinkingModuleResolutionEnabled = ((_exp_experiments = exp.experiments) == null ? void 0 : _exp_experiments.autolinkingModuleResolution) ?? _env.env.EXPO_USE_STICKY_RESOLVER;
    const serverActionsEnabled = ((_exp_experiments1 = exp.experiments) == null ? void 0 : _exp_experiments1.reactServerFunctions) ?? _env.env.EXPO_UNSTABLE_SERVER_FUNCTIONS;
    if (serverActionsEnabled) {
        process.env.EXPO_UNSTABLE_SERVER_FUNCTIONS = '1';
    }
    // NOTE: Enable all the experimental Metro flags when RSC is enabled.
    if (((_exp_experiments2 = exp.experiments) == null ? void 0 : _exp_experiments2.reactServerComponentRoutes) || serverActionsEnabled) {
        process.env.EXPO_USE_METRO_REQUIRE = '1';
    }
    const isReactCanaryEnabled = (((_exp_experiments3 = exp.experiments) == null ? void 0 : _exp_experiments3.reactServerComponentRoutes) || serverActionsEnabled || ((_exp_experiments4 = exp.experiments) == null ? void 0 : _exp_experiments4.reactCanary)) ?? false;
    const serverRoot = (0, _paths().getMetroServerRoot)(projectRoot);
    const terminalReporter = new _MetroTerminalReporter.MetroTerminalReporter(serverRoot, terminal);
    // NOTE: Allow external tools to override the metro config. This is considered internal and unstable
    const configPath = _env.env.EXPO_OVERRIDE_METRO_CONFIG ?? undefined;
    const resolvedConfig = await (0, _metroconfig().resolveConfig)(configPath, projectRoot);
    const defaultConfig = (0, _metroconfig1().getDefaultConfig)(projectRoot);
    let config = resolvedConfig.isEmpty ? defaultConfig : await (0, _metroconfig().mergeConfig)(defaultConfig, resolvedConfig.config);
    // Set the watchfolders to include the projectRoot, as Metro assumes this
    // Force-override the reporter
    config = {
        ...config,
        // See: `overrideConfigWithArguments` https://github.com/facebook/metro/blob/5059e26/packages/metro-config/src/loadConfig.js#L274-L339
        // Compare to `LoadOptions` type (disregard `reporter` as we don't expose this)
        resetCache: !!options.resetCache,
        maxWorkers: options.maxWorkers ?? config.maxWorkers,
        server: {
            ...config.server,
            port: options.port ?? config.server.port
        },
        watchFolders: !config.watchFolders.includes(config.projectRoot) ? [
            config.projectRoot,
            ...config.watchFolders
        ] : config.watchFolders,
        reporter: {
            update (event) {
                terminalReporter.update(event);
                if (reportEvent) {
                    reportEvent(event);
                }
            }
        }
    };
    // @ts-expect-error: Set the global require cycle ignore patterns for SSR bundles. This won't work with custom global prefixes, but we don't use those.
    globalThis.__requireCycleIgnorePatterns = (_config_resolver = config.resolver) == null ? void 0 : _config_resolver.requireCycleIgnorePatterns;
    if (isExporting) {
        var _exp_experiments8;
        // This token will be used in the asset plugin to ensure the path is correct for writing locally.
        // @ts-expect-error: typed as readonly.
        config.transformer.publicPath = `/assets?export_path=${(((_exp_experiments8 = exp.experiments) == null ? void 0 : _exp_experiments8.baseUrl) ?? '') + '/assets'}`;
    } else {
        // @ts-expect-error: typed as readonly
        config.transformer.publicPath = '/assets/?unstable_path=.';
    }
    const platformBundlers = (0, _platformBundlers.getPlatformBundlers)(projectRoot, exp);
    if ((_exp_experiments5 = exp.experiments) == null ? void 0 : _exp_experiments5.reactCompiler) {
        _log.Log.log(_chalk().default.gray`React Compiler enabled`);
    }
    if (_env.env.EXPO_UNSTABLE_TREE_SHAKING && !_env.env.EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH) {
        throw new _errors.CommandError('EXPO_UNSTABLE_TREE_SHAKING requires EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH to be enabled.');
    }
    if (_env.env.EXPO_UNSTABLE_TREE_SHAKING) {
        _log.Log.warn(`Experimental fast resolver is enabled.`);
    }
    if (_env.env.EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH) {
        _log.Log.warn(`Experimental bundle optimization is enabled.`);
    }
    if (_env.env.EXPO_UNSTABLE_TREE_SHAKING) {
        _log.Log.warn(`Experimental tree shaking is enabled.`);
    }
    if (autolinkingModuleResolutionEnabled) {
        _log.Log.warn(`Experimental Expo Autolinking module resolver is enabled.`);
    }
    if (serverActionsEnabled) {
        var _exp_experiments9;
        _log.Log.warn(`React Server Functions (beta) are enabled. Route rendering mode: ${((_exp_experiments9 = exp.experiments) == null ? void 0 : _exp_experiments9.reactServerComponentRoutes) ? 'server' : 'client'}`);
    }
    config = await (0, _withMetroMultiPlatform.withMetroMultiPlatformAsync)(projectRoot, {
        config,
        exp,
        platformBundlers,
        isTsconfigPathsEnabled: ((_exp_experiments6 = exp.experiments) == null ? void 0 : _exp_experiments6.tsconfigPaths) ?? true,
        isAutolinkingResolverEnabled: autolinkingModuleResolutionEnabled,
        isFastResolverEnabled: _env.env.EXPO_USE_FAST_RESOLVER,
        isExporting,
        isReactCanaryEnabled,
        isNamedRequiresEnabled: _env.env.EXPO_USE_METRO_REQUIRE,
        isReactServerComponentsEnabled: !!((_exp_experiments7 = exp.experiments) == null ? void 0 : _exp_experiments7.reactServerComponentRoutes),
        getMetroBundler
    });
    return {
        config,
        setEventReporter: (logger)=>reportEvent = logger,
        reporter: terminalReporter
    };
}
async function instantiateMetroAsync(metroBundler, options, { isExporting, exp = (0, _config().getConfig)(metroBundler.projectRoot, {
    skipSDKVersionRequirement: true
}).exp }) {
    const projectRoot = metroBundler.projectRoot;
    const { config: metroConfig, setEventReporter, reporter } = await loadMetroConfigAsync(projectRoot, options, {
        exp,
        isExporting,
        getMetroBundler () {
            return metro.getBundler().getBundler();
        }
    });
    // Create the core middleware stack for Metro, including websocket listeners
    const { middleware, messagesSocket, eventsSocket, websocketEndpoints } = (0, _createMetroMiddleware.createMetroMiddleware)(metroConfig);
    // Get local URL to Metro bundler server (typically configured as 127.0.0.1:8081)
    const serverBaseUrl = metroBundler.getUrlCreator().constructUrl({
        scheme: 'http',
        hostType: 'localhost'
    });
    if (!isExporting) {
        // Enable correct CORS headers for Expo Router features
        (0, _mutations.prependMiddleware)(middleware, (0, _CorsMiddleware.createCorsMiddleware)(exp));
        // Enable debug middleware for CDP-related debugging
        const { debugMiddleware, debugWebsocketEndpoints } = (0, _createDebugMiddleware.createDebugMiddleware)({
            projectRoot: metroBundler.projectRoot,
            serverBaseUrl,
            reporter
        });
        Object.assign(websocketEndpoints, debugWebsocketEndpoints);
        middleware.use(debugMiddleware);
        middleware.use('/_expo/debugger', (0, _createJsInspectorMiddleware.createJsInspectorMiddleware)());
        // TODO(cedric): `enhanceMiddleware` is deprecated, but is currently used to unify the middleware stacks
        // See: https://github.com/facebook/metro/commit/22e85fde85ec454792a1b70eba4253747a2587a9
        // See: https://github.com/facebook/metro/commit/d0d554381f119bb80ab09dbd6a1d310b54737e52
        const customEnhanceMiddleware = metroConfig.server.enhanceMiddleware;
        // @ts-expect-error: can't mutate readonly config
        metroConfig.server.enhanceMiddleware = (metroMiddleware, server)=>{
            if (customEnhanceMiddleware) {
                metroMiddleware = customEnhanceMiddleware(metroMiddleware, server);
            }
            return middleware.use(metroMiddleware);
        };
        const devtoolsWebsocketEndpoints = (0, _DevToolsPluginWebsocketEndpoint.createDevToolsPluginWebsocketEndpoint)();
        Object.assign(websocketEndpoints, devtoolsWebsocketEndpoints);
    }
    // Attach Expo Atlas if enabled
    await (0, _attachAtlas.attachAtlasAsync)({
        isExporting,
        exp,
        projectRoot,
        middleware,
        metroConfig,
        // NOTE(cedric): reset the Atlas file once, and reuse it for static exports
        resetAtlasFile: isExporting
    });
    const { server, hmrServer, metro } = await (0, _runServerfork.runServer)(metroBundler, metroConfig, {
        websocketEndpoints,
        watch: !isExporting && isWatchEnabled()
    }, {
        mockServer: isExporting
    });
    // Patch transform file to remove inconvenient customTransformOptions which are only used in single well-known files.
    const originalTransformFile = metro.getBundler().getBundler().transformFile.bind(metro.getBundler().getBundler());
    metro.getBundler().getBundler().transformFile = async function(filePath, transformOptions, fileBuffer) {
        return originalTransformFile(filePath, pruneCustomTransformOptions(filePath, // Clone the options so we don't mutate the original.
        {
            ...transformOptions,
            customTransformOptions: {
                __proto__: null,
                ...transformOptions.customTransformOptions
            }
        }), fileBuffer);
    };
    setEventReporter(eventsSocket.reportMetroEvent);
    // This function ensures that modules in source maps are sorted in the same
    // order as in a plain JS bundle.
    metro._getSortedModules = function(graph) {
        var _graph_transformOptions_customTransformOptions;
        const modules = [
            ...graph.dependencies.values()
        ];
        const ctx = {
            platform: graph.transformOptions.platform,
            environment: (_graph_transformOptions_customTransformOptions = graph.transformOptions.customTransformOptions) == null ? void 0 : _graph_transformOptions_customTransformOptions.environment
        };
        // Assign IDs to modules in a consistent order
        for (const module of modules){
            // @ts-expect-error
            this._createModuleId(module.path, ctx);
        }
        // Sort by IDs
        return modules.sort(// @ts-expect-error
        (a, b)=>this._createModuleId(a.path, ctx) - this._createModuleId(b.path, ctx));
    };
    if (hmrServer) {
        let hmrJSBundle;
        try {
            hmrJSBundle = require('@expo/metro-config/build/serializer/fork/hmrJSBundle').default;
        } catch  {
            // TODO: Add fallback for monorepo tests up until the fork is merged.
            _log.Log.warn('Failed to load HMR serializer from @expo/metro-config, using fallback version.');
            hmrJSBundle = require('@expo/metro/metro/DeltaBundler/Serializers/hmrJSBundle');
        }
        // Patch HMR Server to send more info to the `_createModuleId` function for deterministic module IDs and add support for serializing HMR updates the same as all other bundles.
        hmrServer._prepareMessage = async function(group, options, changeEvent) {
            // Fork of https://github.com/facebook/metro/blob/3b3e0aaf725cfa6907bf2c8b5fbc0da352d29efe/packages/metro/src/HmrServer.js#L327-L393
            // with patch for `_createModuleId`.
            const logger = !options.isInitialUpdate ? changeEvent == null ? void 0 : changeEvent.logger : null;
            try {
                var _revision_graph_transformOptions_customTransformOptions;
                const revPromise = this._bundler.getRevision(group.revisionId);
                if (!revPromise) {
                    return {
                        type: 'error',
                        body: (0, _formatBundlingError().default)(new (_RevisionNotFoundError()).default(group.revisionId))
                    };
                }
                logger == null ? void 0 : logger.point('updateGraph_start');
                const { revision, delta } = await this._bundler.updateGraph(await revPromise, false);
                logger == null ? void 0 : logger.point('updateGraph_end');
                this._clientGroups.delete(group.revisionId);
                group.revisionId = revision.id;
                for (const client of group.clients){
                    client.revisionIds = client.revisionIds.filter((revisionId)=>revisionId !== group.revisionId);
                    client.revisionIds.push(revision.id);
                }
                this._clientGroups.set(group.revisionId, group);
                logger == null ? void 0 : logger.point('serialize_start');
                // NOTE(EvanBacon): This is the patch
                const moduleIdContext = {
                    platform: revision.graph.transformOptions.platform,
                    environment: (_revision_graph_transformOptions_customTransformOptions = revision.graph.transformOptions.customTransformOptions) == null ? void 0 : _revision_graph_transformOptions_customTransformOptions.environment
                };
                const hmrUpdate = hmrJSBundle(delta, revision.graph, {
                    clientUrl: group.clientUrl,
                    // NOTE(EvanBacon): This is also the patch
                    createModuleId: (moduleId)=>{
                        // @ts-expect-error
                        return this._createModuleId(moduleId, moduleIdContext);
                    },
                    includeAsyncPaths: group.graphOptions.lazy,
                    projectRoot: this._config.projectRoot,
                    serverRoot: this._config.server.unstable_serverRoot ?? this._config.projectRoot
                });
                logger == null ? void 0 : logger.point('serialize_end');
                return {
                    type: 'update',
                    body: {
                        revisionId: revision.id,
                        isInitialUpdate: options.isInitialUpdate,
                        ...hmrUpdate
                    }
                };
            } catch (error) {
                const formattedError = (0, _formatBundlingError().default)(error);
                this._config.reporter.update({
                    type: 'bundling_error',
                    error
                });
                return {
                    type: 'error',
                    body: formattedError
                };
            }
        };
    }
    return {
        metro,
        hmrServer,
        server,
        middleware,
        messageSocket: messagesSocket
    };
}
// TODO: Fork the entire transform function so we can simply regex the file contents for keywords instead.
function pruneCustomTransformOptions(filePath, transformOptions) {
    var _transformOptions_customTransformOptions, _transformOptions_customTransformOptions1, _transformOptions_customTransformOptions2, _transformOptions_customTransformOptions3;
    // Normalize the filepath for cross platform checking.
    filePath = filePath.split(_path().default.sep).join('/');
    if (((_transformOptions_customTransformOptions = transformOptions.customTransformOptions) == null ? void 0 : _transformOptions_customTransformOptions.dom) && // The only generated file that needs the dom root is `expo/dom/entry.js`
    !filePath.match(/expo\/dom\/entry\.js$/)) {
        // Clear the dom root option if we aren't transforming the magic entry file, this ensures
        // that cached artifacts from other DOM component bundles can be reused.
        transformOptions.customTransformOptions.dom = 'true';
    }
    if (((_transformOptions_customTransformOptions1 = transformOptions.customTransformOptions) == null ? void 0 : _transformOptions_customTransformOptions1.routerRoot) && // The router root is used all over expo-router (`process.env.EXPO_ROUTER_ABS_APP_ROOT`, `process.env.EXPO_ROUTER_APP_ROOT`) so we'll just ignore the entire package.
    !(filePath.match(/\/expo-router\/_ctx/) || filePath.match(/\/expo-router\/build\//))) {
        // Set to the default value.
        transformOptions.customTransformOptions.routerRoot = 'app';
    }
    if (((_transformOptions_customTransformOptions2 = transformOptions.customTransformOptions) == null ? void 0 : _transformOptions_customTransformOptions2.asyncRoutes) && // The async routes settings are also used in `expo-router/_ctx.ios.js` (and other platform variants) via `process.env.EXPO_ROUTER_IMPORT_MODE`
    !(filePath.match(/\/expo-router\/_ctx/) || filePath.match(/\/expo-router\/build\//))) {
        delete transformOptions.customTransformOptions.asyncRoutes;
    }
    if (((_transformOptions_customTransformOptions3 = transformOptions.customTransformOptions) == null ? void 0 : _transformOptions_customTransformOptions3.clientBoundaries) && // The client boundaries are only used in `expo/virtual/rsc.js` for production RSC exports.
    !filePath.match(/\/expo\/virtual\/rsc\.js$/)) {
        delete transformOptions.customTransformOptions.clientBoundaries;
    }
    return transformOptions;
}
function isWatchEnabled() {
    if (_env.env.CI) {
        _log.Log.log((0, _chalk().default)`Metro is running in CI mode, reloads are disabled. Remove {bold CI=true} to enable watch mode.`);
    }
    return !_env.env.CI;
}

//# sourceMappingURL=instantiateMetro.js.map