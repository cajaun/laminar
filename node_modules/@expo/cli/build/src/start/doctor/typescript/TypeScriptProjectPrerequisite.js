"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TypeScriptProjectPrerequisite", {
    enumerable: true,
    get: function() {
        return TypeScriptProjectPrerequisite;
    }
});
function _promises() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
    _promises = function() {
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
const _updateTSConfig = require("./updateTSConfig");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _dir = require("../../../utils/dir");
const _env = require("../../../utils/env");
const _fn = require("../../../utils/fn");
const _glob = require("../../../utils/glob");
const _Prerequisite = require("../Prerequisite");
const _ensureDependenciesAsync = require("../dependencies/ensureDependenciesAsync");
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
const debug = require('debug')('expo:doctor:typescriptSupport');
const warnDisabled = (0, _fn.memoize)(()=>{
    _log.warn('Skipping TypeScript setup: EXPO_NO_TYPESCRIPT_SETUP is enabled.');
});
class TypeScriptProjectPrerequisite extends _Prerequisite.ProjectPrerequisite {
    /**
   * Ensure a project that hasn't explicitly disabled typescript support has all the required packages for running in the browser.
   *
   * @returns `true` if the setup finished and no longer needs to be run again.
   */ async assertImplementation() {
        if (_env.env.EXPO_NO_TYPESCRIPT_SETUP) {
            warnDisabled();
            return true;
        }
        debug('Ensuring TypeScript support is setup');
        const tsConfigPath = _path().default.join(this.projectRoot, 'tsconfig.json');
        // Ensure the project is TypeScript before continuing.
        const intent = await this._getSetupRequirements();
        if (!intent) {
            return false;
        }
        // Ensure TypeScript packages are installed
        await this._ensureDependenciesInstalledAsync();
        // Update the config
        await (0, _updateTSConfig.updateTSConfigAsync)({
            tsConfigPath
        });
        return true;
    }
    async bootstrapAsync() {
        if (_env.env.EXPO_NO_TYPESCRIPT_SETUP) {
            warnDisabled();
            return;
        }
        // Ensure TypeScript packages are installed
        await this._ensureDependenciesInstalledAsync({
            skipPrompt: true,
            isProjectMutable: true
        });
        const tsConfigPath = _path().default.join(this.projectRoot, 'tsconfig.json');
        // Update the config
        await (0, _updateTSConfig.updateTSConfigAsync)({
            tsConfigPath
        });
    }
    /** Exposed for testing. */ async _getSetupRequirements() {
        const tsConfigPath = await this._hasTSConfig();
        // Enable TS setup if the project has a `tsconfig.json`
        if (tsConfigPath) {
            const content = await _promises().default.readFile(tsConfigPath, {
                encoding: 'utf8'
            }).then((txt)=>txt.trim(), // null when the file doesn't exist.
            ()=>null);
            const isBlankConfig = content === '' || content === '{}';
            return {
                isBootstrapping: isBlankConfig
            };
        }
        // This is a somewhat heavy check in larger projects.
        // Test that this is reasonably paced by running expo start in `expo/apps/native-component-list`
        const typescriptFile = await this._queryFirstTypeScriptFileAsync();
        if (typescriptFile) {
            return {
                isBootstrapping: true
            };
        }
        return null;
    }
    /** Exposed for testing. */ async _ensureDependenciesInstalledAsync({ exp, skipPrompt, isProjectMutable } = {}) {
        try {
            return await (0, _ensureDependenciesAsync.ensureDependenciesAsync)(this.projectRoot, {
                exp,
                skipPrompt,
                isProjectMutable,
                installMessage: `It looks like you're trying to use TypeScript but don't have the required dependencies installed.`,
                warningMessage: "If you're not using TypeScript, please remove the TypeScript files from your project",
                requiredPackages: [
                    // use typescript/package.json to skip node module cache issues when the user installs
                    // the package and attempts to resolve the module in the same process.
                    {
                        file: 'typescript/package.json',
                        pkg: 'typescript',
                        dev: true
                    },
                    {
                        file: '@types/react/package.json',
                        pkg: '@types/react',
                        dev: true
                    }
                ]
            });
        } catch (error) {
            // Reset the cached check so we can re-run the check if the user re-runs the command by pressing 'w' in the Terminal UI.
            this.resetAssertion();
            throw error;
        }
    }
    /** Return the first TypeScript file in the project. */ async _queryFirstTypeScriptFileAsync() {
        try {
            // TODO(Bacon): Use `everyMatch` since a bug causes `anyMatch` to return inaccurate results when used multiple times.
            const results = await (0, _glob.everyMatchAsync)('**/*.@(ts|tsx)', {
                cwd: this.projectRoot,
                signal: AbortSignal.timeout(5000),
                ignore: [
                    '**/@(Carthage|Pods|node_modules)/**',
                    '**/*.d.ts',
                    '@(ios|android|web|web-build|dist)/**'
                ]
            });
            return results[0] ?? null;
        } catch (error) {
            if (error.name === 'TimeoutError') {
                return null;
            }
            throw error;
        }
    }
    async _hasTSConfig() {
        const tsConfigPath = _path().default.join(this.projectRoot, 'tsconfig.json');
        if (await (0, _dir.fileExistsAsync)(tsConfigPath)) {
            return tsConfigPath;
        }
        return null;
    }
}

//# sourceMappingURL=TypeScriptProjectPrerequisite.js.map