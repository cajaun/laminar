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
    WebpackBundlerDevServer: function() {
        return WebpackBundlerDevServer;
    },
    getProjectWebpackConfigFilePath: function() {
        return getProjectWebpackConfigFilePath;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _nodefs() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:fs"));
    _nodefs = function() {
        return data;
    };
    return data;
}
function _nodepath() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:path"));
    _nodepath = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _compile = require("./compile");
const _resolveFromProject = require("./resolveFromProject");
const _tls = require("./tls");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _env = require("../../../utils/env");
const _errors = require("../../../utils/errors");
const _ip = require("../../../utils/ip");
const _nodeEnv = require("../../../utils/nodeEnv");
const _port = require("../../../utils/port");
const _progress = require("../../../utils/progress");
const _dotExpo = require("../../project/dotExpo");
const _BundlerDevServer = require("../BundlerDevServer");
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
const debug = require('debug')('expo:start:server:webpack:devServer');
function assertIsWebpackDevServer(value) {
    if (!(value == null ? void 0 : value.sockWrite) && !(value == null ? void 0 : value.sendMessage)) {
        var _value_constructor;
        throw new _errors.CommandError('WEBPACK', value ? 'Expected Webpack dev server, found: ' + (((_value_constructor = value.constructor) == null ? void 0 : _value_constructor.name) ?? value) : 'Webpack dev server not started yet.');
    }
}
class WebpackBundlerDevServer extends _BundlerDevServer.BundlerDevServer {
    get name() {
        return 'webpack';
    }
    async startTypeScriptServices() {
    //  noop -- this feature is Metro-only.
    }
    broadcastMessage(method, params) {
        var _this_instance;
        if (!this.instance) {
            return;
        }
        assertIsWebpackDevServer((_this_instance = this.instance) == null ? void 0 : _this_instance.server);
        // TODO(EvanBacon): Custom Webpack overlay.
        // Default webpack-dev-server sockets use "content-changed" instead of "reload" (what we use on native).
        // For now, just manually convert the value so our CLI interface can be unified.
        const hackyConvertedMessage = method === 'reload' ? 'content-changed' : method;
        if ('sendMessage' in this.instance.server) {
            // @ts-expect-error: https://github.com/expo/expo/issues/21994#issuecomment-1517122501
            this.instance.server.sendMessage(this.instance.server.sockets, hackyConvertedMessage, params);
        } else {
            this.instance.server.sockWrite(this.instance.server.sockets, hackyConvertedMessage, params);
        }
    }
    isTargetingNative() {
        return false;
    }
    async getAvailablePortAsync(options) {
        try {
            const defaultPort = (options == null ? void 0 : options.defaultPort) ?? 19006;
            const port = await (0, _port.choosePortAsync)(this.projectRoot, {
                defaultPort,
                host: _env.env.WEB_HOST
            });
            if (!port) {
                throw new _errors.CommandError('NO_PORT_FOUND', `Port ${defaultPort} not available.`);
            }
            return port;
        } catch (error) {
            throw new _errors.CommandError('NO_PORT_FOUND', error.message);
        }
    }
    async bundleAsync({ mode, clear }) {
        // Do this first to fail faster.
        const webpack = (0, _resolveFromProject.importWebpackFromProject)(this.projectRoot);
        if (clear) {
            await this.clearWebProjectCacheAsync(this.projectRoot, mode);
        }
        const config = await this.loadConfigAsync({
            isImageEditingEnabled: true,
            mode
        });
        if (!config.plugins) {
            config.plugins = [];
        }
        const bar = (0, _progress.createProgressBar)((0, _chalk().default)`{bold Web} Bundling Javascript [:bar] :percent`, {
            width: 64,
            total: 100,
            clear: true,
            complete: '=',
            incomplete: ' '
        });
        // NOTE(EvanBacon): Add a progress bar to the webpack logger if defined (e.g. not in CI).
        if (bar != null) {
            config.plugins.push(new webpack.ProgressPlugin((percent)=>{
                bar == null ? void 0 : bar.update(percent);
                if (percent === 1) {
                    bar == null ? void 0 : bar.terminate();
                }
            }));
        }
        // Create a webpack compiler that is configured with custom messages.
        const compiler = webpack(config);
        try {
            await (0, _compile.compileAsync)(compiler);
        } catch (error) {
            _log.error(_chalk().default.red('Failed to compile'));
            throw error;
        } finally{
            bar == null ? void 0 : bar.terminate();
        }
    }
    async startImplementationAsync(options) {
        // Do this first to fail faster.
        const webpack = (0, _resolveFromProject.importWebpackFromProject)(this.projectRoot);
        const WebpackDevServer = (0, _resolveFromProject.importWebpackDevServerFromProject)(this.projectRoot);
        await this.stopAsync();
        options.port = await this.getAvailablePortAsync({
            defaultPort: options.port
        });
        const { resetDevServer, https, port, mode } = options;
        this.urlCreator = this.getUrlCreator({
            port,
            location: {
                scheme: https ? 'https' : 'http'
            }
        });
        debug('Starting webpack on port: ' + port);
        if (resetDevServer) {
            await this.clearWebProjectCacheAsync(this.projectRoot, mode);
        }
        if (https) {
            debug('Configuring TLS to enable HTTPS support');
            await (0, _tls.ensureEnvironmentSupportsTLSAsync)(this.projectRoot).catch((error)=>{
                _log.error(`Error creating TLS certificates: ${error}`);
            });
        }
        const config = await this.loadConfigAsync(options);
        _log.log((0, _chalk().default)`Starting Webpack on port ${port} in {underline ${mode}} mode.`);
        // Create a webpack compiler that is configured with custom messages.
        const compiler = webpack(config);
        const server = new WebpackDevServer(compiler, config.devServer);
        // Launch WebpackDevServer.
        server.listen(port, _env.env.WEB_HOST, function(error) {
            if (error) {
                _log.error(error.message);
            }
        });
        // Extend the close method to ensure that we clean up the local info.
        const originalClose = server.close.bind(server);
        server.close = (callback)=>{
            return originalClose((err)=>{
                this.instance = null;
                callback == null ? void 0 : callback(err);
            });
        };
        const _host = (0, _ip.getIpAddress)();
        const protocol = https ? 'https' : 'http';
        return {
            // Server instance
            server,
            // URL Info
            location: {
                url: `${protocol}://${_host}:${port}`,
                port,
                protocol,
                host: _host
            },
            middleware: null,
            // Match the native protocol.
            messageSocket: {
                broadcast: this.broadcastMessage
            }
        };
    }
    /** Load the Webpack config. Exposed for testing. */ getProjectConfigFilePath() {
        // Check if the project has a webpack.config.js in the root.
        return this.getConfigModuleIds().reduce((prev, moduleId)=>prev || _resolvefrom().default.silent(this.projectRoot, moduleId), null) ?? null;
    }
    async loadConfigAsync(options, argv) {
        // let bar: ProgressBar | null = null;
        const env = {
            projectRoot: this.projectRoot,
            pwa: !!options.isImageEditingEnabled,
            // TODO: Use a new loader in Webpack config...
            logger: {
                info () {}
            },
            mode: options.mode,
            https: options.https
        };
        (0, _nodeEnv.setNodeEnv)(env.mode ?? 'development');
        require('@expo/env').load(env.projectRoot);
        // Check if the project has a webpack.config.js in the root.
        const projectWebpackConfig = this.getProjectConfigFilePath();
        let config;
        if (projectWebpackConfig) {
            const webpackConfig = require(projectWebpackConfig);
            if (typeof webpackConfig === 'function') {
                config = await webpackConfig(env, argv);
            } else {
                config = webpackConfig;
            }
        } else {
            // Fallback to the default expo webpack config.
            const loadDefaultConfigAsync = (0, _resolveFromProject.importExpoWebpackConfigFromProject)(this.projectRoot);
            config = await loadDefaultConfigAsync(env, argv);
        }
        return config;
    }
    getConfigModuleIds() {
        return [
            './webpack.config.js'
        ];
    }
    async clearWebProjectCacheAsync(projectRoot, mode = 'development') {
        _log.log(_chalk().default.dim(`Clearing Webpack ${mode} cache directory...`));
        const dir = await (0, _dotExpo.ensureDotExpoProjectDirectoryInitialized)(projectRoot);
        const cacheFolder = _nodepath().default.join(dir, 'web/cache', mode);
        try {
            await _nodefs().default.promises.rm(cacheFolder, {
                recursive: true,
                force: true
            });
        } catch (error) {
            _log.error(`Could not clear ${mode} web cache directory: ${error.message}`);
        }
    }
}
function getProjectWebpackConfigFilePath(projectRoot) {
    return _resolvefrom().default.silent(projectRoot, './webpack.config.js');
}

//# sourceMappingURL=WebpackBundlerDevServer.js.map