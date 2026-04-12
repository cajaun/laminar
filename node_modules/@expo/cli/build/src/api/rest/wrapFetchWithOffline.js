"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "wrapFetchWithOffline", {
    enumerable: true,
    get: function() {
        return wrapFetchWithOffline;
    }
});
const _env = require("../../utils/env");
const debug = require('debug')('expo:api:fetch:offline');
function wrapFetchWithOffline(fetchFunction) {
    // NOTE(EvanBacon): DO NOT RETURN AN ASYNC WRAPPER. THIS BREAKS LOADING INDICATORS.
    return function fetchWithOffline(url, options = {}) {
        if (_env.env.EXPO_OFFLINE) {
            debug('Skipping network request: ' + url);
            const abortController = new AbortController();
            abortController.abort();
            options.signal = abortController.signal;
        }
        return fetchFunction(url, options);
    };
}

//# sourceMappingURL=wrapFetchWithOffline.js.map