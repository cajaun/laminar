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
    ApiV2Error: function() {
        return ApiV2Error;
    },
    UnexpectedServerData: function() {
        return UnexpectedServerData;
    },
    UnexpectedServerError: function() {
        return UnexpectedServerError;
    },
    createCachedFetch: function() {
        return createCachedFetch;
    },
    fetchAsync: function() {
        return fetchAsync;
    },
    getResponseDataOrThrow: function() {
        return getResponseDataOrThrow;
    },
    wrapFetchWithCredentials: function() {
        return wrapFetchWithCredentials;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _wrapFetchWithCache = require("./cache/wrapFetchWithCache");
const _wrapFetchWithBaseUrl = require("./wrapFetchWithBaseUrl");
const _wrapFetchWithOffline = require("./wrapFetchWithOffline");
const _wrapFetchWithProgress = require("./wrapFetchWithProgress");
const _wrapFetchWithProxy = require("./wrapFetchWithProxy");
const _wrapFetchWithUserAgent = require("./wrapFetchWithUserAgent");
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
const _fetch = require("../../utils/fetch");
const _endpoint = require("../endpoint");
const _settings = require("../settings");
const _UserSettings = require("../user/UserSettings");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class ApiV2Error extends Error {
    constructor(response){
        super(response.message), this.name = 'ApiV2Error';
        this.code = response.code;
        this.expoApiV2ErrorCode = response.code;
        this.expoApiV2ErrorDetails = response.details;
        this.expoApiV2ErrorServerStack = response.stack;
        this.expoApiV2ErrorMetadata = response.metadata;
        this.expoApiV2RequestId = response.requestId;
    }
    toString() {
        return `${super.toString()}${_env.env.EXPO_DEBUG && this.expoApiV2RequestId ? ` (Request Id: ${this.expoApiV2RequestId})` : ''}`;
    }
}
class UnexpectedServerError extends Error {
    constructor(...args){
        super(...args), this.name = 'UnexpectedServerError';
    }
}
class UnexpectedServerData extends Error {
    constructor(...args){
        super(...args), this.name = 'UnexpectedServerData';
    }
}
function getResponseDataOrThrow(json) {
    if (!!json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }
    throw new UnexpectedServerData(!!json && typeof json === 'object' ? JSON.stringify(json) : 'Unknown data received from server.');
}
function wrapFetchWithCredentials(fetchFunction) {
    return async function fetchWithCredentials(url, options = {}) {
        if (Array.isArray(options.headers)) {
            throw new Error('request headers must be in object form');
        }
        const resolvedHeaders = options.headers ?? {};
        const token = (0, _UserSettings.getAccessToken)();
        if (token) {
            resolvedHeaders.authorization = `Bearer ${token}`;
        } else {
            var _getSession;
            const sessionSecret = (_getSession = (0, _UserSettings.getSession)()) == null ? void 0 : _getSession.sessionSecret;
            if (sessionSecret) {
                resolvedHeaders['expo-session'] = sessionSecret;
            }
        }
        try {
            const response = await fetchFunction(url, {
                ...options,
                headers: resolvedHeaders
            });
            // Handle expected API errors (4xx)
            if (response.status >= 400 && response.status < 500) {
                const body = await response.text();
                try {
                    var _data_errors;
                    const data = JSON.parse(body);
                    if (data == null ? void 0 : (_data_errors = data.errors) == null ? void 0 : _data_errors.length) {
                        throw new ApiV2Error(data.errors[0]);
                    }
                } catch (error) {
                    // Server returned non-json response.
                    if (error.message.includes('in JSON at position')) {
                        throw new UnexpectedServerError(body);
                    }
                    throw error;
                }
            }
            return response;
        } catch (error) {
            // When running `expo start`, but wifi or internet has issues
            if (isNetworkError(error) || // node-fetch error handling
            'cause' in error && isNetworkError(error.cause) // undici error handling
            ) {
                (0, _settings.disableNetwork)();
                throw new _errors.CommandError('OFFLINE', 'Network connection is unreliable. Try again with the environment variable `EXPO_OFFLINE=1` to skip network requests.');
            }
            throw error;
        }
    };
}
/**
 * Determine if the provided error is related to a network issue.
 * When this returns true, offline mode should be enabled.
 *   - `ENOTFOUND` is thrown when the DNS lookup failed
 *   - `EAI_AGAIN` is thrown when DNS lookup failed due to a server-side error
 *   - `UND_ERR_CONNECT_TIMEOUT` is thrown after DNS is resolved, but server can't be reached
 *
 * @see https://nodejs.org/api/errors.html
 * @see https://github.com/nodejs/undici#network-address-family-autoselection
 */ function isNetworkError(error) {
    return 'code' in error && error.code && [
        'ENOTFOUND',
        'EAI_AGAIN',
        'UND_ERR_CONNECT_TIMEOUT'
    ].includes(error.code);
}
const fetchWithOffline = (0, _wrapFetchWithOffline.wrapFetchWithOffline)((0, _wrapFetchWithUserAgent.wrapFetchWithUserAgent)(_fetch.fetch));
const fetchWithBaseUrl = (0, _wrapFetchWithBaseUrl.wrapFetchWithBaseUrl)(fetchWithOffline, (0, _endpoint.getExpoApiBaseUrl)() + '/v2/');
const fetchWithProxy = (0, _wrapFetchWithProxy.wrapFetchWithProxy)(fetchWithBaseUrl);
const fetchWithCredentials = (0, _wrapFetchWithProgress.wrapFetchWithProgress)(wrapFetchWithCredentials(fetchWithProxy));
function createCachedFetch({ fetch = fetchWithCredentials, cacheDirectory, ttl, skipCache }) {
    // Disable all caching in EXPO_BETA.
    if (skipCache || _env.env.EXPO_BETA || _env.env.EXPO_NO_CACHE) {
        return fetch;
    }
    const { FileSystemResponseCache } = require('./cache/FileSystemResponseCache');
    return (0, _wrapFetchWithCache.wrapFetchWithCache)(fetch, new FileSystemResponseCache({
        cacheDirectory: _path().default.join((0, _UserSettings.getExpoHomeDirectory)(), cacheDirectory),
        ttl
    }));
}
const fetchAsync = (0, _wrapFetchWithProgress.wrapFetchWithProgress)(wrapFetchWithCredentials(fetchWithProxy));

//# sourceMappingURL=client.js.map