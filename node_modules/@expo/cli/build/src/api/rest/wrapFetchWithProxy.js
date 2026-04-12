"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "wrapFetchWithProxy", {
    enumerable: true,
    get: function() {
        return wrapFetchWithProxy;
    }
});
function _undici() {
    const data = require("undici");
    _undici = function() {
        return data;
    };
    return data;
}
const _env = require("../../utils/env");
const debug = require('debug')('expo:api:fetch:proxy');
function wrapFetchWithProxy(fetchFunction) {
    // NOTE(EvanBacon): DO NOT RETURN AN ASYNC WRAPPER. THIS BREAKS LOADING INDICATORS.
    return function fetchWithProxy(url, options = {}) {
        if (!options.dispatcher && _env.env.HTTP_PROXY) {
            debug('Using proxy:', _env.env.HTTP_PROXY);
            options.dispatcher = new (_undici()).EnvHttpProxyAgent();
        }
        return fetchFunction(url, options);
    };
}

//# sourceMappingURL=wrapFetchWithProxy.js.map