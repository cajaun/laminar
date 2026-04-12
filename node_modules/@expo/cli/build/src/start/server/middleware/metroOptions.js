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
    convertPathToModuleSpecifier: function() {
        return convertPathToModuleSpecifier;
    },
    createBundleOsPath: function() {
        return createBundleOsPath;
    },
    createBundleUrlPath: function() {
        return createBundleUrlPath;
    },
    createBundleUrlPathFromExpoConfig: function() {
        return createBundleUrlPathFromExpoConfig;
    },
    createBundleUrlSearchParams: function() {
        return createBundleUrlSearchParams;
    },
    getAsyncRoutesFromExpoConfig: function() {
        return getAsyncRoutesFromExpoConfig;
    },
    getBaseUrlFromExpoConfig: function() {
        return getBaseUrlFromExpoConfig;
    },
    getMetroDirectBundleOptions: function() {
        return getMetroDirectBundleOptions;
    },
    getMetroDirectBundleOptionsForExpoConfig: function() {
        return getMetroDirectBundleOptionsForExpoConfig;
    },
    getMetroOptionsFromUrl: function() {
        return getMetroOptionsFromUrl;
    },
    isServerEnvironment: function() {
        return isServerEnvironment;
    }
});
const _env = require("../../../utils/env");
const _errors = require("../../../utils/errors");
const _filePath = require("../../../utils/filePath");
const _router = require("../metro/router");
const debug = require('debug')('expo:metro:options');
function isServerEnvironment(environment) {
    return environment === 'node' || environment === 'react-server';
}
function withDefaults({ mode = 'development', minify = mode === 'production', preserveEnvVars = mode !== 'development' && _env.env.EXPO_NO_CLIENT_ENV_VARS, lazy, environment, ...props }) {
    if (props.bytecode) {
        if (props.platform === 'web') {
            throw new _errors.CommandError('Cannot use bytecode with the web platform');
        }
        if (props.engine !== 'hermes') {
            throw new _errors.CommandError('Bytecode is only supported with the Hermes engine');
        }
    }
    const optimize = props.optimize ?? (environment !== 'node' && mode === 'production' && _env.env.EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH);
    return {
        mode,
        minify,
        preserveEnvVars,
        optimize,
        usedExports: optimize && _env.env.EXPO_UNSTABLE_TREE_SHAKING,
        lazy: !props.isExporting && lazy,
        environment: environment === 'client' ? undefined : environment,
        liveBindings: _env.env.EXPO_UNSTABLE_LIVE_BINDINGS,
        ...props
    };
}
function getBaseUrlFromExpoConfig(exp) {
    var _exp_experiments_baseUrl, _exp_experiments;
    return ((_exp_experiments = exp.experiments) == null ? void 0 : (_exp_experiments_baseUrl = _exp_experiments.baseUrl) == null ? void 0 : _exp_experiments_baseUrl.trim().replace(/\/+$/, '')) ?? '';
}
function getAsyncRoutesFromExpoConfig(exp, mode, platform) {
    var _exp_extra_router, _exp_extra;
    let asyncRoutesSetting;
    if ((_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_router = _exp_extra.router) == null ? void 0 : _exp_extra_router.asyncRoutes) {
        var _exp_extra_router1, _exp_extra1;
        const asyncRoutes = (_exp_extra1 = exp.extra) == null ? void 0 : (_exp_extra_router1 = _exp_extra1.router) == null ? void 0 : _exp_extra_router1.asyncRoutes;
        if ([
            'boolean',
            'string'
        ].includes(typeof asyncRoutes)) {
            asyncRoutesSetting = asyncRoutes;
        } else if (typeof asyncRoutes === 'object') {
            asyncRoutesSetting = asyncRoutes[platform] ?? asyncRoutes.default;
        }
    }
    return [
        mode,
        true
    ].includes(asyncRoutesSetting);
}
function getMetroDirectBundleOptionsForExpoConfig(projectRoot, exp, options) {
    var _exp_experiments;
    return getMetroDirectBundleOptions({
        ...options,
        reactCompiler: !!((_exp_experiments = exp.experiments) == null ? void 0 : _exp_experiments.reactCompiler),
        baseUrl: getBaseUrlFromExpoConfig(exp),
        routerRoot: (0, _router.getRouterDirectoryModuleIdWithManifest)(projectRoot, exp),
        asyncRoutes: getAsyncRoutesFromExpoConfig(exp, options.mode, options.platform)
    });
}
function getMetroDirectBundleOptions(options) {
    const { mainModuleName, platform, mode, minify, environment, serializerOutput, serializerIncludeMaps, bytecode, lazy, engine, preserveEnvVars, asyncRoutes, baseUrl, routerRoot, isExporting, inlineSourceMap, splitChunks, usedExports, reactCompiler, optimize, domRoot, clientBoundaries, runModule, modulesOnly, useMd5Filename, hosted, liveBindings } = withDefaults(options);
    const dev = mode !== 'production';
    const isHermes = engine === 'hermes';
    if (isExporting) {
        debug('Disabling lazy bundling for export build');
        options.lazy = false;
    }
    let fakeSourceUrl;
    let fakeSourceMapUrl;
    // TODO: Upstream support to Metro for passing custom serializer options.
    if (serializerIncludeMaps != null || serializerOutput != null) {
        fakeSourceUrl = new URL(createBundleUrlPath(options).replace(/^\//, ''), 'http://localhost:8081').toString();
        if (serializerIncludeMaps) {
            fakeSourceMapUrl = fakeSourceUrl.replace('.bundle?', '.map?');
        }
    }
    const customTransformOptions = {
        __proto__: null,
        optimize: optimize || undefined,
        engine,
        clientBoundaries,
        preserveEnvVars: preserveEnvVars || undefined,
        // Use string to match the query param behavior.
        asyncRoutes: asyncRoutes ? String(asyncRoutes) : undefined,
        environment,
        baseUrl: baseUrl || undefined,
        routerRoot,
        bytecode: bytecode ? '1' : undefined,
        reactCompiler: reactCompiler ? String(reactCompiler) : undefined,
        dom: domRoot,
        hosted: hosted ? '1' : undefined,
        useMd5Filename: useMd5Filename || undefined,
        liveBindings: !liveBindings ? String(liveBindings) : undefined
    };
    // Iterate and delete undefined values
    for(const key in customTransformOptions){
        if (customTransformOptions[key] === undefined) {
            delete customTransformOptions[key];
        }
    }
    const bundleOptions = {
        platform,
        entryFile: mainModuleName,
        dev,
        minify: minify ?? !dev,
        inlineSourceMap: inlineSourceMap ?? false,
        lazy: !isExporting && lazy || undefined,
        unstable_transformProfile: isHermes ? 'hermes-stable' : 'default',
        customTransformOptions,
        runModule,
        modulesOnly,
        customResolverOptions: {
            __proto__: null,
            environment,
            exporting: isExporting || undefined
        },
        sourceMapUrl: fakeSourceMapUrl,
        sourceUrl: fakeSourceUrl,
        serializerOptions: {
            splitChunks,
            usedExports: usedExports || undefined,
            output: serializerOutput,
            includeSourceMaps: serializerIncludeMaps,
            exporting: isExporting || undefined
        }
    };
    return bundleOptions;
}
function createBundleUrlPathFromExpoConfig(projectRoot, exp, options) {
    var _exp_experiments;
    return createBundleUrlPath({
        ...options,
        reactCompiler: !!((_exp_experiments = exp.experiments) == null ? void 0 : _exp_experiments.reactCompiler),
        baseUrl: getBaseUrlFromExpoConfig(exp),
        routerRoot: (0, _router.getRouterDirectoryModuleIdWithManifest)(projectRoot, exp)
    });
}
function createBundleUrlPath(options) {
    const queryParams = createBundleUrlSearchParams(options);
    return `/${encodeURI(options.mainModuleName.replace(/^\/+/, ''))}.bundle?${queryParams.toString()}`;
}
function createBundleOsPath(options) {
    const queryParams = createBundleUrlSearchParams(options);
    const mainModuleName = (0, _filePath.toPosixPath)(options.mainModuleName);
    return `${mainModuleName}.bundle?${queryParams.toString()}`;
}
function createBundleUrlSearchParams(options) {
    const { platform, mode, minify, environment, serializerOutput, serializerIncludeMaps, lazy, bytecode, engine, preserveEnvVars, asyncRoutes, baseUrl, routerRoot, reactCompiler, inlineSourceMap, isExporting, clientBoundaries, splitChunks, usedExports, optimize, domRoot, modulesOnly, runModule, hosted, liveBindings } = withDefaults(options);
    const dev = String(mode !== 'production');
    const queryParams = new URLSearchParams({
        platform: encodeURIComponent(platform),
        dev,
        // TODO: Is this still needed?
        hot: String(false)
    });
    // Lazy bundling must be disabled for bundle splitting to work.
    if (!isExporting && lazy) {
        queryParams.append('lazy', String(lazy));
    }
    if (inlineSourceMap) {
        queryParams.append('inlineSourceMap', String(inlineSourceMap));
    }
    if (minify) {
        queryParams.append('minify', String(minify));
    }
    // We split bytecode from the engine since you could technically use Hermes without bytecode.
    // Hermes indicates the type of language features you want to transform out of the JS, whereas bytecode
    // indicates whether you want to use the Hermes bytecode format.
    if (engine) {
        queryParams.append('transform.engine', engine);
    }
    if (bytecode) {
        queryParams.append('transform.bytecode', '1');
    }
    if (asyncRoutes) {
        queryParams.append('transform.asyncRoutes', String(asyncRoutes));
    }
    if (preserveEnvVars) {
        queryParams.append('transform.preserveEnvVars', String(preserveEnvVars));
    }
    if (baseUrl) {
        queryParams.append('transform.baseUrl', baseUrl);
    }
    if (clientBoundaries == null ? void 0 : clientBoundaries.length) {
        queryParams.append('transform.clientBoundaries', JSON.stringify(clientBoundaries));
    }
    if (routerRoot != null) {
        queryParams.append('transform.routerRoot', routerRoot);
    }
    if (reactCompiler) {
        queryParams.append('transform.reactCompiler', String(reactCompiler));
    }
    if (domRoot) {
        queryParams.append('transform.dom', domRoot);
    }
    if (hosted) {
        queryParams.append('transform.hosted', '1');
    }
    if (environment) {
        queryParams.append('resolver.environment', environment);
        queryParams.append('transform.environment', environment);
    }
    if (isExporting) {
        queryParams.append('resolver.exporting', String(isExporting));
    }
    if (splitChunks) {
        queryParams.append('serializer.splitChunks', String(splitChunks));
    }
    if (usedExports) {
        queryParams.append('serializer.usedExports', String(usedExports));
    }
    if (optimize) {
        queryParams.append('transform.optimize', String(optimize));
    }
    if (serializerOutput) {
        queryParams.append('serializer.output', serializerOutput);
    }
    if (serializerIncludeMaps) {
        queryParams.append('serializer.map', String(serializerIncludeMaps));
    }
    if (engine === 'hermes') {
        queryParams.append('unstable_transformProfile', 'hermes-stable');
    }
    if (modulesOnly != null) {
        queryParams.set('modulesOnly', String(modulesOnly));
    }
    if (runModule != null) {
        queryParams.set('runModule', String(runModule));
    }
    if (liveBindings === false) {
        queryParams.append('transform.liveBindings', String(false));
    }
    return queryParams;
}
function convertPathToModuleSpecifier(pathLike) {
    return (0, _filePath.toPosixPath)(pathLike);
}
function getMetroOptionsFromUrl(urlFragment) {
    const url = new URL(urlFragment, 'http://localhost:0');
    const getStringParam = (key)=>{
        const param = url.searchParams.get(key);
        if (Array.isArray(param)) {
            throw new Error(`Expected single value for ${key}`);
        }
        return param;
    };
    let pathname = url.pathname;
    if (pathname.endsWith('.bundle')) {
        pathname = pathname.slice(0, -'.bundle'.length);
    }
    const options = {
        mode: isTruthy(getStringParam('dev') ?? 'true') ? 'development' : 'production',
        minify: isTruthy(getStringParam('minify') ?? 'false'),
        lazy: isTruthy(getStringParam('lazy') ?? 'false'),
        routerRoot: getStringParam('transform.routerRoot') ?? 'app',
        hosted: isTruthy(getStringParam('transform.hosted')),
        isExporting: isTruthy(getStringParam('resolver.exporting') ?? 'false'),
        environment: assertEnvironment(getStringParam('transform.environment') ?? 'node'),
        platform: url.searchParams.get('platform') ?? 'web',
        bytecode: isTruthy(getStringParam('transform.bytecode') ?? 'false'),
        mainModuleName: convertPathToModuleSpecifier(pathname),
        reactCompiler: isTruthy(getStringParam('transform.reactCompiler') ?? 'false'),
        asyncRoutes: isTruthy(getStringParam('transform.asyncRoutes') ?? 'false'),
        baseUrl: getStringParam('transform.baseUrl') ?? undefined,
        // clientBoundaries: JSON.parse(getStringParam('transform.clientBoundaries') ?? '[]'),
        engine: assertEngine(getStringParam('transform.engine')),
        runModule: isTruthy(getStringParam('runModule') ?? 'true'),
        modulesOnly: isTruthy(getStringParam('modulesOnly') ?? 'false'),
        liveBindings: isTruthy(getStringParam('transform.liveBindings') ?? 'true')
    };
    return options;
}
function isTruthy(value) {
    return value === 'true' || value === '1';
}
function assertEnvironment(environment) {
    if (!environment) {
        return undefined;
    }
    if (![
        'node',
        'react-server',
        'client'
    ].includes(environment)) {
        throw new Error(`Expected transform.environment to be one of: node, react-server, client`);
    }
    return environment;
}
function assertEngine(engine) {
    if (!engine) {
        return undefined;
    }
    if (![
        'hermes'
    ].includes(engine)) {
        throw new Error(`Expected transform.engine to be one of: hermes`);
    }
    return engine;
}

//# sourceMappingURL=metroOptions.js.map