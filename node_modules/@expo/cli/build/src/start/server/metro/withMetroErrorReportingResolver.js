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
    createMutateResolutionError: function() {
        return createMutateResolutionError;
    },
    withMetroErrorReportingResolver: function() {
        return withMetroErrorReportingResolver;
    }
});
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
function _util() {
    const data = require("util");
    _util = function() {
        return data;
    };
    return data;
}
const _dir = require("../../../utils/dir");
const _env = require("../../../utils/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:metro:withMetroResolvers');
// TODO: Do we need to expose this?
const STACK_DEPTH_LIMIT = 35;
const STACK_COUNT_LIMIT = 2000;
function withMetroErrorReportingResolver(config) {
    var _config_resolver;
    if (!_env.env.EXPO_METRO_UNSTABLE_ERRORS) {
        return config;
    }
    const originalResolveRequest = (_config_resolver = config.resolver) == null ? void 0 : _config_resolver.resolveRequest;
    const depGraph = new Map();
    const mutateResolutionError = createMutateResolutionError(config, depGraph);
    return {
        ...config,
        resolver: {
            ...config.resolver,
            resolveRequest (context, moduleName, platform) {
                const storeResult = (res)=>{
                    const inputPlatform = platform ?? 'null';
                    const key = optionsKeyForContext(context);
                    if (!depGraph.has(key)) depGraph.set(key, new Map());
                    const mapByTarget = depGraph.get(key);
                    if (!mapByTarget.has(inputPlatform)) mapByTarget.set(inputPlatform, new Map());
                    const mapByPlatform = mapByTarget.get(inputPlatform);
                    if (!mapByPlatform.has(context.originModulePath)) mapByPlatform.set(context.originModulePath, new Set());
                    const setForModule = mapByPlatform.get(context.originModulePath);
                    const qualifiedModuleName = (res == null ? void 0 : res.type) === 'sourceFile' ? res.filePath : moduleName;
                    setForModule.add({
                        path: qualifiedModuleName,
                        request: moduleName
                    });
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
                try {
                    const firstResolver = originalResolveRequest ?? context.resolveRequest;
                    const res = firstResolver(context, moduleName, platform);
                    storeResult(res);
                    return res;
                } catch (error) {
                    throw mutateResolutionError(error, context, moduleName, platform);
                }
            }
        }
    };
}
function optionsKeyForContext(context) {
    const canonicalize = require('@expo/metro/metro-core/canonicalize');
    // Compound key for the resolver cache
    return JSON.stringify(context.customResolverOptions ?? {}, canonicalize) ?? '';
}
const createMutateResolutionError = (config, depGraph, stackDepthLimit = STACK_DEPTH_LIMIT, stackCountLimit = STACK_COUNT_LIMIT)=>(error, context, moduleName, platform)=>{
        var _config_server;
        const inputPlatform = platform ?? 'null';
        const mapByOrigin = depGraph.get(optionsKeyForContext(context));
        const mapByPlatform = mapByOrigin == null ? void 0 : mapByOrigin.get(inputPlatform);
        if (!mapByPlatform) {
            return error;
        }
        // collect all references inversely using some expensive lookup
        const getReferences = (origin)=>{
            const inverseOrigin = [];
            if (!mapByPlatform) {
                return inverseOrigin;
            }
            for (const [originKey, mapByTarget] of mapByPlatform){
                // search comparing origin to path
                const found = [
                    ...mapByTarget.values()
                ].find((resolution)=>resolution.path === origin);
                if (found) {
                    inverseOrigin.push({
                        origin,
                        previous: originKey,
                        request: found.request
                    });
                }
            }
            return inverseOrigin;
        };
        const root = ((_config_server = config.server) == null ? void 0 : _config_server.unstable_serverRoot) ?? config.projectRoot;
        const projectRoot = config.projectRoot;
        let stackCounter = 0;
        let inverseStack;
        /** @returns boolean - done */ const saveStack = (stack)=>{
            stackCounter++;
            if (!inverseStack) {
                // First stack, save it
                inverseStack = stack;
                return false;
            }
            if (stackCounter >= stackCountLimit) {
                // Too many stacks explored, stop searching
                return true;
            }
            if (stack.circular || stack.limited) {
                // Not better than the current one, skip
                return false;
            }
            if (inverseStack.circular || inverseStack.limited) {
                // Current one is better than the previous one, save it
                inverseStack = stack;
            // No return as we want to continue validation the new stack
            }
            if (inverseStack.projectRoot) {
                // The best possible stack already acquired, skip
                return true;
            }
            const stackOrigin = stack.frames[stack.frames.length - 1].origin;
            if (stackOrigin && (0, _dir.isPathInside)(stackOrigin, projectRoot) && !stackOrigin.includes('node_modules')) {
                // The best stack to show to users is the one leading from the project code.
                stack.serverRoot = true;
                inverseStack = stack;
                return true;
            }
            if (// Has to be after the project root check
            stackOrigin && (0, _dir.isPathInside)(stackOrigin, root) && !stackOrigin.includes('node_modules')) {
                // The best stack to show to users is the one leading from the monorepo code.
                stack.serverRoot = true;
                inverseStack = stack;
                return false;
            }
            // If new stack is not better do nothing
            return false;
        };
        /** @returns boolean - done */ const recurseBackWithLimit = (frame, limit, stack = {
            frames: []
        }, visited = new Set())=>{
            stack.frames.push(frame);
            if (visited.has(frame.origin)) {
                stack.circular = true;
                return saveStack(stack);
            }
            if (stack.frames.length >= limit) {
                stack.limited = true;
                return saveStack(stack);
            }
            visited.add(frame.origin);
            const inverse = getReferences(frame.origin);
            if (inverse.length === 0) {
                // No more references, push the stack and return
                return saveStack(stack);
            }
            for (const match of inverse){
                // Use more qualified name if possible
                // results.origin = match.origin;
                // Found entry point
                if (frame.origin === match.previous) {
                    continue;
                }
                const isDone = recurseBackWithLimit({
                    origin: match.previous,
                    request: match.request
                }, limit, {
                    frames: [
                        ...stack.frames
                    ]
                }, new Set(visited));
                if (isDone) {
                    return true; // Stop search
                }
            }
            return false; // Continue search
        };
        recurseBackWithLimit({
            origin: context.originModulePath,
            request: moduleName
        }, stackDepthLimit);
        debug('Number of explored stacks:', stackCounter);
        if (inverseStack && inverseStack.frames.length > 0) {
            const formattedImport = (0, _chalk().default)`{gray  |} {cyan import} `;
            const importMessagePadding = ' '.repeat((0, _util().stripVTControlCharacters)(formattedImport).length + 1);
            debug('Found inverse graph:', JSON.stringify(inverseStack, null, 2));
            let extraMessage = _chalk().default.bold(`Import stack${stackCounter >= stackCountLimit ? ` (${stackCounter})` : ''}:`);
            for (const frame of inverseStack.frames){
                let currentMessage = '';
                let filename = _path().default.relative(root, frame.origin);
                if (filename.match(/\?ctx=[\w\d]+$/)) {
                    filename = filename.replace(/\?ctx=[\w\d]+$/, _chalk().default.dim(' (require.context)'));
                } else {
                    let formattedRequest = _chalk().default.green(`"${frame.request}"`);
                    if (// If bundling for web and the import is pulling internals from outside of react-native
                    // then mark it as an invalid import.
                    inputPlatform === 'web' && !/^(node_modules\/)?react-native\//.test(filename) && frame.request.match(/^react-native\/.*/)) {
                        formattedRequest = formattedRequest + (0, _chalk().default)`\n${importMessagePadding}{yellow ^ Importing react-native internals is not supported on web.}`;
                    }
                    filename = filename + (0, _chalk().default)`\n${formattedImport}${formattedRequest}`;
                }
                let line = '\n' + _chalk().default.gray(' ') + filename;
                if (filename.match(/node_modules/)) {
                    line = _chalk().default.gray(// Bold the node module name
                    line.replace(/node_modules\/([^/]+)/, (_match, p1)=>{
                        return 'node_modules/' + _chalk().default.bold(p1);
                    }));
                }
                currentMessage += `\n${line}`;
                extraMessage += currentMessage;
            }
            if (inverseStack.circular) {
                extraMessage += (0, _chalk().default)`\n${importMessagePadding}{yellow ^ The import above creates circular dependency.}`;
            }
            if (inverseStack.limited) {
                extraMessage += (0, _chalk().default)`\n\n {bold {yellow Depth limit reached. The actual stack is longer than what you can see above.}}`;
            }
            extraMessage += '\n';
            // @ts-expect-error
            error._expoImportStack = extraMessage;
        } else {
            debug('Found no inverse tree for:', context.originModulePath);
        }
        return error;
    };

//# sourceMappingURL=withMetroErrorReportingResolver.js.map