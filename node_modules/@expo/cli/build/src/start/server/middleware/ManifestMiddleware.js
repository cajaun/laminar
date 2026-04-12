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
    DEVELOPER_TOOL: function() {
        return DEVELOPER_TOOL;
    },
    ManifestMiddleware: function() {
        return ManifestMiddleware;
    },
    getEntryWithServerRoot: function() {
        return getEntryWithServerRoot;
    },
    resolveMainModuleName: function() {
        return resolveMainModuleName;
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _url() {
    const data = require("url");
    _url = function() {
        return data;
    };
    return data;
}
const _ExpoMiddleware = require("./ExpoMiddleware");
const _metroOptions = require("./metroOptions");
const _resolveAssets = require("./resolveAssets");
const _resolvePlatform = require("./resolvePlatform");
const _exportHermes = require("../../../export/exportHermes");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _env = require("../../../utils/env");
const _errors = require("../../../utils/errors");
const _url1 = require("../../../utils/url");
const _devices = /*#__PURE__*/ _interop_require_wildcard(require("../../project/devices"));
const _router = require("../metro/router");
const _platformBundlers = require("../platformBundlers");
const _webTemplate = require("../webTemplate");
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
const debug = require('debug')('expo:start:server:middleware:manifest');
const supportedPlatforms = [
    'ios',
    'android',
    'web',
    'none'
];
function getEntryWithServerRoot(projectRoot, props) {
    if (!supportedPlatforms.includes(props.platform)) {
        throw new _errors.CommandError(`Failed to resolve the project's entry file: The platform "${props.platform}" is not supported.`);
    }
    return (0, _metroOptions.convertPathToModuleSpecifier)(_path().default.relative((0, _paths().getMetroServerRoot)(projectRoot), (0, _paths().resolveEntryPoint)(projectRoot, props)));
}
function resolveMainModuleName(projectRoot, props) {
    const entryPoint = getEntryWithServerRoot(projectRoot, props);
    debug(`Resolved entry point: ${entryPoint} (project root: ${projectRoot})`);
    return (0, _metroOptions.convertPathToModuleSpecifier)((0, _url1.stripExtension)(entryPoint, 'js'));
}
const DEVELOPER_TOOL = 'expo-cli';
class ManifestMiddleware extends _ExpoMiddleware.ExpoMiddleware {
    constructor(projectRoot, options){
        super(projectRoot, /**
       * Only support `/`, `/manifest`, `/index.exp` for the manifest middleware.
       */ [
            '/',
            '/manifest',
            '/index.exp'
        ]), this.projectRoot = projectRoot, this.options = options;
        this.initialProjectConfig = (0, _config().getConfig)(projectRoot);
        this.platformBundlers = (0, _platformBundlers.getPlatformBundlers)(projectRoot, this.initialProjectConfig.exp);
    }
    /** Exposed for testing. */ async _resolveProjectSettingsAsync({ platform, hostname, protocol }) {
        var _projectConfig_exp_experiments;
        // Read the config
        const projectConfig = (0, _config().getConfig)(this.projectRoot);
        // Read from headers
        const mainModuleName = this.resolveMainModuleName({
            pkg: projectConfig.pkg,
            platform
        });
        const isHermesEnabled = (0, _exportHermes.isEnableHermesManaged)(projectConfig.exp, platform);
        // Create the manifest and set fields within it
        const expoGoConfig = this.getExpoGoConfig({
            mainModuleName,
            hostname
        });
        const hostUri = this.options.constructUrl({
            scheme: '',
            hostname
        });
        const bundleUrl = this._getBundleUrl({
            platform,
            mainModuleName,
            hostname,
            engine: isHermesEnabled ? 'hermes' : undefined,
            baseUrl: (0, _metroOptions.getBaseUrlFromExpoConfig)(projectConfig.exp),
            asyncRoutes: (0, _metroOptions.getAsyncRoutesFromExpoConfig)(projectConfig.exp, this.options.mode ?? 'development', platform),
            routerRoot: (0, _router.getRouterDirectoryModuleIdWithManifest)(this.projectRoot, projectConfig.exp),
            protocol,
            reactCompiler: !!((_projectConfig_exp_experiments = projectConfig.exp.experiments) == null ? void 0 : _projectConfig_exp_experiments.reactCompiler)
        });
        // Resolve all assets and set them on the manifest as URLs
        await this.mutateManifestWithAssetsAsync(projectConfig.exp, bundleUrl);
        return {
            expoGoConfig,
            hostUri,
            bundleUrl,
            exp: projectConfig.exp
        };
    }
    /** Get the main entry module ID (file) relative to the project root. */ resolveMainModuleName(props) {
        let entryPoint = getEntryWithServerRoot(this.projectRoot, props);
        debug(`Resolved entry point: ${entryPoint} (project root: ${this.projectRoot})`);
        // NOTE(Bacon): Webpack is currently hardcoded to index.bundle on native
        // in the future (TODO) we should move this logic into a Webpack plugin and use
        // a generated file name like we do on web.
        // const server = getDefaultDevServer();
        // // TODO: Move this into BundlerDevServer and read this info from self.
        // const isNativeWebpack = server instanceof WebpackBundlerDevServer && server.isTargetingNative();
        if (this.options.isNativeWebpack) {
            entryPoint = 'index.js';
        }
        return (0, _url1.stripExtension)(entryPoint, 'js');
    }
    /** Store device IDs that were sent in the request headers. */ async saveDevicesAsync(req) {
        var _req_headers;
        const deviceIds = (_req_headers = req.headers) == null ? void 0 : _req_headers['expo-dev-client-id'];
        if (deviceIds) {
            await _devices.saveDevicesAsync(this.projectRoot, deviceIds).catch((e)=>_log.exception(e));
        }
    }
    /** Create the bundle URL (points to the single JS entry file). Exposed for testing. */ _getBundleUrl({ platform, mainModuleName, hostname, engine, baseUrl, isExporting, asyncRoutes, routerRoot, protocol, reactCompiler }) {
        const path = (0, _metroOptions.createBundleUrlPath)({
            mode: this.options.mode ?? 'development',
            minify: this.options.minify,
            platform,
            mainModuleName,
            lazy: !_env.env.EXPO_NO_METRO_LAZY,
            engine,
            bytecode: engine === 'hermes',
            baseUrl,
            isExporting: !!isExporting,
            asyncRoutes,
            routerRoot,
            reactCompiler
        });
        return this.options.constructUrl({
            scheme: protocol ?? 'http',
            // hostType: this.options.location.hostType,
            hostname
        }) + path;
    }
    getExpoGoConfig({ mainModuleName, hostname }) {
        return {
            // localhost:8081
            debuggerHost: this.options.constructUrl({
                scheme: '',
                hostname
            }),
            // Required for Expo Go to function.
            developer: {
                tool: DEVELOPER_TOOL,
                projectRoot: this.projectRoot
            },
            packagerOpts: {
                // Required for dev client.
                dev: this.options.mode !== 'production'
            },
            // Indicates the name of the main bundle.
            mainModuleName
        };
    }
    /** Resolve all assets and set them on the manifest as URLs */ async mutateManifestWithAssetsAsync(manifest, bundleUrl) {
        await (0, _resolveAssets.resolveManifestAssets)(this.projectRoot, {
            manifest,
            resolver: async (path)=>{
                if (this.options.isNativeWebpack) {
                    // When using our custom dev server, just do assets normally
                    // without the `assets/` subpath redirect.
                    return (0, _url().resolve)(bundleUrl.match(/^https?:\/\/.*?\//)[0], path);
                }
                return bundleUrl.match(/^https?:\/\/.*?\//)[0] + 'assets/' + path;
            }
        });
        // The server normally inserts this but if we're offline we'll do it here
        await (0, _resolveAssets.resolveGoogleServicesFile)(this.projectRoot, manifest);
    }
    getWebBundleUrl() {
        const platform = 'web';
        // Read from headers
        const mainModuleName = this.resolveMainModuleName({
            pkg: this.initialProjectConfig.pkg,
            platform
        });
        return (0, _metroOptions.createBundleUrlPathFromExpoConfig)(this.projectRoot, this.initialProjectConfig.exp, {
            platform,
            mainModuleName,
            minify: this.options.minify,
            lazy: !_env.env.EXPO_NO_METRO_LAZY,
            mode: this.options.mode ?? 'development',
            // Hermes doesn't support more modern JS features than most, if not all, modern browser.
            engine: 'hermes',
            isExporting: false,
            bytecode: false
        });
    }
    /**
   * Web platforms should create an index.html response using the same script resolution as native.
   *
   * Instead of adding a `bundleUrl` to a `manifest.json` (native) we'll add a `<script src="">`
   * to an `index.html`, this enables the web platform to load JavaScript from the server.
   */ async handleWebRequestAsync(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.end(await this.getSingleHtmlTemplateAsync());
    }
    getSingleHtmlTemplateAsync() {
        // Read from headers
        const bundleUrl = this.getWebBundleUrl();
        return (0, _webTemplate.createTemplateHtmlFromExpoConfigAsync)(this.projectRoot, {
            exp: this.initialProjectConfig.exp,
            scripts: [
                bundleUrl
            ]
        });
    }
    /** Exposed for testing. */ async checkBrowserRequestAsync(req, res, next) {
        var _this_initialProjectConfig_exp_platforms;
        if (this.platformBundlers.web === 'metro' && ((_this_initialProjectConfig_exp_platforms = this.initialProjectConfig.exp.platforms) == null ? void 0 : _this_initialProjectConfig_exp_platforms.includes('web'))) {
            // NOTE(EvanBacon): This effectively disables the safety check we do on custom runtimes to ensure
            // the `expo-platform` header is included. When `web.bundler=web`, if the user has non-standard Expo
            // code loading then they'll get a web bundle without a clear assertion of platform support.
            const platform = (0, _resolvePlatform.parsePlatformHeader)(req);
            // On web, serve the public folder
            if (!platform || platform === 'web') {
                var _this_initialProjectConfig_exp_web;
                if ([
                    'static',
                    'server'
                ].includes(((_this_initialProjectConfig_exp_web = this.initialProjectConfig.exp.web) == null ? void 0 : _this_initialProjectConfig_exp_web.output) ?? '')) {
                    // Skip the spa-styled index.html when static generation is enabled.
                    next();
                    return true;
                } else {
                    await this.handleWebRequestAsync(req, res);
                    return true;
                }
            }
        }
        return false;
    }
    async handleRequestAsync(req, res, next) {
        // First check for standard JavaScript runtimes (aka legacy browsers like Chrome).
        if (await this.checkBrowserRequestAsync(req, res, next)) {
            return;
        }
        // Save device IDs for dev client.
        await this.saveDevicesAsync(req);
        // Read from headers
        const options = this.getParsedHeaders(req);
        const { body, headers } = await this._getManifestResponseAsync(options);
        for (const [headerName, headerValue] of headers){
            res.setHeader(headerName, headerValue);
        }
        res.end(body);
    }
}

//# sourceMappingURL=ManifestMiddleware.js.map