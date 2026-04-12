"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BundlerDevServer", {
    enumerable: true,
    get: function() {
        return BundlerDevServer;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
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
const _AsyncNgrok = require("./AsyncNgrok");
const _AsyncWsTunnel = require("./AsyncWsTunnel");
const _DevToolsPluginManager = /*#__PURE__*/ _interop_require_default(require("./DevToolsPluginManager"));
const _DevelopmentSession = require("./DevelopmentSession");
const _UrlCreator = require("./UrlCreator");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _FileNotifier = require("../../utils/FileNotifier");
const _delay = require("../../utils/delay");
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
const _open = require("../../utils/open");
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
const debug = require('debug')('expo:start:server:devServer');
const PLATFORM_MANAGERS = {
    simulator: ()=>require('../platforms/ios/ApplePlatformManager').ApplePlatformManager,
    emulator: ()=>require('../platforms/android/AndroidPlatformManager').AndroidPlatformManager
};
class BundlerDevServer {
    constructor(/** Project root folder. */ projectRoot, /** A mapping of bundlers to platforms. */ platformBundlers, /** Advanced options */ options){
        this.projectRoot = projectRoot;
        this.platformBundlers = platformBundlers;
        this.tunnel = null;
        this.devSession = null;
        this.instance = null;
        this.platformManagers = {};
        this.urlCreator = null;
        this.notifier = null;
        this.devToolsPluginManager = (options == null ? void 0 : options.devToolsPluginManager) ?? new _DevToolsPluginManager.default(projectRoot);
        this.isDevClient = (options == null ? void 0 : options.isDevClient) ?? false;
    }
    setInstance(instance) {
        this.instance = instance;
    }
    /** Get the manifest middleware function. */ async getManifestMiddlewareAsync(options = {}) {
        const Middleware = require('./middleware/ExpoGoManifestHandlerMiddleware').ExpoGoManifestHandlerMiddleware;
        const urlCreator = this.getUrlCreator();
        const middleware = new Middleware(this.projectRoot, {
            constructUrl: urlCreator.constructUrl.bind(urlCreator),
            mode: options.mode,
            minify: options.minify,
            isNativeWebpack: this.name === 'webpack' && this.isTargetingNative(),
            privateKeyPath: options.privateKeyPath
        });
        return middleware;
    }
    /** Start the dev server using settings defined in the start command. */ async startAsync(options) {
        await this.stopAsync();
        let instance;
        if (options.headless) {
            instance = await this.startHeadlessAsync(options);
        } else {
            instance = await this.startImplementationAsync(options);
        }
        this.setInstance(instance);
        await this.postStartAsync(options);
        return instance;
    }
    async waitForTypeScriptAsync() {
        return false;
    }
    async watchEnvironmentVariables() {
    // noop -- We've only implemented this functionality in Metro.
    }
    /**
   * Creates a mock server representation that can be used to estimate URLs for a server started in another process.
   * This is used for the run commands where you can reuse the server from a previous run.
   */ async startHeadlessAsync(options) {
        if (!options.port) throw new _errors.CommandError('HEADLESS_SERVER', 'headless dev server requires a port option');
        this.urlCreator = this.getUrlCreator(options);
        return {
            // Create a mock server
            server: {
                close: (callback)=>{
                    this.instance = null;
                    callback == null ? void 0 : callback();
                },
                addListener () {}
            },
            location: {
                // The port is the main thing we want to send back.
                port: options.port,
                // localhost isn't always correct.
                host: 'localhost',
                // http is the only supported protocol on native.
                url: `http://localhost:${options.port}`,
                protocol: 'http'
            },
            middleware: {},
            messageSocket: {
                broadcast: ()=>{
                    throw new _errors.CommandError('HEADLESS_SERVER', 'Cannot broadcast messages to headless server');
                }
            }
        };
    }
    /**
   * Runs after the `startAsync` function, performing any additional common operations.
   * You can assume the dev server is started by the time this function is called.
   */ async postStartAsync(options) {
        if (options.location.hostType === 'tunnel' && !_env.env.EXPO_OFFLINE && // This is a hack to prevent using tunnel on web since we block it upstream for some reason.
        this.isTargetingNative()) {
            await this._startTunnelAsync();
        } else if ((0, _env.envIsWebcontainer)()) {
            await this._startTunnelAsync();
        }
        if (!options.isExporting) {
            await this.startDevSessionAsync();
            this.watchConfig();
        }
    }
    watchConfig() {
        var _this_notifier;
        (_this_notifier = this.notifier) == null ? void 0 : _this_notifier.stopObserving();
        this.notifier = new _FileNotifier.FileNotifier(this.projectRoot, this.getConfigModuleIds());
        this.notifier.startObserving();
    }
    /** Create ngrok instance and start the tunnel server. Exposed for testing. */ async _startTunnelAsync() {
        var _this_getInstance;
        const port = (_this_getInstance = this.getInstance()) == null ? void 0 : _this_getInstance.location.port;
        if (!port) return null;
        debug('[tunnel] connect to port: ' + port);
        this.tunnel = (0, _env.envIsWebcontainer)() ? new _AsyncWsTunnel.AsyncWsTunnel(this.projectRoot, port) : new _AsyncNgrok.AsyncNgrok(this.projectRoot, port);
        await this.tunnel.startAsync();
        return this.tunnel;
    }
    async startDevSessionAsync() {
        // This is used to make Expo Go open the project in either Expo Go, or the web browser.
        // Must come after ngrok (`startTunnelAsync`) setup.
        this.devSession = new _DevelopmentSession.DevelopmentSession(this.projectRoot, // This URL will be used on external devices so the computer IP won't be relevant.
        this.isTargetingNative() ? this.getNativeRuntimeUrl() : this.getDevServerUrl({
            hostType: 'localhost'
        }));
        await this.devSession.startAsync({
            runtime: this.isTargetingNative() ? 'native' : 'web'
        });
    }
    isTargetingNative() {
        // Temporary hack while we implement multi-bundler dev server proxy.
        return true;
    }
    isTargetingWeb() {
        return this.platformBundlers.web === this.name;
    }
    /**
   * Sends a message over web sockets to any connected device,
   * does nothing when the dev server is not running.
   *
   * @param method name of the command. In RN projects `reload`, and `devMenu` are available. In Expo Go, `sendDevCommand` is available.
   * @param params
   */ broadcastMessage(method, params) {
        var _this_getInstance;
        (_this_getInstance = this.getInstance()) == null ? void 0 : _this_getInstance.messageSocket.broadcast(method, params);
    }
    /** Get the running dev server instance. */ getInstance() {
        return this.instance;
    }
    /** Stop the running dev server instance. */ async stopAsync() {
        var // Stop file watching.
        _this_notifier, _this_devSession, _this_tunnel;
        (_this_notifier = this.notifier) == null ? void 0 : _this_notifier.stopObserving();
        // Stop the dev session timer and tell Expo API to remove dev session.
        await ((_this_devSession = this.devSession) == null ? void 0 : _this_devSession.closeAsync());
        // Stop tunnel if running.
        await ((_this_tunnel = this.tunnel) == null ? void 0 : _this_tunnel.stopAsync().catch((e)=>{
            _log.error(`Error stopping tunnel:`);
            _log.exception(e);
        }));
        return (0, _delay.resolveWithTimeout)(()=>new Promise((resolve, reject)=>{
                var _this_instance;
                // Close the server.
                debug(`Stopping dev server (bundler: ${this.name})`);
                if ((_this_instance = this.instance) == null ? void 0 : _this_instance.server) {
                    // Check if server is even running.
                    this.instance.server.close((error)=>{
                        debug(`Stopped dev server (bundler: ${this.name})`);
                        this.instance = null;
                        if (error) {
                            if ('code' in error && error.code === 'ERR_SERVER_NOT_RUNNING') {
                                resolve();
                            } else {
                                reject(error);
                            }
                        } else {
                            resolve();
                        }
                    });
                } else {
                    debug(`Stopped dev server (bundler: ${this.name})`);
                    this.instance = null;
                    resolve();
                }
            }), {
            // NOTE(Bacon): Metro dev server doesn't seem to be closing in time.
            timeout: 1000,
            errorMessage: `Timeout waiting for '${this.name}' dev server to close`
        });
    }
    getUrlCreator(options = {}) {
        if (!this.urlCreator) {
            (0, _assert().default)(options == null ? void 0 : options.port, 'Dev server instance not found');
            this.urlCreator = new _UrlCreator.UrlCreator(options.location, {
                port: options.port,
                getTunnelUrl: this.getTunnelUrl.bind(this)
            });
        }
        return this.urlCreator;
    }
    getNativeRuntimeUrl(opts = {}) {
        return this.isDevClient ? this.getUrlCreator().constructDevClientUrl(opts) ?? this.getDevServerUrl() : this.getUrlCreator().constructUrl({
            ...opts,
            scheme: 'exp'
        });
    }
    /** Get the URL for the running instance of the dev server. */ getDevServerUrl(options = {}) {
        const instance = this.getInstance();
        if (!(instance == null ? void 0 : instance.location)) {
            return null;
        }
        // If we have an active WS tunnel instance, we always need to return the tunnel location.
        if (this.tunnel && this.tunnel instanceof _AsyncWsTunnel.AsyncWsTunnel) {
            return this.getUrlCreator().constructUrl();
        }
        const { location } = instance;
        if (options.hostType === 'localhost') {
            return `${location.protocol}://localhost:${location.port}`;
        }
        return location.url ?? null;
    }
    getDevServerUrlOrAssert(options = {}) {
        const instance = this.getDevServerUrl(options);
        if (!instance) {
            throw new _errors.CommandError('DEV_SERVER', `Cannot get the dev server URL before the server has started - bundler[${this.name}]`);
        }
        return instance;
    }
    /** Get the base URL for JS inspector */ getJsInspectorBaseUrl() {
        if (this.name !== 'metro') {
            throw new _errors.CommandError('DEV_SERVER', `Cannot get the JS inspector base url - bundler[${this.name}]`);
        }
        return this.getUrlCreator().constructUrl({
            scheme: 'http'
        });
    }
    /** Get the tunnel URL from the tunnel. */ getTunnelUrl() {
        var _this_tunnel;
        return ((_this_tunnel = this.tunnel) == null ? void 0 : _this_tunnel.getActiveUrl()) ?? null;
    }
    /** Open the dev server in a runtime. */ async openPlatformAsync(launchTarget, resolver = {}) {
        if (launchTarget === 'desktop') {
            const serverUrl = this.getDevServerUrl({
                hostType: 'localhost'
            });
            // Allow opening the tunnel URL when using Metro web.
            const url = this.name === 'metro' ? this.getTunnelUrl() ?? serverUrl : serverUrl;
            await (0, _open.openBrowserAsync)(url);
            return {
                url
            };
        }
        const runtime = this.isTargetingNative() ? this.isDevClient ? 'custom' : 'expo' : 'web';
        const manager = await this.getPlatformManagerAsync(launchTarget);
        return manager.openAsync({
            runtime
        }, resolver);
    }
    /** Open the dev server in a runtime. */ async openCustomRuntimeAsync(launchTarget, launchProps = {}, resolver = {}) {
        const runtime = this.isTargetingNative() ? this.isDevClient ? 'custom' : 'expo' : 'web';
        if (runtime !== 'custom') {
            throw new _errors.CommandError(`dev server cannot open custom runtimes either because it does not target native platforms or because it is not targeting dev clients. (target: ${runtime})`);
        }
        const manager = await this.getPlatformManagerAsync(launchTarget);
        return manager.openAsync({
            runtime: 'custom',
            props: launchProps
        }, resolver);
    }
    /** Get the URL for opening in Expo Go. */ getExpoGoUrl() {
        return this.getUrlCreator().constructUrl({
            scheme: 'exp'
        });
    }
    /** Should use the interstitial page for selecting which runtime to use. */ isRedirectPageEnabled() {
        return !_env.env.EXPO_NO_REDIRECT_PAGE && // if user passed --dev-client flag, skip interstitial page
        !this.isDevClient && // Checks if dev client is installed.
        !!_resolvefrom().default.silent(this.projectRoot, 'expo-dev-client');
    }
    /** Get the redirect URL when redirecting is enabled. */ getRedirectUrl(platform = null) {
        if (!this.isRedirectPageEnabled()) {
            debug('Redirect page is disabled');
            return null;
        }
        return this.getUrlCreator().constructLoadingUrl({}, platform === 'emulator' ? 'android' : platform === 'simulator' ? 'ios' : null) ?? null;
    }
    async getPlatformManagerAsync(platform) {
        if (!this.platformManagers[platform]) {
            var _this_getInstance;
            const Manager = PLATFORM_MANAGERS[platform]();
            const port = (_this_getInstance = this.getInstance()) == null ? void 0 : _this_getInstance.location.port;
            if (!port || !this.urlCreator) {
                throw new _errors.CommandError('DEV_SERVER', 'Cannot interact with native platforms until dev server has started');
            }
            debug(`Creating platform manager (platform: ${platform}, port: ${port})`);
            this.platformManagers[platform] = new Manager(this.projectRoot, port, {
                getCustomRuntimeUrl: this.urlCreator.constructDevClientUrl.bind(this.urlCreator),
                getExpoGoUrl: this.getExpoGoUrl.bind(this),
                getRedirectUrl: this.getRedirectUrl.bind(this, platform),
                getDevServerUrl: this.getDevServerUrl.bind(this, {
                    hostType: 'localhost'
                })
            });
        }
        return this.platformManagers[platform];
    }
}

//# sourceMappingURL=BundlerDevServer.js.map