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
    getRequestBodyCacheData: function() {
        return getRequestBodyCacheData;
    },
    getRequestCacheKey: function() {
        return getRequestCacheKey;
    },
    getRequestInfoCacheData: function() {
        return getRequestInfoCacheData;
    },
    getResponseInfo: function() {
        return getResponseInfo;
    }
});
function _crypto() {
    const data = /*#__PURE__*/ _interop_require_default(require("crypto"));
    _crypto = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = require("fs");
    _fs = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const GLOBAL_CACHE_VERSION = 4;
function getResponseInfo(response) {
    return {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
    };
}
function getRequestCacheKey(info, init) {
    const infoKeyData = getRequestInfoCacheData(info);
    const initKeyData = {
        body: (init == null ? void 0 : init.body) ? getRequestBodyCacheData(init.body) : undefined
    };
    return _crypto().default.createHash('md5').update(JSON.stringify([
        infoKeyData,
        initKeyData,
        GLOBAL_CACHE_VERSION
    ])).digest('hex');
}
function getRequestInfoCacheData(info) {
    if (typeof info === 'string') {
        return {
            url: info
        };
    }
    if (info instanceof URL) {
        return {
            url: info.toString()
        };
    }
    if (info instanceof Request) {
        return {
            // cache: req.cache,
            credentials: info.credentials.toString(),
            destination: info.destination.toString(),
            headers: Object.fromEntries(info.headers.entries()),
            integrity: info.integrity,
            method: info.method,
            redirect: info.redirect,
            referrer: info.referrer,
            referrerPolicy: info.referrerPolicy,
            url: info.url.toString()
        };
    }
    throw new Error('Unsupported request info type for caching: ' + typeof info);
}
function getRequestBodyCacheData(body) {
    if (!body) {
        return body;
    }
    if (typeof body === 'string') {
        return body;
    }
    if (body instanceof URLSearchParams) {
        return body.toString();
    }
    // Supported for legacy purposes because node-fetch uses fs.readStream
    if (body instanceof _fs().ReadStream) {
        return body.path;
    }
    if (body.toString && body.toString() === '[object FormData]') {
        return new URLSearchParams(body).toString();
    }
    if (body instanceof Buffer) {
        return body.toString();
    }
    throw new Error(`Unsupported request body type for caching: ${typeof body}`);
}

//# sourceMappingURL=ResponseCache.js.map