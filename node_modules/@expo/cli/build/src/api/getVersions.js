"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getVersionsAsync", {
    enumerable: true,
    get: function() {
        return getVersionsAsync;
    }
});
const _client = require("./rest/client");
const _errors = require("../utils/errors");
async function getVersionsAsync({ skipCache } = {}) {
    // Reconstruct the cached fetch since caching could be disabled.
    const fetchAsync = (0, _client.createCachedFetch)({
        skipCache,
        cacheDirectory: 'versions-cache',
        // We'll use a 5 minute cache to ensure we stay relatively up to date.
        ttl: 1000 * 60 * 5
    });
    const results = await fetchAsync('versions/latest');
    if (!results.ok) {
        throw new _errors.CommandError('API', `Unexpected response when fetching version info from Expo servers: ${results.statusText}.`);
    }
    const json = await results.json();
    return (0, _client.getResponseDataOrThrow)(json);
}

//# sourceMappingURL=getVersions.js.map