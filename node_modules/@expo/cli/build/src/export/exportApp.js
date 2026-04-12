"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "exportAppAsync", {
    enumerable: true,
    get: function() {
        return exportAppAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
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
const _createMetadataJson = require("./createMetadataJson");
const _exportAssets = require("./exportAssets");
const _exportDomComponents = require("./exportDomComponents");
const _exportHermes = require("./exportHermes");
const _exportStaticAsync = require("./exportStaticAsync");
const _favicon = require("./favicon");
const _getPublicExpoManifest = require("./getPublicExpoManifest");
const _publicFolder = require("./publicFolder");
const _saveAssets = require("./saveAssets");
const _writeContents = require("./writeContents");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _WebSupportProjectPrerequisite = require("../start/doctor/web/WebSupportProjectPrerequisite");
const _DevServerManager = require("../start/server/DevServerManager");
const _MetroBundlerDevServer = require("../start/server/metro/MetroBundlerDevServer");
const _router = require("../start/server/metro/router");
const _serializeHtml = require("../start/server/metro/serializeHtml");
const _ManifestMiddleware = require("../start/server/middleware/ManifestMiddleware");
const _metroOptions = require("../start/server/middleware/metroOptions");
const _webTemplate = require("../start/server/webTemplate");
const _env = require("../utils/env");
const _errors = require("../utils/errors");
const _nodeEnv = require("../utils/nodeEnv");
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
async function exportAppAsync(projectRoot, { platforms, outputDir, clear, dev, dumpAssetmap, sourceMaps, minify, bytecode, maxWorkers, skipSSG, hostedNative }) {
    var _exp_web, _exp_web1;
    // Force the environment during export and do not allow overriding it.
    const environment = dev ? 'development' : 'production';
    process.env.NODE_ENV = environment;
    (0, _nodeEnv.setNodeEnv)(environment);
    require('@expo/env').load(projectRoot);
    const projectConfig = (0, _config().getConfig)(projectRoot);
    const exp = await (0, _getPublicExpoManifest.getPublicExpoManifestAsync)(projectRoot, {
        // Web doesn't require validation.
        skipValidation: platforms.length === 1 && platforms[0] === 'web'
    });
    if (platforms.includes('web')) {
        await new _WebSupportProjectPrerequisite.WebSupportProjectPrerequisite(projectRoot).assertAsync();
    }
    const useServerRendering = [
        'static',
        'server'
    ].includes(((_exp_web = exp.web) == null ? void 0 : _exp_web.output) ?? '');
    if (skipSSG && ((_exp_web1 = exp.web) == null ? void 0 : _exp_web1.output) !== 'server') {
        throw new _errors.CommandError('--no-ssg can only be used with `web.output: server`');
    }
    const baseUrl = (0, _metroOptions.getBaseUrlFromExpoConfig)(exp);
    if (!bytecode && (platforms.includes('ios') || platforms.includes('android'))) {
        _log.warn(`Bytecode makes the app startup faster, disabling bytecode is highly discouraged and should only be used for debugging purposes.`);
    }
    // Print out logs
    if (baseUrl) {
        _log.log();
        _log.log(_chalk().default.gray`Using (experimental) base path: ${baseUrl}`);
        // Warn if not using an absolute path.
        if (!baseUrl.startsWith('/')) {
            _log.log(_chalk().default.yellow`  Base path does not start with a slash. Requests will not be absolute.`);
        }
    }
    const mode = dev ? 'development' : 'production';
    const publicPath = _path().default.resolve(projectRoot, _env.env.EXPO_PUBLIC_FOLDER);
    const outputPath = _path().default.resolve(projectRoot, outputDir);
    // Write the JS bundles to disk, and get the bundle file names (this could change with async chunk loading support).
    const files = new Map();
    const devServerManager = await _DevServerManager.DevServerManager.startMetroAsync(projectRoot, {
        minify,
        mode,
        port: 8081,
        isExporting: true,
        location: {},
        resetDevServer: clear,
        maxWorkers
    });
    const devServer = devServerManager.getDefaultDevServer();
    (0, _assert().default)(devServer instanceof _MetroBundlerDevServer.MetroBundlerDevServer);
    const bundles = {};
    const domComponentAssetsMetadata = {};
    const spaPlatforms = // TODO: Support server and static rendering for server component exports.
    useServerRendering && !devServer.isReactServerComponentsEnabled ? platforms.filter((platform)=>platform !== 'web') : platforms;
    try {
        if (devServer.isReactServerComponentsEnabled) {
            // In RSC mode, we only need these to be in the client dir.
            // TODO: Merge back with other copy after we add SSR.
            try {
                await (0, _publicFolder.copyPublicFolderAsync)(publicPath, _path().default.join(outputPath, 'client'));
            } catch (error) {
                _log.error('Failed to copy public directory to dist directory');
                throw error;
            }
        } else {
            // NOTE(kitten): The public folder is currently always copied, regardless of targetDomain
            // split. Hence, there's another separate `copyPublicFolderAsync` call below for `web`
            await (0, _publicFolder.copyPublicFolderAsync)(publicPath, outputPath);
        }
        let templateHtml;
        // Can be empty during web-only SSG.
        if (spaPlatforms.length) {
            await Promise.all(spaPlatforms.map(async (platform)=>{
                // Assert early so the user doesn't have to wait until bundling is complete to find out that
                // Hermes won't be available.
                const isHermes = (0, _exportHermes.isEnableHermesManaged)(exp, platform);
                if (isHermes) {
                    await (0, _exportHermes.assertEngineMismatchAsync)(projectRoot, exp, platform);
                }
                let bundle;
                try {
                    var _exp_experiments;
                    // Run metro bundler and create the JS bundles/source maps.
                    bundle = await devServer.nativeExportBundleAsync(exp, {
                        platform,
                        splitChunks: !_env.env.EXPO_NO_BUNDLE_SPLITTING && (devServer.isReactServerComponentsEnabled && !bytecode || platform === 'web'),
                        mainModuleName: (0, _ManifestMiddleware.getEntryWithServerRoot)(projectRoot, {
                            platform,
                            pkg: projectConfig.pkg
                        }),
                        mode: dev ? 'development' : 'production',
                        engine: isHermes ? 'hermes' : undefined,
                        serializerIncludeMaps: sourceMaps,
                        bytecode: bytecode && isHermes,
                        reactCompiler: !!((_exp_experiments = exp.experiments) == null ? void 0 : _exp_experiments.reactCompiler),
                        hosted: hostedNative
                    }, files);
                } catch (error) {
                    _log.log('');
                    if (error instanceof Error) {
                        _log.exception(error);
                    } else {
                        _log.error('Failed to bundle the app');
                        _log.log(error);
                    }
                    process.exit(1);
                }
                bundles[platform] = bundle;
                (0, _saveAssets.getFilesFromSerialAssets)(bundle.artifacts, {
                    includeSourceMaps: sourceMaps,
                    files,
                    isServerHosted: devServer.isReactServerComponentsEnabled || hostedNative
                });
                // TODO: Remove duplicates...
                const expoDomComponentReferences = bundle.artifacts.map((artifact)=>Array.isArray(artifact.metadata.expoDomComponentReferences) ? artifact.metadata.expoDomComponentReferences : []).flat();
                await Promise.all(// TODO: Make a version of this which uses `this.metro.getBundler().buildGraphForEntries([])` to bundle all the DOM components at once.
                expoDomComponentReferences.map(async (filePath)=>{
                    const { bundle: platformDomComponentsBundle, htmlOutputName } = await (0, _exportDomComponents.exportDomComponentAsync)({
                        filePath,
                        projectRoot,
                        dev,
                        devServer,
                        isHermes,
                        includeSourceMaps: sourceMaps,
                        exp,
                        files,
                        useMd5Filename: true
                    });
                    // Merge the assets from the DOM component into the output assets.
                    // @ts-expect-error: mutate assets
                    bundle.assets.push(...platformDomComponentsBundle.assets);
                    (0, _exportDomComponents.transformNativeBundleForMd5Filename)({
                        domComponentReference: filePath,
                        nativeBundle: bundle,
                        files,
                        htmlOutputName
                    });
                    domComponentAssetsMetadata[platform] = [
                        ...domComponentAssetsMetadata[platform] || [],
                        ...await (0, _exportDomComponents.addDomBundleToMetadataAsync)(platformDomComponentsBundle),
                        ...(0, _exportDomComponents.transformDomEntryForMd5Filename)({
                            files,
                            htmlOutputName
                        })
                    ];
                }));
                if (platform === 'web') {
                    // TODO: Unify with exportStaticAsync
                    // TODO: Maybe move to the serializer.
                    let html = await (0, _serializeHtml.serializeHtmlWithAssets)({
                        isExporting: true,
                        resources: bundle.artifacts,
                        template: await (0, _webTemplate.createTemplateHtmlFromExpoConfigAsync)(projectRoot, {
                            scripts: [],
                            cssLinks: [],
                            exp: projectConfig.exp
                        }),
                        baseUrl
                    });
                    // Add the favicon assets to the HTML.
                    const modifyHtml = await (0, _favicon.getVirtualFaviconAssetsAsync)(projectRoot, {
                        outputDir,
                        baseUrl,
                        files,
                        exp: projectConfig.exp
                    });
                    if (modifyHtml) {
                        html = modifyHtml(html);
                    }
                    // HACK: This is used for adding SSR shims in React Server Components.
                    templateHtml = html;
                    // Generate SPA-styled HTML file.
                    // If web exists, then write the template HTML file.
                    files.set('index.html', {
                        contents: html,
                        targetDomain: devServer.isReactServerComponentsEnabled ? 'server' : 'client'
                    });
                }
            }));
            if (devServer.isReactServerComponentsEnabled) {
                const isWeb = platforms.includes('web');
                await (0, _exportStaticAsync.exportApiRoutesStandaloneAsync)(devServer, {
                    files,
                    platform: 'web',
                    apiRoutesOnly: !isWeb,
                    templateHtml
                });
            }
            // TODO: Use same asset system across platforms again.
            const { assets, embeddedHashSet } = await (0, _exportAssets.exportAssetsAsync)(projectRoot, {
                files,
                exp,
                outputDir: outputPath,
                bundles,
                baseUrl,
                hostedNative
            });
            if (dumpAssetmap) {
                _log.log('Creating asset map');
                files.set('assetmap.json', {
                    contents: JSON.stringify((0, _writeContents.createAssetMap)({
                        assets
                    }))
                });
            }
            const targetDomain = devServer.isReactServerComponentsEnabled ? 'client/' : '';
            const fileNames = Object.fromEntries(Object.entries(bundles).map(([platform, bundle])=>[
                    platform,
                    bundle.artifacts.filter((asset)=>asset.type === 'js').map((asset)=>targetDomain + asset.filename)
                ]));
            // Generate a `metadata.json` for EAS Update.
            const contents = (0, _createMetadataJson.createMetadataJson)({
                bundles,
                fileNames,
                embeddedHashSet,
                domComponentAssetsMetadata
            });
            files.set('metadata.json', {
                contents: JSON.stringify(contents)
            });
        }
        // Additional web-only steps...
        if (platforms.includes('web') && useServerRendering) {
            var _exp_web2;
            const exportServer = ((_exp_web2 = exp.web) == null ? void 0 : _exp_web2.output) === 'server';
            if (exportServer) {
                // TODO: Remove when this is abstracted into the files map
                await (0, _publicFolder.copyPublicFolderAsync)(publicPath, _path().default.resolve(outputPath, 'client'));
            }
            if (skipSSG) {
                _log.log('Skipping static site generation');
                await (0, _exportStaticAsync.exportApiRoutesStandaloneAsync)(devServer, {
                    files,
                    platform: 'web',
                    apiRoutesOnly: true
                });
                // Output a placeholder index.html if one doesn't exist in the public directory.
                // This ensures native + API routes have some content at the root URL.
                const placeholderIndex = _path().default.resolve(outputPath, 'client/index.html');
                if (!_fs().default.existsSync(placeholderIndex)) {
                    files.set('index.html', {
                        contents: `<html><body></body></html>`,
                        targetDomain: 'client'
                    });
                }
            } else if (// TODO: Support static export with RSC.
            !devServer.isReactServerComponentsEnabled) {
                var _exp_experiments;
                await (0, _exportStaticAsync.exportFromServerAsync)(projectRoot, devServer, {
                    mode,
                    files,
                    clear: !!clear,
                    outputDir: outputPath,
                    minify,
                    baseUrl,
                    includeSourceMaps: sourceMaps,
                    routerRoot: (0, _router.getRouterDirectoryModuleIdWithManifest)(projectRoot, exp),
                    reactCompiler: !!((_exp_experiments = exp.experiments) == null ? void 0 : _exp_experiments.reactCompiler),
                    exportServer,
                    maxWorkers,
                    isExporting: true,
                    exp: projectConfig.exp
                });
            }
        }
    } finally{
        await devServerManager.stopAsync();
    }
    // Write all files at the end for unified logging.
    await (0, _saveAssets.persistMetroFilesAsync)(files, outputPath);
}

//# sourceMappingURL=exportApp.js.map