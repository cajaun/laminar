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
    InterstitialPageMiddleware: function() {
        return InterstitialPageMiddleware;
    },
    LoadingEndpoint: function() {
        return LoadingEndpoint;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _Updates() {
    const data = require("@expo/config-plugins/build/utils/Updates");
    _Updates = function() {
        return data;
    };
    return data;
}
function _promises() {
    const data = require("fs/promises");
    _promises = function() {
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
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _ExpoMiddleware = require("./ExpoMiddleware");
const _resolvePlatform = require("./resolvePlatform");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:server:middleware:interstitialPage');
const LoadingEndpoint = '/_expo/loading';
class InterstitialPageMiddleware extends _ExpoMiddleware.ExpoMiddleware {
    constructor(projectRoot, options = {
        scheme: null
    }){
        super(projectRoot, [
            LoadingEndpoint
        ]), this.options = options;
    }
    /** Get the template HTML page and inject values. */ async _getPageAsync({ appName, projectVersion }) {
        const templatePath = // Production: This will resolve when installed in the project.
        _resolvefrom().default.silent(this.projectRoot, 'expo/static/loading-page/index.html') ?? // Development: This will resolve when testing locally.
        _path().default.resolve(__dirname, '../../../../../static/loading-page/index.html');
        let content = (await (0, _promises().readFile)(templatePath)).toString('utf-8');
        content = content.replace(/{{\s*AppName\s*}}/, appName);
        content = content.replace(/{{\s*Path\s*}}/, this.projectRoot);
        content = content.replace(/{{\s*Scheme\s*}}/, this.options.scheme ?? 'Unknown');
        content = content.replace(/{{\s*ProjectVersionType\s*}}/, `${projectVersion.type === 'sdk' ? 'SDK' : 'Runtime'} version`);
        content = content.replace(/{{\s*ProjectVersion\s*}}/, projectVersion.version ?? 'Undetected');
        return content;
    }
    /** Get settings for the page from the project config. */ async _getProjectOptionsAsync(platform) {
        (0, _resolvePlatform.assertRuntimePlatform)(platform);
        const { exp } = (0, _config().getConfig)(this.projectRoot);
        const { appName } = (0, _config().getNameFromConfig)(exp);
        const runtimeVersion = await (0, _Updates().getRuntimeVersionNullableAsync)(this.projectRoot, exp, platform);
        const sdkVersion = exp.sdkVersion ?? null;
        return {
            appName: appName ?? 'App',
            projectVersion: sdkVersion && !runtimeVersion ? {
                type: 'sdk',
                version: sdkVersion
            } : {
                type: 'runtime',
                version: runtimeVersion
            }
        };
    }
    async handleRequestAsync(req, res) {
        res = (0, _ExpoMiddleware.disableResponseCache)(res);
        res.setHeader('Content-Type', 'text/html');
        const platform = (0, _resolvePlatform.parsePlatformHeader)(req) ?? (0, _resolvePlatform.resolvePlatformFromUserAgentHeader)(req);
        (0, _resolvePlatform.assertMissingRuntimePlatform)(platform);
        (0, _resolvePlatform.assertRuntimePlatform)(platform);
        const { appName, projectVersion } = await this._getProjectOptionsAsync(platform);
        debug(`Create loading page. (platform: ${platform}, appName: ${appName}, projectVersion: ${projectVersion.version}, type: ${projectVersion.type})`);
        const content = await this._getPageAsync({
            appName,
            projectVersion
        });
        res.end(content);
    }
}

//# sourceMappingURL=InterstitialPageMiddleware.js.map