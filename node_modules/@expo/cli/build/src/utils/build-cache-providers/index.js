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
    resolveBuildCache: function() {
        return resolveBuildCache;
    },
    resolveBuildCacheProvider: function() {
        return resolveBuildCacheProvider;
    },
    resolvePluginFunction: function() {
        return resolvePluginFunction;
    },
    uploadBuildCache: function() {
        return uploadBuildCache;
    }
});
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
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
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _helpers = require("./helpers");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _ensureDependenciesAsync = require("../../start/doctor/dependencies/ensureDependenciesAsync");
const _errors = require("../errors");
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
const debug = require('debug')('expo:run:build-cache-provider');
const resolveBuildCacheProvider = async (provider, projectRoot)=>{
    if (!provider) {
        return;
    }
    if (provider === 'eas') {
        try {
            await (0, _ensureDependenciesAsync.ensureDependenciesAsync)(projectRoot, {
                isProjectMutable: true,
                installMessage: 'eas-build-cache-provider package is required to use the EAS build cache.\n',
                warningMessage: 'Unable to to use the EAS remote build cache.',
                requiredPackages: [
                    {
                        pkg: 'eas-build-cache-provider',
                        file: 'eas-build-cache-provider/package.json',
                        dev: true
                    }
                ]
            });
            // We need to manually load dependencies installed on the fly
            const plugin = await manuallyLoadDependency(projectRoot, 'eas-build-cache-provider');
            return {
                plugin: plugin.default ?? plugin,
                options: {}
            };
        } catch (error) {
            if (error instanceof _errors.CommandError) {
                _log.warn(error.message);
            } else {
                throw error;
            }
            return undefined;
        }
    }
    if (typeof provider === 'object' && typeof provider.plugin === 'string') {
        const plugin = resolvePluginFunction(projectRoot, provider.plugin);
        return {
            plugin,
            options: provider.options
        };
    }
    throw new Error('Invalid build cache provider');
};
async function resolveBuildCache({ projectRoot, platform, provider, runOptions }) {
    const fingerprintHash = await calculateFingerprintHashAsync({
        projectRoot,
        platform,
        provider,
        runOptions
    });
    if (!fingerprintHash) {
        return null;
    }
    if ('resolveRemoteBuildCache' in provider.plugin) {
        _log.warn('The resolveRemoteBuildCache function is deprecated. Use resolveBuildCache instead.');
        return await provider.plugin.resolveRemoteBuildCache({
            fingerprintHash,
            platform,
            runOptions,
            projectRoot
        }, provider.options);
    }
    return await provider.plugin.resolveBuildCache({
        fingerprintHash,
        platform,
        runOptions,
        projectRoot
    }, provider.options);
}
async function uploadBuildCache({ projectRoot, platform, provider, buildPath, runOptions }) {
    const fingerprintHash = await calculateFingerprintHashAsync({
        projectRoot,
        platform,
        provider,
        runOptions
    });
    if (!fingerprintHash) {
        debug('No fingerprint hash found, skipping upload');
        return;
    }
    if ('uploadRemoteBuildCache' in provider.plugin) {
        _log.warn('The uploadRemoteBuildCache function is deprecated. Use uploadBuildCache instead.');
        await provider.plugin.uploadRemoteBuildCache({
            projectRoot,
            platform,
            fingerprintHash,
            buildPath,
            runOptions
        }, provider.options);
    } else {
        await provider.plugin.uploadBuildCache({
            projectRoot,
            platform,
            fingerprintHash,
            buildPath,
            runOptions
        }, provider.options);
    }
}
async function calculateFingerprintHashAsync({ projectRoot, platform, provider, runOptions }) {
    if (provider.plugin.calculateFingerprintHash) {
        return await provider.plugin.calculateFingerprintHash({
            projectRoot,
            platform,
            runOptions
        }, provider.options);
    }
    const Fingerprint = importFingerprintForDev(projectRoot);
    if (!Fingerprint) {
        debug('@expo/fingerprint is not installed in the project, unable to calculate fingerprint');
        return null;
    }
    const fingerprint = await Fingerprint.createFingerprintAsync(projectRoot);
    return fingerprint.hash;
}
function importFingerprintForDev(projectRoot) {
    try {
        return require(require.resolve('@expo/fingerprint', {
            paths: [
                projectRoot
            ]
        }));
    } catch (error) {
        if ('code' in error && error.code === 'MODULE_NOT_FOUND') {
            return null;
        }
        throw error;
    }
}
/**
 * Resolve the provider plugin from a node module or package.
 * If the module or package does not include a provider plugin, this function throws.
 * The resolution is done in following order:
 *   1. Is the reference a relative file path or an import specifier with file path? e.g. `./file.js`, `pkg/file.js` or `@org/pkg/file.js`?
 *     - Resolve the provider plugin as-is
 *   2. Does the module have a valid provider plugin in the `main` field?
 *     - Resolve the `main` entry point as provider plugin
 */ function resolvePluginFilePathForModule(projectRoot, pluginReference) {
    if ((0, _helpers.moduleNameIsDirectFileReference)(pluginReference)) {
        // Only resolve `./file.js`, `package/file.js`, `@org/package/file.js`
        const pluginScriptFile = _resolvefrom().default.silent(projectRoot, pluginReference);
        if (pluginScriptFile) {
            return pluginScriptFile;
        }
    } else if ((0, _helpers.moduleNameIsPackageReference)(pluginReference)) {
        // Try to resole the `main` entry as config plugin
        return (0, _resolvefrom().default)(projectRoot, pluginReference);
    }
    throw new Error(`Failed to resolve provider plugin for module "${pluginReference}" relative to "${projectRoot}". Do you have node modules installed?`);
}
function resolvePluginFunction(projectRoot, pluginReference) {
    const pluginFile = resolvePluginFilePathForModule(projectRoot, pluginReference);
    try {
        let plugin = require(pluginFile);
        if ((plugin == null ? void 0 : plugin.default) != null) {
            plugin = plugin.default;
        }
        if (typeof plugin !== 'object' || typeof plugin.resolveRemoteBuildCache !== 'function' && typeof plugin.resolveBuildCache !== 'function' || typeof plugin.uploadRemoteBuildCache !== 'function' && typeof plugin.uploadBuildCache !== 'function') {
            throw new Error(`
        The provider plugin "${pluginReference}" must export an object containing
        the resolveBuildCache and uploadBuildCache functions.
      `);
        }
        return plugin;
    } catch (error) {
        if (error instanceof SyntaxError) {
        // Add error linking to the docs of how create a valid provider plugin
        }
        throw error;
    }
}
async function manuallyLoadDependency(projectRoot, packageName) {
    const possiblePaths = [
        _path().default.join(projectRoot, 'node_modules'),
        ...require.resolve.paths(packageName) ?? []
    ];
    const nodeModulesFolder = possiblePaths == null ? void 0 : possiblePaths.find((p)=>{
        const packagePath = _path().default.join(p, packageName);
        return _fs().default.existsSync(packagePath);
    });
    if (!nodeModulesFolder) {
        throw new Error(`Package ${packageName} not found in ${possiblePaths}`);
    }
    const { main } = await Promise.resolve(_path().default.join(nodeModulesFolder, packageName, 'package.json')).then((p)=>/*#__PURE__*/ _interop_require_wildcard(require(p)));
    return Promise.resolve(_path().default.join(nodeModulesFolder, packageName, main)).then((p)=>/*#__PURE__*/ _interop_require_wildcard(require(p)));
}

//# sourceMappingURL=index.js.map