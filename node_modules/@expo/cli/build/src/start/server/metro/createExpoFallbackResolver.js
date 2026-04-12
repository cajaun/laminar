// This file creates the fallback resolver
// The fallback resolver applies only to module imports and should be the last resolver
// in the chain. It applies to failed Node module resolution of modules and will attempt
// to resolve them to `expo` and `expo-router` dependencies that couldn't be resolved.
// This resolves isolated dependency issues, where we expect dependencies of `expo`
// and `expo-router` to be resolvable, due to hoisting, but they aren't hoisted in
// a user's project.
// See: https://github.com/expo/expo/pull/34286
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createFallbackModuleResolver", {
    enumerable: true,
    get: function() {
        return createFallbackModuleResolver;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/** A record of dependencies that we know are only used for scripts and config-plugins
 * @privateRemarks
 * This includes dependencies we never resolve indirectly. Generally, we only want
 * to add fallback resolutions for dependencies of `expo` and `expo-router` that
 * are either transpiled into output code or resolved from other Expo packages
 * without them having direct dependencies on these dependencies.
 * Meaning: If you update this list, exclude what a user might use when they
 * forget to specify their own dependencies, rather than what we use ourselves
 * only in `expo` and `expo-router`.
 */ const EXCLUDE_ORIGIN_MODULES = {
    '@expo/config': true,
    '@expo/config-plugins': true,
    'schema-utils': true,
    semver: true
};
const debug = require('debug')('expo:start:server:metro:fallback-resolver');
/** Converts a list of module names to a regex that may either match bare module names or sub-modules of modules */ const dependenciesToRegex = (dependencies)=>new RegExp(`^(?:${dependencies.join('|')})(?:$|/)`);
/** Resolves an origin module and outputs a filter regex and target path for it */ const getModuleDescriptionWithResolver = (context, resolve, originModuleName)=>{
    let filePath;
    let packageMeta;
    try {
        const resolution = resolve(_path().default.join(originModuleName, 'package.json'));
        if (resolution.type !== 'sourceFile') {
            debug(`Fallback module resolution failed for origin module: ${originModuleName})`);
            return null;
        }
        filePath = resolution.filePath;
        // Upcast PackageJson to PackageMeta
        packageMeta = context.getPackage(filePath);
        if (!packageMeta) {
            return null;
        }
    } catch (error) {
        debug(`Fallback module resolution threw: ${error.constructor.name}. (module: ${filePath || originModuleName})`);
        return null;
    }
    let dependencies = [];
    if (packageMeta.dependencies) dependencies.push(...Object.keys(packageMeta.dependencies));
    if (packageMeta.peerDependencies) {
        const peerDependenciesMeta = packageMeta.peerDependenciesMeta;
        let peerDependencies = Object.keys(packageMeta.peerDependencies);
        // We explicitly include non-optional peer dependencies. Non-optional peer dependencies of
        // `expo` and `expo-router` are either expected to be accessible on a project-level, since
        // both are meant to be installed is direct dependencies, or shouldn't be accessible when
        // they're fulfilled as isolated dependencies.
        // The exception are only *optional* peer dependencies, since when they're installed
        // automatically by newer package manager behaviour, they may become isolated dependencies
        // that we still wish to access.
        if (peerDependenciesMeta) {
            peerDependencies = peerDependencies.filter((dependency)=>{
                const peerMeta = peerDependenciesMeta[dependency];
                return peerMeta && typeof peerMeta === 'object' && peerMeta.optional === true;
            });
        }
        dependencies.push(...peerDependencies);
    }
    // We deduplicate the dependencies and exclude modules that we know are only used for scripts or config-plugins
    dependencies = dependencies.filter((moduleName, index, dependenciesArr)=>{
        if (EXCLUDE_ORIGIN_MODULES[moduleName]) return false;
        return dependenciesArr.indexOf(moduleName) === index;
    });
    // Return test regex for dependencies and full origin module path to resolve through
    const originModulePath = _path().default.dirname(filePath);
    return dependencies.length ? {
        originModulePath,
        moduleTestRe: dependenciesToRegex(dependencies)
    } : null;
};
function createFallbackModuleResolver({ projectRoot, originModuleNames, getStrictResolver }) {
    const _moduleDescriptionsCache = {};
    const getModuleDescription = (immutableContext, originModuleName, platform)=>{
        if (_moduleDescriptionsCache[originModuleName] !== undefined) {
            return _moduleDescriptionsCache[originModuleName];
        }
        // Resolve the origin module itself via the project root rather than the file that requested the missing module
        // The addition of `package.json` doesn't matter here. We just need a file path that'll be turned into a directory path
        // We don't need to modify `nodeModulesPaths` since it's guaranteed to contain the project's node modules paths
        const context = {
            ...immutableContext,
            originModulePath: _path().default.join(projectRoot, 'package.json')
        };
        return _moduleDescriptionsCache[originModuleName] = getModuleDescriptionWithResolver(context, getStrictResolver(context, platform), originModuleName);
    };
    const fileSpecifierRe = /^[\\/]|^\.\.?(?:$|[\\/])/i;
    return function requestFallbackModule(immutableContext, moduleName, platform) {
        // Early return if `moduleName` cannot be a module specifier
        // This doesn't have to be accurate as this resolver is a fallback for failed resolutions and
        // we're only doing this to avoid unnecessary resolution work
        if (fileSpecifierRe.test(moduleName)) {
            return null;
        }
        for (const originModuleName of originModuleNames){
            const moduleDescription = getModuleDescription(immutableContext, originModuleName, platform);
            if (moduleDescription && moduleDescription.moduleTestRe.test(moduleName)) {
                // We instead resolve as if it was depended on by the `originModulePath` (the module named in `originModuleNames`)
                const context = {
                    ...immutableContext,
                    nodeModulesPaths: [],
                    // NOTE(@kitten): We need to add a fake filename here. Metro performs a `path.dirname` on this path
                    // and then searches `${path.dirname(originModulePath)}/node_modules`. If we don't add it, we miss
                    // fallback resolution for packages that failed to hoist
                    originModulePath: _path().default.join(moduleDescription.originModulePath, 'index.js')
                };
                const res = getStrictResolver(context, platform)(moduleName);
                debug(`Fallback resolution for ${platform}: ${moduleName} -> from origin: ${originModuleName}`);
                return res;
            }
        }
        return null;
    };
}

//# sourceMappingURL=createExpoFallbackResolver.js.map