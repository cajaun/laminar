"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveRuntimeVersionWithExpoUpdatesAsync", {
    enumerable: true,
    get: function() {
        return resolveRuntimeVersionWithExpoUpdatesAsync;
    }
});
const _env = require("../../../utils/env");
const _expoUpdatesCli = require("../../../utils/expoUpdatesCli");
const debug = require('debug')('expo:start:server:middleware:resolveRuntimeVersion');
async function resolveRuntimeVersionWithExpoUpdatesAsync({ projectRoot, platform }) {
    try {
        debug('Using expo-updates runtimeversion:resolve CLI for runtime version resolution');
        const extraArgs = _env.env.EXPO_DEBUG ? [
            '--debug'
        ] : [];
        const resolvedRuntimeVersionJSONResult = await (0, _expoUpdatesCli.expoUpdatesCommandAsync)(projectRoot, [
            'runtimeversion:resolve',
            '--platform',
            platform,
            ...extraArgs
        ]);
        const runtimeVersionResult = JSON.parse(resolvedRuntimeVersionJSONResult);
        debug('runtimeversion:resolve output:');
        debug(resolvedRuntimeVersionJSONResult);
        return runtimeVersionResult.runtimeVersion ?? null;
    } catch (e) {
        if (e instanceof _expoUpdatesCli.ExpoUpdatesCLIModuleNotFoundError) {
            return null;
        }
        throw e;
    }
}

//# sourceMappingURL=resolveRuntimeVersionWithExpoUpdatesAsync.js.map