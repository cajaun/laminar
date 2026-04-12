"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getNativeModuleVersionsAsync", {
    enumerable: true,
    get: function() {
        return getNativeModuleVersionsAsync;
    }
});
const _client = require("./rest/client");
const _errors = require("../utils/errors");
async function getNativeModuleVersionsAsync(sdkVersion) {
    const fetchAsync = (0, _client.createCachedFetch)({
        cacheDirectory: 'native-modules-cache',
        // 1 minute cache
        ttl: 1000 * 60
    });
    const response = await fetchAsync(`sdks/${sdkVersion}/native-modules`);
    if (!response.ok) {
        throw new _errors.CommandError('API', `Unexpected response when fetching version info from Expo servers: ${response.statusText}.`);
    }
    const json = await response.json();
    const data = (0, _client.getResponseDataOrThrow)(json);
    if (!data.length) {
        throw new _errors.CommandError('VERSIONS', 'The bundled native module list from the Expo API is empty');
    }
    return fromBundledNativeModuleList(data);
}
function fromBundledNativeModuleList(list) {
    return list.reduce((acc, i)=>{
        acc[i.npmPackage] = i.versionRange;
        return acc;
    }, {});
}

//# sourceMappingURL=getNativeModuleVersions.js.map