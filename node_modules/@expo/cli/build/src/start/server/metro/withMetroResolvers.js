/**
 * Copyright © 2022 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
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
    getDefaultMetroResolver: function() {
        return getDefaultMetroResolver;
    },
    withMetroMutatedResolverContext: function() {
        return withMetroMutatedResolverContext;
    },
    withMetroResolvers: function() {
        return withMetroResolvers;
    }
});
function _metroresolver() {
    const data = require("@expo/metro/metro-resolver");
    _metroresolver = function() {
        return data;
    };
    return data;
}
const _metroErrors = require("./metroErrors");
const debug = require('debug')('expo:metro:withMetroResolvers');
function getDefaultMetroResolver(projectRoot) {
    return (context, moduleName, platform)=>{
        return (0, _metroresolver().resolve)(context, moduleName, platform);
    };
}
function withMetroResolvers(config, inputResolvers) {
    var _config_resolver, _config_resolver1;
    const resolvers = inputResolvers.filter((x)=>x != null);
    debug(`Appending ${resolvers.length} custom resolvers to Metro config. (has custom resolver: ${!!((_config_resolver = config.resolver) == null ? void 0 : _config_resolver.resolveRequest)})`);
    // const hasUserDefinedResolver = !!config.resolver?.resolveRequest;
    // const defaultResolveRequest = getDefaultMetroResolver(projectRoot);
    const originalResolveRequest = (_config_resolver1 = config.resolver) == null ? void 0 : _config_resolver1.resolveRequest;
    return {
        ...config,
        resolver: {
            ...config.resolver,
            resolveRequest (context, moduleName, platform) {
                const upstreamResolveRequest = context.resolveRequest;
                const universalContext = {
                    ...context,
                    resolveRequest (ctx, moduleName, platform) {
                        for (const resolver of resolvers){
                            try {
                                const res = resolver(ctx, moduleName, platform);
                                if (res) {
                                    return res;
                                }
                            } catch (error) {
                                var _ctx_customResolverOptions;
                                // If the error is directly related to a resolver not being able to resolve a module, then
                                // we can ignore the error and try the next resolver. Otherwise, we should throw the error.
                                const isResolutionError = (0, _metroErrors.isFailedToResolveNameError)(error) || (0, _metroErrors.isFailedToResolvePathError)(error);
                                if (!isResolutionError) {
                                    throw error;
                                }
                                debug(`Custom resolver (${resolver.name || '<anonymous>'}) threw: ${error.constructor.name}. (module: ${moduleName}, platform: ${platform}, env: ${(_ctx_customResolverOptions = ctx.customResolverOptions) == null ? void 0 : _ctx_customResolverOptions.environment}, origin: ${ctx.originModulePath})`);
                            }
                        }
                        // If we haven't returned by now, use the original resolver or upstream resolver.
                        return upstreamResolveRequest(ctx, moduleName, platform);
                    }
                };
                // If the user defined a resolver, run it first and depend on the documented
                // chaining logic: https://facebook.github.io/metro/docs/resolution/#resolution-algorithm
                //
                // config.resolver.resolveRequest = (context, moduleName, platform) => {
                //
                //  // Do work...
                //
                //  return context.resolveRequest(context, moduleName, platform);
                // };
                const firstResolver = originalResolveRequest ?? universalContext.resolveRequest;
                return firstResolver(universalContext, moduleName, platform);
            }
        }
    };
}
function withMetroMutatedResolverContext(config, getContext) {
    var _config_resolver;
    const defaultResolveRequest = getDefaultMetroResolver(config.projectRoot);
    const originalResolveRequest = (_config_resolver = config.resolver) == null ? void 0 : _config_resolver.resolveRequest;
    return {
        ...config,
        resolver: {
            ...config.resolver,
            resolveRequest (context, moduleName, platform) {
                const universalContext = getContext(context, moduleName, platform);
                const firstResolver = originalResolveRequest ?? universalContext.resolveRequest ?? defaultResolveRequest;
                return firstResolver(universalContext, moduleName, platform);
            }
        }
    };
}

//# sourceMappingURL=withMetroResolvers.js.map