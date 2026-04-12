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
    createServerComponentsMiddleware: function() {
        return createServerComponentsMiddleware;
    },
    fileURLToFilePath: function() {
        return fileURLToFilePath;
    }
});
function _paths() {
    const data = require("@expo/config/paths");
    _paths = function() {
        return data;
    };
    return data;
}
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _private() {
    const data = require("expo-server/private");
    _private = function() {
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
function _url() {
    const data = /*#__PURE__*/ _interop_require_default(require("url"));
    _url = function() {
        return data;
    };
    return data;
}
const _metroErrorInterface = require("./metroErrorInterface");
const _xcodeCompilerLogger = require("../../../export/embed/xcodeCompilerLogger");
const _ansi = require("../../../utils/ansi");
const _filePath = require("../../../utils/filePath");
const _fn = require("../../../utils/fn");
const _ip = require("../../../utils/ip");
const _stream = require("../../../utils/stream");
const _createBuiltinAPIRequestHandler = require("../middleware/createBuiltinAPIRequestHandler");
const _metroOptions = require("../middleware/metroOptions");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:rsc');
const getMetroServerRootMemo = (0, _fn.memoize)(_paths().getMetroServerRoot);
function createServerComponentsMiddleware(projectRoot, { rscPath, instanceMetroOptions, ssrLoadModule, ssrLoadModuleArtifacts, useClientRouter, createModuleId, routerOptions }) {
    const routerModule = useClientRouter ? 'expo-router/build/rsc/router/noopRouter' : 'expo-router/build/rsc/router/expo-definedRouter';
    const rscMiddleware = (0, _private().getRscMiddleware)({
        config: {},
        // Disabled in development
        baseUrl: '',
        rscPath,
        onError: console.error,
        renderRsc: async (args)=>{
            // In development we should add simulated versions of common production headers.
            if (args.headers['x-real-ip'] == null) {
                args.headers['x-real-ip'] = (0, _ip.getIpAddress)();
            }
            if (args.headers['x-forwarded-for'] == null) {
                args.headers['x-forwarded-for'] = args.headers['x-real-ip'];
            }
            if (args.headers['x-forwarded-proto'] == null) {
                args.headers['x-forwarded-proto'] = 'http';
            }
            // Dev server-only implementation.
            try {
                return await renderRscToReadableStream({
                    ...args,
                    headers: new Headers(args.headers),
                    body: args.body,
                    routerOptions
                });
            } catch (error) {
                // If you get a codeFrame error during SSR like when using a Class component in React Server Components, then this
                // will throw with:
                // {
                //   rawObject: {
                //     type: 'TransformError',
                //     lineNumber: 0,
                //     errors: [ [Object] ],
                //     name: 'SyntaxError',
                //     message: '...',
                //   }
                // }
                // TODO: Revisit all error handling now that we do direct metro bundling...
                await (0, _metroErrorInterface.logMetroError)(projectRoot, {
                    error
                });
                if (error[_metroErrorInterface.IS_METRO_BUNDLE_ERROR_SYMBOL]) {
                    throw new Response(JSON.stringify(error), {
                        status: (0, _xcodeCompilerLogger.isPossiblyUnableToResolveError)(error) ? 404 : 500,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                const sanitizedServerMessage = (0, _ansi.stripAnsi)(error.message) ?? error.message;
                throw new Response(sanitizedServerMessage, {
                    status: 500,
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                });
            }
        }
    });
    let rscPathPrefix = rscPath;
    if (rscPathPrefix !== '/') {
        rscPathPrefix += '/';
    }
    async function exportServerActionsAsync({ platform, entryPoints, domRoot }, files) {
        const uniqueEntryPoints = [
            ...new Set(entryPoints)
        ];
        // TODO: Support multiple entry points in a single split server bundle...
        const manifest = {};
        const nestedClientBoundaries = [];
        const nestedServerBoundaries = [];
        const processedEntryPoints = new Set();
        async function processEntryPoint(entryPoint) {
            var _contents_artifacts_filter__metadata_reactClientReferences, _contents_artifacts_filter__metadata_reactServerReferences;
            processedEntryPoints.add(entryPoint);
            const contents = await ssrLoadModuleArtifacts(entryPoint, {
                environment: 'react-server',
                platform,
                // Ignore the metro runtime to avoid overwriting the original in the API route.
                modulesOnly: true,
                // Required
                runModule: true,
                // Required to ensure assets load as client boundaries.
                domRoot
            });
            const reactClientReferences = (_contents_artifacts_filter__metadata_reactClientReferences = contents.artifacts.filter((a)=>a.type === 'js')[0].metadata.reactClientReferences) == null ? void 0 : _contents_artifacts_filter__metadata_reactClientReferences.map((ref)=>fileURLToFilePath(ref));
            if (reactClientReferences) {
                nestedClientBoundaries.push(...reactClientReferences);
            }
            const reactServerReferences = (_contents_artifacts_filter__metadata_reactServerReferences = contents.artifacts.filter((a)=>a.type === 'js')[0].metadata.reactServerReferences) == null ? void 0 : _contents_artifacts_filter__metadata_reactServerReferences.map((ref)=>fileURLToFilePath(ref));
            if (reactServerReferences) {
                nestedServerBoundaries.push(...reactServerReferences);
            }
            // Naive check to ensure the module runtime is not included in the server action bundle.
            if (contents.src.includes('The experimental Metro feature')) {
                throw new Error('Internal error: module runtime should not be included in server action bundles: ' + entryPoint);
            }
            const relativeName = createModuleId(entryPoint, {
                platform,
                environment: 'react-server'
            });
            const safeName = _path().default.basename(contents.artifacts.find((a)=>a.type === 'js').filename);
            const outputName = `_expo/rsc/${platform}/${safeName}`;
            // While we're here, export the router for the server to dynamically render RSC.
            files.set(outputName, {
                targetDomain: 'server',
                contents: wrapBundle(contents.src)
            });
            // Match babel plugin.
            const publicModuleId = './' + (0, _filePath.toPosixPath)(_path().default.relative(projectRoot, entryPoint));
            // Import relative to `dist/server/_expo/rsc/web/router.js`
            manifest[publicModuleId] = [
                String(relativeName),
                outputName
            ];
        }
        async function processEntryPoints(entryPoints, recursions = 0) {
            // Arbitrary recursion limit to prevent infinite loops.
            if (recursions > 10) {
                throw new Error('Recursion limit exceeded while processing server boundaries');
            }
            for (const entryPoint of entryPoints){
                await processEntryPoint(entryPoint);
            }
            // When a server action has other server actions inside of it, we need to process those as well to ensure all entry points are in the manifest and accounted for.
            let uniqueNestedServerBoundaries = [
                ...new Set(nestedServerBoundaries)
            ];
            // Filter out values that have already been processed.
            uniqueNestedServerBoundaries = uniqueNestedServerBoundaries.filter((value)=>!processedEntryPoints.has(value));
            if (uniqueNestedServerBoundaries.length) {
                debug('bundling nested server action boundaries', uniqueNestedServerBoundaries);
                return processEntryPoints(uniqueNestedServerBoundaries, recursions + 1);
            }
        }
        await processEntryPoints(uniqueEntryPoints);
        // Save the SSR manifest so we can perform more replacements in the server renderer and with server actions.
        files.set(`_expo/rsc/${platform}/action-manifest.js`, {
            targetDomain: 'server',
            contents: 'module.exports = ' + JSON.stringify(manifest)
        });
        return {
            manifest,
            clientBoundaries: nestedClientBoundaries
        };
    }
    async function getExpoRouterClientReferencesAsync({ platform, domRoot }, files) {
        var _contents_artifacts_filter__metadata_reactServerReferences, _contents_artifacts_filter__metadata_reactClientReferences;
        const contents = await ssrLoadModuleArtifacts(routerModule, {
            environment: 'react-server',
            platform,
            modulesOnly: true,
            domRoot
        });
        // Extract the global CSS modules that are imported from the router.
        // These will be injected in the head of the HTML document for the website.
        const cssModules = contents.artifacts.filter((a)=>a.type.startsWith('css'));
        const reactServerReferences = (_contents_artifacts_filter__metadata_reactServerReferences = contents.artifacts.filter((a)=>a.type === 'js')[0].metadata.reactServerReferences) == null ? void 0 : _contents_artifacts_filter__metadata_reactServerReferences.map((ref)=>fileURLToFilePath(ref));
        if (!reactServerReferences) {
            throw new Error('Static server action references were not returned from the Metro SSR bundle for definedRouter');
        }
        debug('React client boundaries:', reactServerReferences);
        const reactClientReferences = (_contents_artifacts_filter__metadata_reactClientReferences = contents.artifacts.filter((a)=>a.type === 'js')[0].metadata.reactClientReferences) == null ? void 0 : _contents_artifacts_filter__metadata_reactClientReferences.map((ref)=>fileURLToFilePath(ref));
        if (!reactClientReferences) {
            throw new Error('Static client references were not returned from the Metro SSR bundle for definedRouter');
        }
        debug('React client boundaries:', reactClientReferences);
        // While we're here, export the router for the server to dynamically render RSC.
        files.set(`_expo/rsc/${platform}/router.js`, {
            targetDomain: 'server',
            contents: wrapBundle(contents.src)
        });
        return {
            reactClientReferences,
            reactServerReferences,
            cssModules
        };
    }
    const routerCache = new Map();
    async function getExpoRouterRscEntriesGetterAsync({ platform, routerOptions }) {
        await ensureMemo();
        // We can only cache this if we're using the client router since it doesn't change or use HMR
        if (routerCache.has(platform) && useClientRouter) {
            return routerCache.get(platform);
        }
        const router = await ssrLoadModule(routerModule, {
            environment: 'react-server',
            modulesOnly: true,
            platform
        }, {
            hot: !useClientRouter
        });
        const entries = router.default({
            redirects: routerOptions == null ? void 0 : routerOptions.redirects,
            rewrites: routerOptions == null ? void 0 : routerOptions.rewrites
        });
        routerCache.set(platform, entries);
        return entries;
    }
    function getResolveClientEntry(context) {
        const serverRoot = getMetroServerRootMemo(projectRoot);
        const { mode, minify = false, isExporting, baseUrl, routerRoot, asyncRoutes, preserveEnvVars, reactCompiler, lazy } = instanceMetroOptions;
        (0, _assert().default)(isExporting != null && baseUrl != null && mode != null && routerRoot != null && asyncRoutes != null, `The server must be started. (isExporting: ${isExporting}, baseUrl: ${baseUrl}, mode: ${mode}, routerRoot: ${routerRoot}, asyncRoutes: ${asyncRoutes})`);
        return (file, isServer)=>{
            const filePath = _path().default.join(projectRoot, file.startsWith('file://') ? fileURLToFilePath(file) : file);
            if (isExporting) {
                (0, _assert().default)(context.ssrManifest, 'SSR manifest must exist when exporting');
                const relativeFilePath = (0, _filePath.toPosixPath)(_path().default.relative(serverRoot, filePath));
                (0, _assert().default)(context.ssrManifest.has(relativeFilePath), `SSR manifest is missing client boundary "${relativeFilePath}"`);
                const chunk = context.ssrManifest.get(relativeFilePath);
                return {
                    id: String(createModuleId(filePath, {
                        platform: context.platform,
                        environment: 'client'
                    })),
                    chunks: chunk != null ? [
                        chunk
                    ] : []
                };
            }
            const environment = isServer ? 'react-server' : 'client';
            const searchParams = (0, _metroOptions.createBundleUrlSearchParams)({
                mainModuleName: '',
                platform: context.platform,
                mode,
                minify,
                lazy,
                preserveEnvVars,
                asyncRoutes,
                baseUrl,
                routerRoot,
                isExporting,
                reactCompiler: !!reactCompiler,
                engine: context.engine ?? undefined,
                bytecode: false,
                clientBoundaries: [],
                inlineSourceMap: false,
                environment,
                modulesOnly: true,
                runModule: false
            });
            searchParams.set('resolver.clientboundary', String(true));
            const clientReferenceUrl = new URL('http://a');
            // TICKLE: Handshake 1
            searchParams.set('xRSC', '1');
            clientReferenceUrl.search = searchParams.toString();
            const relativeFilePath = _path().default.relative(serverRoot, filePath);
            clientReferenceUrl.pathname = relativeFilePath;
            // Ensure url.pathname ends with '.bundle'
            if (!clientReferenceUrl.pathname.endsWith('.bundle')) {
                clientReferenceUrl.pathname += '.bundle';
            }
            // Return relative URLs to help Android fetch from wherever it was loaded from since it doesn't support localhost.
            const chunkName = clientReferenceUrl.pathname + clientReferenceUrl.search;
            return {
                id: String(createModuleId(filePath, {
                    platform: context.platform,
                    environment
                })),
                chunks: [
                    chunkName
                ]
            };
        };
    }
    const rscRendererCache = new Map();
    let ensurePromise = null;
    async function ensureSSRReady() {
        // TODO: Extract CSS Modules / Assets from the bundler process
        await ssrLoadModule(null, {
            environment: 'react-server',
            platform: 'web'
        });
    }
    const ensureMemo = ()=>{
        ensurePromise ??= ensureSSRReady();
        return ensurePromise;
    };
    async function getRscRendererAsync(platform) {
        await ensureMemo();
        // NOTE(EvanBacon): We memoize this now that there's a persistent server storage cache for Server Actions.
        if (rscRendererCache.has(platform)) {
            return rscRendererCache.get(platform);
        }
        // TODO: Extract CSS Modules / Assets from the bundler process
        const renderer = await ssrLoadModule('expo-router/build/rsc/rsc-renderer', {
            environment: 'react-server',
            platform
        });
        rscRendererCache.set(platform, renderer);
        return renderer;
    }
    const rscRenderContext = new Map();
    function getRscRenderContext(platform) {
        // NOTE(EvanBacon): We memoize this now that there's a persistent server storage cache for Server Actions.
        if (rscRenderContext.has(platform)) {
            return rscRenderContext.get(platform);
        }
        const context = {};
        rscRenderContext.set(platform, context);
        return context;
    }
    async function renderRscToReadableStream({ input, headers, method, platform, body, engine, contentType, ssrManifest, decodedBody, routerOptions }, isExporting = instanceMetroOptions.isExporting) {
        (0, _assert().default)(isExporting != null, 'The server must be started before calling renderRscToReadableStream.');
        if (method === 'POST') {
            (0, _assert().default)(body, 'Server request must be provided when method is POST (server actions)');
        }
        const context = getRscRenderContext(platform);
        context['__expo_requestHeaders'] = headers;
        const { renderRsc } = await getRscRendererAsync(platform);
        return renderRsc({
            body,
            decodedBody,
            context,
            config: {},
            input,
            contentType
        }, {
            isExporting,
            entries: await getExpoRouterRscEntriesGetterAsync({
                platform,
                routerOptions
            }),
            resolveClientEntry: getResolveClientEntry({
                platform,
                engine,
                ssrManifest
            }),
            async loadServerModuleRsc (urlFragment) {
                const serverRoot = getMetroServerRootMemo(projectRoot);
                debug('[SSR] loadServerModuleRsc:', urlFragment);
                const options = (0, _metroOptions.getMetroOptionsFromUrl)(urlFragment);
                return ssrLoadModule(_path().default.join(serverRoot, options.mainModuleName), options, {
                    hot: true
                });
            }
        });
    }
    return {
        // Get the static client boundaries (no dead code elimination allowed) for the production export.
        getExpoRouterClientReferencesAsync,
        exportServerActionsAsync,
        async exportRoutesAsync ({ platform, ssrManifest, routerOptions }, files) {
            // TODO: When we add web SSR support, we need to extract CSS Modules / Assets from the bundler process to prevent FLOUC.
            const { getBuildConfig } = (await getExpoRouterRscEntriesGetterAsync({
                platform,
                routerOptions
            })).default;
            // Get all the routes to render.
            const buildConfig = await getBuildConfig(async ()=>// TODO: Rework prefetching code to use Metro runtime.
                []);
            await Promise.all(Array.from(buildConfig).map(async ({ entries })=>{
                for (const { input, isStatic } of entries || []){
                    if (!isStatic) {
                        debug('Skipping static export for route', {
                            input
                        });
                        continue;
                    }
                    const destRscFile = _path().default.join('_flight', platform, encodeInput(input));
                    const pipe = await renderRscToReadableStream({
                        input,
                        method: 'GET',
                        platform,
                        headers: new Headers(),
                        ssrManifest,
                        routerOptions
                    }, true);
                    const rsc = await (0, _stream.streamToStringAsync)(pipe);
                    debug('RSC Payload', {
                        platform,
                        input,
                        rsc
                    });
                    files.set(destRscFile, {
                        contents: rsc,
                        targetDomain: 'client',
                        rscId: input
                    });
                }
            }));
        },
        middleware: (0, _createBuiltinAPIRequestHandler.createBuiltinAPIRequestHandler)(// Match `/_flight/[platform]/[...path]`
        (req)=>{
            return getFullUrl(req.url).pathname.startsWith(rscPathPrefix);
        }, rscMiddleware),
        onReloadRscEvent: (platform)=>{
            // NOTE: We cannot clear the renderer context because it would break the mounted context state.
            rscRendererCache.delete(platform);
            routerCache.delete(platform);
        }
    };
}
const getFullUrl = (url)=>{
    try {
        return new URL(url);
    } catch  {
        return new URL(url, 'http://localhost:0');
    }
};
const fileURLToFilePath = (fileURL)=>{
    try {
        return _url().default.fileURLToPath(fileURL);
    } catch (error) {
        if (error instanceof TypeError) {
            throw Error(`Invalid URL: ${fileURL}`, {
                cause: error
            });
        }
        throw error;
    }
};
const encodeInput = (input)=>{
    if (input === '') {
        return 'index.txt';
    }
    if (input === 'index') {
        throw new Error('Input should not be `index`');
    }
    if (input.startsWith('/')) {
        throw new Error('Input should not start with `/`');
    }
    if (input.endsWith('/')) {
        throw new Error('Input should not end with `/`');
    }
    return input + '.txt';
};
function wrapBundle(str) {
    // Skip the metro runtime so debugging is a bit easier.
    // Replace the __r() call with an export statement.
    // Use gm to apply to the last require line. This is needed when the bundle has side-effects.
    return str.replace(/^(__r\(.*\);)$/gm, 'module.exports = $1');
}

//# sourceMappingURL=createServerComponentsMiddleware.js.map