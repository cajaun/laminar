"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RuntimeRedirectMiddleware", {
    enumerable: true,
    get: function() {
        return RuntimeRedirectMiddleware;
    }
});
function _url() {
    const data = require("url");
    _url = function() {
        return data;
    };
    return data;
}
const _ExpoMiddleware = require("./ExpoMiddleware");
const _resolvePlatform = require("./resolvePlatform");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
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
const debug = require('debug')('expo:start:server:middleware:runtimeRedirect');
class RuntimeRedirectMiddleware extends _ExpoMiddleware.ExpoMiddleware {
    constructor(projectRoot, options){
        super(projectRoot, [
            '/_expo/link'
        ]), this.projectRoot = projectRoot, this.options = options;
    }
    async handleRequestAsync(req, res) {
        const { query } = (0, _url().parse)(req.url, true);
        const isDevClient = query['choice'] === 'expo-dev-client';
        const platform = (0, _resolvePlatform.parsePlatformHeader)(req) ?? (0, _resolvePlatform.resolvePlatformFromUserAgentHeader)(req);
        (0, _resolvePlatform.assertMissingRuntimePlatform)(platform);
        (0, _resolvePlatform.assertRuntimePlatform)(platform);
        const runtime = isDevClient ? 'custom' : 'expo';
        debug(`props:`, {
            platform,
            runtime
        });
        this.options.onDeepLink == null ? void 0 : this.options.onDeepLink.call(this.options, {
            runtime,
            platform
        });
        const redirect = this.options.getLocation({
            runtime
        });
        if (!redirect) {
            _log.warn(`[redirect middleware]: Unable to determine redirect location for runtime '${runtime}' and platform '${platform}'`);
            res.statusCode = 404;
            res.end();
            return;
        }
        debug('Redirect ->', redirect);
        res.setHeader('Location', redirect);
        // Disable caching
        (0, _ExpoMiddleware.disableResponseCache)(res);
        // 'Temporary Redirect'
        res.statusCode = 307;
        res.end();
    }
}

//# sourceMappingURL=RuntimeRedirectMiddleware.js.map