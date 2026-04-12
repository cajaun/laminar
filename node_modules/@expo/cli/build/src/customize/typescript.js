"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "typescript", {
    enumerable: true,
    get: function() {
        return typescript;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
const _log = require("../log");
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
async function typescript(projectRoot) {
    const { TypeScriptProjectPrerequisite } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../start/doctor/typescript/TypeScriptProjectPrerequisite.js")));
    const { MetroBundlerDevServer } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../start/server/metro/MetroBundlerDevServer.js")));
    const { getPlatformBundlers } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../start/server/platformBundlers.js")));
    try {
        await new TypeScriptProjectPrerequisite(projectRoot).bootstrapAsync();
    } catch (error) {
        // Ensure the process doesn't fail if the TypeScript check fails.
        // This could happen during the install.
        _log.Log.log();
        _log.Log.exception(error);
        return;
    }
    const { exp } = (0, _config().getConfig)(projectRoot, {
        skipSDKVersionRequirement: true
    });
    await new MetroBundlerDevServer(projectRoot, getPlatformBundlers(projectRoot, exp), {
        isDevClient: true
    }).startTypeScriptServices();
}

//# sourceMappingURL=typescript.js.map