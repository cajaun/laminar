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
    loadTsConfigPathsAsync: function() {
        return loadTsConfigPathsAsync;
    },
    readTsconfigAsync: function() {
        return readTsconfigAsync;
    }
});
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
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
const _evaluateTsConfig = require("./evaluateTsConfig");
const _dir = require("../dir");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:utils:tsconfig:load');
async function loadTsConfigPathsAsync(dir) {
    const options = await readTsconfigAsync(dir) ?? await readJsconfigAsync(dir);
    if (options) {
        var _config_compilerOptions, _config_compilerOptions1;
        const [, config] = options;
        return {
            paths: (_config_compilerOptions = config.compilerOptions) == null ? void 0 : _config_compilerOptions.paths,
            baseUrl: ((_config_compilerOptions1 = config.compilerOptions) == null ? void 0 : _config_compilerOptions1.baseUrl) ? _path().default.resolve(dir, config.compilerOptions.baseUrl) : undefined
        };
    }
    return null;
}
async function readJsconfigAsync(projectRoot) {
    const configPath = _path().default.join(projectRoot, 'jsconfig.json');
    if (await (0, _dir.fileExistsAsync)(configPath)) {
        const config = await _jsonfile().default.readAsync(configPath, {
            json5: true
        });
        if (config) {
            return [
                configPath,
                config
            ];
        }
    }
    return null;
}
async function readTsconfigAsync(projectRoot) {
    const configPath = _path().default.join(projectRoot, 'tsconfig.json');
    if (await (0, _dir.fileExistsAsync)(configPath)) {
        // We need to fully evaluate the tsconfig to get the baseUrl and paths in case they were applied in `extends`.
        const ts = (0, _evaluateTsConfig.importTypeScriptFromProjectOptionally)(projectRoot);
        if (ts) {
            return [
                configPath,
                (0, _evaluateTsConfig.evaluateTsConfig)(ts, configPath)
            ];
        }
        debug(`typescript module not found in: ${projectRoot}`);
    }
    return null;
}

//# sourceMappingURL=loadTsConfigPaths.js.map