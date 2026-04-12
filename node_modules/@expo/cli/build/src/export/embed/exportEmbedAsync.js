/**
 * Copyright © 2023 650 Industries.
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
    createMetroServerAndBundleRequestAsync: function() {
        return createMetroServerAndBundleRequestAsync;
    },
    exportEmbedAssetsAsync: function() {
        return exportEmbedAssetsAsync;
    },
    exportEmbedAsync: function() {
        return exportEmbedAsync;
    },
    exportEmbedBundleAndAssetsAsync: function() {
        return exportEmbedBundleAndAssetsAsync;
    },
    exportEmbedInternalAsync: function() {
        return exportEmbedInternalAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _Server() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro/Server"));
    _Server = function() {
        return data;
    };
    return data;
}
function _splitBundleOptions() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro/lib/splitBundleOptions"));
    _splitBundleOptions = function() {
        return data;
    };
    return data;
}
function _bundle() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/metro/metro/shared/output/bundle"));
    _bundle = function() {
        return data;
    };
    return data;
}
function _getAssets() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro-config/build/transform-worker/getAssets"));
    _getAssets = function() {
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
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _glob() {
    const data = require("glob");
    _glob = function() {
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
const _resolveOptions = require("./resolveOptions");
const _xcodeCompilerLogger = require("./xcodeCompilerLogger");
const _log = require("../../log");
const _DevServerManager = require("../../start/server/DevServerManager");
const _MetroBundlerDevServer = require("../../start/server/metro/MetroBundlerDevServer");
const _instantiateMetro = require("../../start/server/metro/instantiateMetro");
const _DomComponentsMiddleware = require("../../start/server/middleware/DomComponentsMiddleware");
const _metroOptions = require("../../start/server/middleware/metroOptions");
const _ansi = require("../../utils/ansi");
const _dir = require("../../utils/dir");
const _env = require("../../utils/env");
const _nodeEnv = require("../../utils/nodeEnv");
const _exportDomComponents = require("../exportDomComponents");
const _exportHermes = require("../exportHermes");
const _persistMetroAssets = require("../persistMetroAssets");
const _publicFolder = require("../publicFolder");
const _saveAssets = require("../saveAssets");
const _exportServer = require("./exportServer");
const _exit = require("../../utils/exit");
const _filePath = require("../../utils/filePath");
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
const debug = require('debug')('expo:export:embed');
function guessCopiedAppleBundlePath(bundleOutput) {
    // Ensure the path is familiar before guessing.
    if (!bundleOutput.match(/\/Xcode\/DerivedData\/.*\/Build\/Products\//) && !bundleOutput.match(/\/CoreSimulator\/Devices\/.*\/data\/Containers\/Bundle\/Application\//)) {
        debug('Bundling to non-standard location:', bundleOutput);
        return false;
    }
    const bundleName = _path().default.basename(bundleOutput);
    const bundleParent = _path().default.dirname(bundleOutput);
    const possiblePath = (0, _glob().sync)(`*.app/${bundleName}`, {
        cwd: bundleParent,
        absolute: true,
        // bundle identifiers can start with dots.
        dot: true
    })[0];
    debug('Possible path for previous bundle:', possiblePath);
    return possiblePath;
}
async function exportEmbedAsync(projectRoot, options) {
    // The React Native build scripts always enable the cache reset but we shouldn't need this in CI environments.
    // By disabling it, we can eagerly bundle code before the build and reuse the cached artifacts in subsequent builds.
    if (_env.env.CI && options.resetCache) {
        debug('CI environment detected, disabling automatic cache reset');
        options.resetCache = false;
    }
    (0, _nodeEnv.setNodeEnv)(options.dev ? 'development' : 'production');
    require('@expo/env').load(projectRoot);
    // This is an optimized codepath that can occur during `npx expo run` and does not occur during builds from Xcode or Android Studio.
    // Here we reconcile a bundle pass that was run before the native build process. This order can fail faster and is show better errors since the logs won't be obscured by Xcode and Android Studio.
    // This path is also used for automatically deploying server bundles to a remote host.
    const eagerBundleOptions = _env.env.__EXPO_EAGER_BUNDLE_OPTIONS ? (0, _resolveOptions.deserializeEagerKey)(_env.env.__EXPO_EAGER_BUNDLE_OPTIONS) : null;
    if (eagerBundleOptions) {
        // Get the cache key for the current process to compare against the eager key.
        const inputKey = (0, _resolveOptions.getExportEmbedOptionsKey)(options);
        // If the app was bundled previously in the same process, then we should reuse the Metro cache.
        options.resetCache = false;
        if (eagerBundleOptions.key === inputKey) {
            // Copy the eager bundleOutput and assets to the new locations.
            await (0, _dir.removeAsync)(options.bundleOutput);
            (0, _dir.copyAsync)(eagerBundleOptions.options.bundleOutput, options.bundleOutput);
            if (eagerBundleOptions.options.assetsDest && options.assetsDest) {
                (0, _dir.copyAsync)(eagerBundleOptions.options.assetsDest, options.assetsDest);
            }
            console.log('info: Copied output to binary:', options.bundleOutput);
            return;
        }
        // TODO: sourcemapOutput is set on Android but not during eager. This is tolerable since it doesn't invalidate the Metro cache.
        console.log('  Eager key:', eagerBundleOptions.key);
        console.log('Request key:', inputKey);
        // TODO: We may want an analytic event here in the future to understand when this happens.
        console.warn('warning: Eager bundle does not match new options, bundling again.');
    }
    await exportEmbedInternalAsync(projectRoot, options);
    // Ensure the process closes after bundling
    (0, _exit.ensureProcessExitsAfterDelay)();
}
async function exportEmbedInternalAsync(projectRoot, options) {
    // Ensure we delete the old bundle to trigger a failure if the bundle cannot be created.
    await (0, _dir.removeAsync)(options.bundleOutput);
    // The iOS bundle is copied in to the Xcode project, so we need to remove the old one
    // to prevent Xcode from loading the old one after a build failure.
    if (options.platform === 'ios') {
        const previousPath = guessCopiedAppleBundlePath(options.bundleOutput);
        if (previousPath && _fs().default.existsSync(previousPath)) {
            debug('Removing previous iOS bundle:', previousPath);
            await (0, _dir.removeAsync)(previousPath);
        }
    }
    const { bundle, assets, files } = await exportEmbedBundleAndAssetsAsync(projectRoot, options);
    _fs().default.mkdirSync(_path().default.dirname(options.bundleOutput), {
        recursive: true,
        mode: 493
    });
    // On Android, dom components proxy files should write to the assets directory instead of the res directory.
    // We use the bundleOutput directory to get the assets directory.
    const domComponentProxyOutputDir = options.platform === 'android' ? _path().default.dirname(options.bundleOutput) : options.assetsDest;
    const hasDomComponents = domComponentProxyOutputDir && files.size > 0;
    // Persist bundle and source maps.
    await Promise.all([
        _bundle().save(bundle, options, _log.Log.log),
        // Write dom components proxy files.
        hasDomComponents ? (0, _saveAssets.persistMetroFilesAsync)(files, domComponentProxyOutputDir) : null,
        // Copy public folder for dom components only if
        hasDomComponents ? (0, _publicFolder.copyPublicFolderAsync)(_path().default.resolve(projectRoot, _env.env.EXPO_PUBLIC_FOLDER), _path().default.join(domComponentProxyOutputDir, _DomComponentsMiddleware.DOM_COMPONENTS_BUNDLE_DIR)) : null,
        // NOTE(EvanBacon): This may need to be adjusted in the future if want to support baseUrl on native
        // platforms when doing production embeds (unlikely).
        options.assetsDest ? (0, _persistMetroAssets.persistMetroAssetsAsync)(projectRoot, assets, {
            platform: options.platform,
            outputDirectory: options.assetsDest,
            iosAssetCatalogDirectory: options.assetCatalogDest
        }) : null
    ]);
}
async function exportEmbedBundleAndAssetsAsync(projectRoot, options) {
    const devServerManager = await _DevServerManager.DevServerManager.startMetroAsync(projectRoot, {
        minify: options.minify,
        mode: options.dev ? 'development' : 'production',
        port: 8081,
        isExporting: true,
        location: {},
        resetDevServer: options.resetCache,
        maxWorkers: options.maxWorkers
    });
    const devServer = devServerManager.getDefaultDevServer();
    (0, _assert().default)(devServer instanceof _MetroBundlerDevServer.MetroBundlerDevServer);
    const { exp, pkg } = (0, _config().getConfig)(projectRoot, {
        skipSDKVersionRequirement: true
    });
    const isHermes = (0, _exportHermes.isEnableHermesManaged)(exp, options.platform);
    let sourceMapUrl = options.sourcemapOutput;
    if (sourceMapUrl && !options.sourcemapUseAbsolutePath) {
        sourceMapUrl = _path().default.basename(sourceMapUrl);
    }
    const files = new Map();
    try {
        var _exp_experiments, _exp_web, _bundles_artifacts_filter_;
        const bundles = await devServer.nativeExportBundleAsync(exp, {
            // TODO: Re-enable when we get bytecode chunk splitting working again.
            splitChunks: false,
            mainModuleName: (0, _filePath.resolveRealEntryFilePath)(projectRoot, options.entryFile),
            platform: options.platform,
            minify: options.minify,
            mode: options.dev ? 'development' : 'production',
            engine: isHermes ? 'hermes' : undefined,
            serializerIncludeMaps: !!sourceMapUrl,
            bytecode: options.bytecode ?? false,
            // source map inline
            reactCompiler: !!((_exp_experiments = exp.experiments) == null ? void 0 : _exp_experiments.reactCompiler)
        }, files, {
            sourceMapUrl,
            unstable_transformProfile: options.unstableTransformProfile || (isHermes ? 'hermes-stable' : 'default')
        });
        const apiRoutesEnabled = devServer.isReactServerComponentsEnabled || ((_exp_web = exp.web) == null ? void 0 : _exp_web.output) === 'server';
        if (apiRoutesEnabled) {
            await (0, _exportServer.exportStandaloneServerAsync)(projectRoot, devServer, {
                exp,
                pkg,
                files,
                options
            });
        }
        // TODO: Remove duplicates...
        const expoDomComponentReferences = bundles.artifacts.map((artifact)=>Array.isArray(artifact.metadata.expoDomComponentReferences) ? artifact.metadata.expoDomComponentReferences : []).flat();
        if (expoDomComponentReferences.length > 0) {
            await Promise.all(// TODO: Make a version of this which uses `this.metro.getBundler().buildGraphForEntries([])` to bundle all the DOM components at once.
            expoDomComponentReferences.map(async (filePath)=>{
                const { bundle } = await (0, _exportDomComponents.exportDomComponentAsync)({
                    filePath,
                    projectRoot,
                    dev: options.dev,
                    devServer,
                    isHermes,
                    includeSourceMaps: !!sourceMapUrl,
                    exp,
                    files
                });
                if (options.assetsDest) {
                    // Save assets like a typical bundler, preserving the file paths on web.
                    // This is saving web-style inside of a native app's binary.
                    await (0, _persistMetroAssets.persistMetroAssetsAsync)(projectRoot, bundle.assets.map((asset)=>({
                            ...asset,
                            httpServerLocation: _path().default.join(_DomComponentsMiddleware.DOM_COMPONENTS_BUNDLE_DIR, asset.httpServerLocation)
                        })), {
                        files,
                        platform: 'web',
                        outputDirectory: options.assetsDest
                    });
                }
            }));
        }
        return {
            files,
            bundle: {
                code: bundles.artifacts.filter((a)=>a.type === 'js')[0].source,
                // Can be optional when source maps aren't enabled.
                map: (_bundles_artifacts_filter_ = bundles.artifacts.filter((a)=>a.type === 'map')[0]) == null ? void 0 : _bundles_artifacts_filter_.source.toString()
            },
            assets: bundles.assets
        };
    } catch (error) {
        if (isError(error)) {
            // Log using Xcode error format so the errors are picked up by xcodebuild.
            // https://developer.apple.com/documentation/xcode/running-custom-scripts-during-a-build#Log-errors-and-warnings-from-your-script
            if (options.platform === 'ios') {
                // If the error is about to be presented in Xcode, strip the ansi characters from the message.
                if ('message' in error && (0, _xcodeCompilerLogger.isExecutingFromXcodebuild)()) {
                    error.message = (0, _ansi.stripAnsi)(error.message);
                }
                (0, _xcodeCompilerLogger.logMetroErrorInXcode)(projectRoot, error);
            }
        }
        throw error;
    } finally{
        devServerManager.stopAsync();
    }
}
async function createMetroServerAndBundleRequestAsync(projectRoot, options) {
    const exp = (0, _config().getConfig)(projectRoot, {
        skipSDKVersionRequirement: true
    }).exp;
    // TODO: This is slow ~40ms
    const { config } = await (0, _instantiateMetro.loadMetroConfigAsync)(projectRoot, {
        // TODO: This is always enabled in the native script and there's no way to disable it.
        resetCache: options.resetCache,
        maxWorkers: options.maxWorkers
    }, {
        exp,
        isExporting: true,
        getMetroBundler () {
            return server.getBundler().getBundler();
        }
    });
    const isHermes = (0, _exportHermes.isEnableHermesManaged)(exp, options.platform);
    let sourceMapUrl = options.sourcemapOutput;
    if (sourceMapUrl && !options.sourcemapUseAbsolutePath) {
        sourceMapUrl = _path().default.basename(sourceMapUrl);
    }
    // TODO(cedric): check if we can use the proper `bundleType=bundle` and `entryPoint=mainModuleName` properties
    // @ts-expect-error: see above
    const bundleRequest = {
        ..._Server().default.DEFAULT_BUNDLE_OPTIONS,
        ...(0, _metroOptions.getMetroDirectBundleOptionsForExpoConfig)(projectRoot, exp, {
            splitChunks: false,
            mainModuleName: (0, _filePath.resolveRealEntryFilePath)(projectRoot, options.entryFile),
            platform: options.platform,
            minify: options.minify,
            mode: options.dev ? 'development' : 'production',
            engine: isHermes ? 'hermes' : undefined,
            isExporting: true,
            // Never output bytecode in the exported bundle since that is hardcoded in the native run script.
            bytecode: false,
            hosted: false
        }),
        sourceMapUrl,
        unstable_transformProfile: options.unstableTransformProfile || (isHermes ? 'hermes-stable' : 'default')
    };
    const server = new (_Server()).default(config, {
        watch: false
    });
    return {
        server,
        bundleRequest
    };
}
async function exportEmbedAssetsAsync(server, bundleRequest, projectRoot, options) {
    try {
        const { entryFile, onProgress, resolverOptions, transformOptions } = (0, _splitBundleOptions().default)({
            ...bundleRequest,
            // @ts-ignore-error TODO(@kitten): Very unclear why this is here. Remove?
            bundleType: 'todo'
        });
        const dependencies = await server._bundler.getDependencies([
            entryFile
        ], transformOptions, resolverOptions, {
            onProgress,
            shallow: false,
            lazy: false
        });
        const config = server._config;
        return (0, _getAssets().default)(dependencies, {
            processModuleFilter: config.serializer.processModuleFilter,
            assetPlugins: config.transformer.assetPlugins,
            platform: transformOptions.platform,
            // Forked out of Metro because the `this._getServerRootDir()` doesn't match the development
            // behavior.
            projectRoot: config.projectRoot,
            publicPath: config.transformer.publicPath,
            isHosted: false
        });
    } catch (error) {
        if (isError(error)) {
            // Log using Xcode error format so the errors are picked up by xcodebuild.
            // https://developer.apple.com/documentation/xcode/running-custom-scripts-during-a-build#Log-errors-and-warnings-from-your-script
            if (options.platform === 'ios') {
                // If the error is about to be presented in Xcode, strip the ansi characters from the message.
                if ('message' in error && (0, _xcodeCompilerLogger.isExecutingFromXcodebuild)()) {
                    error.message = (0, _ansi.stripAnsi)(error.message);
                }
                (0, _xcodeCompilerLogger.logMetroErrorInXcode)(projectRoot, error);
            }
        }
        throw error;
    }
}
function isError(error) {
    return error instanceof Error;
}

//# sourceMappingURL=exportEmbedAsync.js.map