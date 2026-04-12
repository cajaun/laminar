"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "wrapFetchWithCache", {
    enumerable: true,
    get: function() {
        return wrapFetchWithCache;
    }
});
function _undici() {
    const data = require("undici");
    _undici = function() {
        return data;
    };
    return data;
}
const _ResponseCache = require("./ResponseCache");
const debug = require('debug')('expo:undici-cache');
function wrapFetchWithCache(fetch, cache) {
    return async function cachedFetch(url, init) {
        const cacheKey = (0, _ResponseCache.getRequestCacheKey)(url, init);
        const cachedResponse = await cache.get(cacheKey);
        if (cachedResponse) {
            return new (_undici()).Response(cachedResponse.body, cachedResponse.info);
        }
        await lock(cacheKey);
        try {
            // Retry loading from cache, in case it was stored during the lock
            let cachedResponse = await cache.get(cacheKey);
            if (cachedResponse) {
                return new (_undici()).Response(cachedResponse.body, cachedResponse.info);
            }
            // Execute the fetch request
            const response = await fetch(url, init);
            if (!response.ok || !response.body) {
                return response;
            }
            // Cache the response
            cachedResponse = await cache.set(cacheKey, {
                body: response.body,
                info: (0, _ResponseCache.getResponseInfo)(response)
            });
            // Warn through debug logs that caching failed
            if (!cachedResponse) {
                debug(`Failed to cache response for: ${url}`);
                await cache.remove(cacheKey);
                return response;
            }
            // Return the cached response
            return new (_undici()).Response(cachedResponse.body, cachedResponse.info);
        } finally{
            unlock(cacheKey);
        }
    };
}
const lockPromiseForKey = {};
const unlockFunctionForKey = {};
async function lock(key) {
    if (!lockPromiseForKey[key]) {
        lockPromiseForKey[key] = Promise.resolve();
    }
    const takeLockPromise = lockPromiseForKey[key];
    lockPromiseForKey[key] = takeLockPromise.then(()=>new Promise((fulfill)=>{
            unlockFunctionForKey[key] = fulfill;
        }));
    return takeLockPromise;
}
function unlock(key) {
    if (unlockFunctionForKey[key]) {
        unlockFunctionForKey[key]();
        delete unlockFunctionForKey[key];
    }
}

//# sourceMappingURL=wrapFetchWithCache.js.map