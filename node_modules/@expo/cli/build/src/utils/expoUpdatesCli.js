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
    ExpoUpdatesCLICommandFailedError: function() {
        return ExpoUpdatesCLICommandFailedError;
    },
    ExpoUpdatesCLIInvalidCommandError: function() {
        return ExpoUpdatesCLIInvalidCommandError;
    },
    ExpoUpdatesCLIModuleNotFoundError: function() {
        return ExpoUpdatesCLIModuleNotFoundError;
    },
    expoUpdatesCommandAsync: function() {
        return expoUpdatesCommandAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
class ExpoUpdatesCLIModuleNotFoundError extends Error {
}
class ExpoUpdatesCLIInvalidCommandError extends Error {
}
class ExpoUpdatesCLICommandFailedError extends Error {
}
async function expoUpdatesCommandAsync(projectDir, args) {
    let expoUpdatesCli;
    try {
        expoUpdatesCli = (0, _resolvefrom().silent)(projectDir, 'expo-updates/bin/cli') ?? (0, _resolvefrom().default)(projectDir, 'expo-updates/bin/cli.js');
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new ExpoUpdatesCLIModuleNotFoundError(`The \`expo-updates\` package was not found. `);
        }
        throw e;
    }
    try {
        return (await (0, _spawnasync().default)(expoUpdatesCli, args, {
            stdio: 'pipe',
            env: {
                ...process.env
            }
        })).stdout;
    } catch (e) {
        if (e.stderr && typeof e.stderr === 'string') {
            if (e.stderr.includes('Invalid command')) {
                throw new ExpoUpdatesCLIInvalidCommandError(`The command specified by ${args} was not valid in the \`expo-updates\` CLI.`);
            } else {
                throw new ExpoUpdatesCLICommandFailedError(e.stderr);
            }
        }
        throw e;
    }
}

//# sourceMappingURL=expoUpdatesCli.js.map