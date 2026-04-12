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
    GraphqlError: function() {
        return _core().CombinedError;
    },
    graphqlClient: function() {
        return graphqlClient;
    },
    withErrorHandlingAsync: function() {
        return withErrorHandlingAsync;
    }
});
function _core() {
    const data = require("@urql/core");
    _core = function() {
        return data;
    };
    return data;
}
function _exchangeretry() {
    const data = require("@urql/exchange-retry");
    _exchangeretry = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _fetch = require("../../utils/fetch");
const _endpoint = require("../endpoint");
const _wrapFetchWithOffline = require("../rest/wrapFetchWithOffline");
const _wrapFetchWithProxy = require("../rest/wrapFetchWithProxy");
const _wrapFetchWithUserAgent = require("../rest/wrapFetchWithUserAgent");
const _UserSettings = require("../user/UserSettings");
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
const graphqlClient = (0, _core().createClient)({
    url: (0, _endpoint.getExpoApiBaseUrl)() + '/graphql',
    exchanges: [
        _core().cacheExchange,
        (0, _exchangeretry().retryExchange)({
            maxDelayMs: 4000,
            retryIf: (err)=>!!(err && (err.networkError || err.graphQLErrors.some((e)=>{
                    var _e_extensions;
                    return e == null ? void 0 : (_e_extensions = e.extensions) == null ? void 0 : _e_extensions.isTransient;
                })))
        }),
        _core().fetchExchange
    ],
    // @ts-ignore Type 'typeof fetch' is not assignable to type '(input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>'.
    fetch: (0, _wrapFetchWithOffline.wrapFetchWithOffline)((0, _wrapFetchWithProxy.wrapFetchWithProxy)((0, _wrapFetchWithUserAgent.wrapFetchWithUserAgent)(_fetch.fetch))),
    fetchOptions: ()=>{
        var _getSession;
        const token = (0, _UserSettings.getAccessToken)();
        if (token) {
            return {
                headers: {
                    authorization: `Bearer ${token}`
                }
            };
        }
        const sessionSecret = (_getSession = (0, _UserSettings.getSession)()) == null ? void 0 : _getSession.sessionSecret;
        if (sessionSecret) {
            return {
                headers: {
                    'expo-session': sessionSecret
                }
            };
        }
        return {};
    }
});
async function withErrorHandlingAsync(promise) {
    const { data, error } = await promise;
    if (error) {
        if (error.graphQLErrors.some((e)=>{
            var _e_extensions;
            return e == null ? void 0 : (_e_extensions = e.extensions) == null ? void 0 : _e_extensions.isTransient;
        })) {
            _log.error(`We've encountered a transient error, please try again shortly.`);
        }
        throw error;
    }
    // Check for a malformed response. This only checks the root query's existence. It doesn't affect
    // returning responses with an empty result set.
    if (!data) {
        throw new Error('Returned query result data is null!');
    }
    return data;
}

//# sourceMappingURL=client.js.map