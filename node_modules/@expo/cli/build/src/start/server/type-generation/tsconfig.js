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
    forceRemovalTSConfig: function() {
        return forceRemovalTSConfig;
    },
    forceUpdateTSConfig: function() {
        return forceUpdateTSConfig;
    },
    getTSConfigRemoveUpdates: function() {
        return getTSConfigRemoveUpdates;
    },
    getTSConfigUpdates: function() {
        return getTSConfigUpdates;
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _log = require("../../../log");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function forceUpdateTSConfig(projectRoot) {
    // This runs after the TypeScript prerequisite, so we know the tsconfig.json exists
    const tsConfigPath = _path().default.join(projectRoot, 'tsconfig.json');
    const { tsConfig, updates } = getTSConfigUpdates(_jsonfile().default.read(tsConfigPath, {
        json5: true
    }));
    await writeUpdates(tsConfigPath, tsConfig, updates);
}
function getTSConfigUpdates(tsConfig) {
    const updates = new Set();
    if (!tsConfig.include) {
        tsConfig.include = [
            '**/*.ts',
            '**/*.tsx',
            '.expo/types/**/*.ts',
            'expo-env.d.ts'
        ];
        updates.add('include');
    } else if (Array.isArray(tsConfig.include)) {
        if (!tsConfig.include.includes('.expo/types/**/*.ts')) {
            tsConfig.include = [
                ...tsConfig.include,
                '.expo/types/**/*.ts'
            ];
            updates.add('include');
        }
        if (!tsConfig.include.includes('expo-env.d.ts')) {
            tsConfig.include = [
                ...tsConfig.include,
                'expo-env.d.ts'
            ];
            updates.add('include');
        }
    }
    return {
        tsConfig,
        updates
    };
}
async function forceRemovalTSConfig(projectRoot) {
    // This runs after the TypeScript prerequisite, so we know the tsconfig.json exists
    const tsConfigPath = _path().default.join(projectRoot, 'tsconfig.json');
    const { tsConfig, updates } = getTSConfigRemoveUpdates(_jsonfile().default.read(tsConfigPath, {
        json5: true
    }));
    await writeUpdates(tsConfigPath, tsConfig, updates);
}
function getTSConfigRemoveUpdates(tsConfig) {
    const updates = new Set();
    if (Array.isArray(tsConfig.include)) {
        const filtered = tsConfig.include.filter((i)=>i !== 'expo-env.d.ts' && i !== '.expo/types/**/*.ts');
        if (filtered.length !== tsConfig.include.length) {
            updates.add('include');
        }
        tsConfig.include = filtered;
    }
    return {
        tsConfig,
        updates
    };
}
async function writeUpdates(tsConfigPath, tsConfig, updates) {
    if (updates.size) {
        await _jsonfile().default.writeAsync(tsConfigPath, tsConfig);
        for (const update of updates){
            _log.Log.log((0, _chalk().default)`{bold TypeScript}: The {cyan tsconfig.json#${update}} property has been updated`);
        }
    }
}

//# sourceMappingURL=tsconfig.js.map