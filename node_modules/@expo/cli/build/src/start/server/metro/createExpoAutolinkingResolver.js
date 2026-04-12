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
    _dependenciesToRegex: function() {
        return _dependenciesToRegex;
    },
    createAutolinkingModuleResolver: function() {
        return createAutolinkingModuleResolver;
    },
    createAutolinkingModuleResolverInput: function() {
        return createAutolinkingModuleResolverInput;
    }
});
const debug = require('debug')('expo:start:server:metro:autolinking-resolver');
// This is a list of known modules we want to always include in sticky resolution
// Specifying these skips platform- and module-specific checks and always includes them in the output
const KNOWN_STICKY_DEPENDENCIES = [
    // NOTE: react and react-dom aren't native modules, but must also be deduplicated in bundles
    'react',
    'react-dom',
    // NOTE: react-native won't be in autolinking output, since it's special
    // We include it here manually, since we know it should be an unduplicated direct dependency
    'react-native',
    // Peer dependencies from expo
    'react-native-webview',
    '@expo/dom-webview',
    // Dependencies from expo
    'expo-asset',
    'expo-constants',
    'expo-file-system',
    'expo-font',
    'expo-keep-awake',
    'expo-modules-core',
    // Peer dependencies from expo-router
    'react-native-gesture-handler',
    'react-native-reanimated'
];
const AUTOLINKING_PLATFORMS = [
    'android',
    'ios',
    'web'
];
const escapeDependencyName = (dependency)=>dependency.replace(/[*.?()[\]]/g, (x)=>`\\${x}`);
const _dependenciesToRegex = (dependencies)=>new RegExp(`^(${dependencies.map(escapeDependencyName).join('|')})($|/.*)`);
const getAutolinkingExports = ()=>require('expo/internal/unstable-autolinking-exports');
const toPlatformModuleDescription = (dependencies, platform)=>{
    const resolvedModulePaths = {};
    const resolvedModuleNames = [];
    for(const dependencyName in dependencies){
        const dependency = dependencies[dependencyName];
        if (dependency) {
            resolvedModuleNames.push(dependency.name);
            resolvedModulePaths[dependency.name] = dependency.path;
        }
    }
    debug(`Sticky resolution for ${platform} registered ${resolvedModuleNames.length} resolutions:`, resolvedModuleNames);
    return {
        platform,
        moduleTestRe: _dependenciesToRegex(resolvedModuleNames),
        resolvedModulePaths
    };
};
async function createAutolinkingModuleResolverInput({ platforms, projectRoot }) {
    const autolinking = getAutolinkingExports();
    const linker = autolinking.makeCachedDependenciesLinker({
        projectRoot
    });
    return Object.fromEntries(await Promise.all(platforms.filter((platform)=>{
        return AUTOLINKING_PLATFORMS.includes(platform);
    }).map(async (platform)=>{
        const dependencies = await autolinking.scanDependencyResolutionsForPlatform(linker, platform, KNOWN_STICKY_DEPENDENCIES);
        const moduleDescription = toPlatformModuleDescription(dependencies, platform);
        return [
            platform,
            moduleDescription
        ];
    })));
}
function createAutolinkingModuleResolver(input, { getStrictResolver }) {
    if (!input) {
        return undefined;
    }
    const fileSpecifierRe = /^[\\/]|^\.\.?(?:$|[\\/])/i;
    const isAutolinkingPlatform = (platform)=>!!platform && input[platform] != null;
    return function requestStickyModule(immutableContext, moduleName, platform) {
        // NOTE(@kitten): We currently don't include Web. The `expo-doctor` check already warns
        // about duplicates, and we can try to add Web later on. We should expand expo-modules-autolinking
        // properly to support web first however
        if (!isAutolinkingPlatform(platform)) {
            return null;
        } else if (fileSpecifierRe.test(moduleName)) {
            return null;
        }
        const moduleDescription = input[platform];
        const moduleMatch = moduleDescription.moduleTestRe.exec(moduleName);
        if (moduleMatch) {
            const resolvedModulePath = moduleDescription.resolvedModulePaths[moduleMatch[1]] || moduleName;
            // We instead resolve as if it was a dependency from within the module (self-require/import)
            const context = {
                ...immutableContext,
                nodeModulesPaths: [],
                originModulePath: resolvedModulePath
            };
            const res = getStrictResolver(context, platform)(moduleName);
            debug(`Sticky resolution for ${platform}: ${moduleName} -> from: ${resolvedModulePath}`);
            return res;
        }
        return null;
    };
}

//# sourceMappingURL=createExpoAutolinkingResolver.js.map