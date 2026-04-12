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
    ExpoMiddleware: function() {
        return ExpoMiddleware;
    },
    disableResponseCache: function() {
        return disableResponseCache;
    }
});
function _url() {
    const data = require("url");
    _url = function() {
        return data;
    };
    return data;
}
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
class ExpoMiddleware {
    constructor(projectRoot, supportedPaths){
        this.projectRoot = projectRoot;
        this.supportedPaths = supportedPaths;
    }
    /**
   * Returns true when the middleware should handle the incoming server request.
   * Exposed for testing.
   */ shouldHandleRequest(req) {
        if (!req.url) {
            return false;
        }
        const parsed = (0, _url().parse)(req.url);
        // Strip the query params
        if (!parsed.pathname) {
            return false;
        }
        return this.supportedPaths.includes(parsed.pathname);
    }
    /** Create a server middleware handler. */ getHandler() {
        const internalMiddleware = async (req, res, next)=>{
            try {
                return await this.handleRequestAsync(req, res, next);
            } catch (error) {
                _log.exception(error);
                // 5xx = Server Error HTTP code
                res.statusCode = 500;
                if (typeof error === 'object' && error !== null) {
                    res.end(JSON.stringify({
                        error: error.toString()
                    }));
                } else {
                    res.end(`Unexpected error: ${error}`);
                }
            }
        };
        const middleware = async (req, res, next)=>{
            if (!this.shouldHandleRequest(req)) {
                return next();
            }
            return internalMiddleware(req, res, next);
        };
        middleware.internal = internalMiddleware;
        return middleware;
    }
}
function disableResponseCache(res) {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
    return res;
}

//# sourceMappingURL=ExpoMiddleware.js.map