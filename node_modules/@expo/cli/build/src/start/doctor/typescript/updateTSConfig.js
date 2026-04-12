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
    baseTSConfigName: function() {
        return baseTSConfigName;
    },
    updateTSConfigAsync: function() {
        return updateTSConfigAsync;
    }
});
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
        return data;
    };
    return data;
}
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
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
const baseTSConfigName = 'expo/tsconfig.base';
async function updateTSConfigAsync({ tsConfigPath }) {
    const shouldGenerate = !_fs().default.existsSync(tsConfigPath) || _fs().default.statSync(tsConfigPath).size === 0;
    if (shouldGenerate) {
        await _jsonfile().default.writeAsync(tsConfigPath, {
            compilerOptions: {}
        });
    }
    const projectTSConfig = _jsonfile().default.read(tsConfigPath, {
        // Some tsconfig.json files have a generated comment in the file.
        json5: true
    });
    projectTSConfig.compilerOptions ??= {};
    const modifications = [];
    // If the extends field isn't defined, set it to the expo default
    if (!projectTSConfig.extends) {
        // if (projectTSConfig.extends !== baseTSConfigName) {
        projectTSConfig.extends = baseTSConfigName;
        modifications.push([
            'extends',
            baseTSConfigName
        ]);
    }
    // If no changes, then quietly bail out
    if (!modifications.length) {
        return;
    }
    // Write changes and log out a summary of what changed
    await _jsonfile().default.writeAsync(tsConfigPath, projectTSConfig);
    // If no changes, then quietly bail out
    if (modifications.length === 0) {
        return;
    }
    _log.log();
    if (shouldGenerate) {
        _log.log((0, _chalk().default)`{bold TypeScript}: A {cyan tsconfig.json} has been auto-generated`);
    } else {
        _log.log((0, _chalk().default)`{bold TypeScript}: The {cyan tsconfig.json} has been updated {dim (Use EXPO_NO_TYPESCRIPT_SETUP to skip)}`);
        logModifications(modifications);
    }
    _log.log();
}
function logModifications(modifications) {
    _log.log();
    _log.log((0, _chalk().default)`\u203A {bold Required} modifications made to the {cyan tsconfig.json}:`);
    _log.log();
    // Sort the items based on key name length
    printTable(modifications.sort((a, b)=>a[0].length - b[0].length));
    _log.log();
}
function printTable(items) {
    const tableFormat = (name, msg)=>`  ${_chalk().default.bold`${name}`} is now ${_chalk().default.cyan(msg)}`;
    for (const [key, value] of items){
        _log.log(tableFormat(key, value));
    }
}

//# sourceMappingURL=updateTSConfig.js.map