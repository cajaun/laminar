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
    assetPatternsToBeBundled: function() {
        return assetPatternsToBeBundled;
    },
    exportAssetsAsync: function() {
        return exportAssetsAsync;
    },
    resolveAssetPatternsToBeBundled: function() {
        return resolveAssetPatternsToBeBundled;
    }
});
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _minimatch() {
    const data = require("minimatch");
    _minimatch = function() {
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
const _persistMetroAssets = require("./persistMetroAssets");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _resolveAssets = require("../start/server/middleware/resolveAssets");
const _array = require("../utils/array");
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
const debug = require('debug')('expo:export:exportAssets');
function mapAssetHashToAssetString(asset, hash) {
    return 'asset_' + hash + ('type' in asset && asset.type ? '.' + asset.type : '');
}
function assetPatternsToBeBundled(exp) {
    var _exp_updates_assetPatternsToBeBundled, _exp_updates, _exp_extra_updates_assetPatternsToBeBundled, _exp_extra_updates, _exp_extra;
    // new location for this key
    if ((_exp_updates = exp.updates) == null ? void 0 : (_exp_updates_assetPatternsToBeBundled = _exp_updates.assetPatternsToBeBundled) == null ? void 0 : _exp_updates_assetPatternsToBeBundled.length) {
        return exp.updates.assetPatternsToBeBundled;
    }
    // old, untyped location for this key. we may want to change this to throw in a few SDK versions (deprecated as of SDK 52).
    if ((_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_updates = _exp_extra.updates) == null ? void 0 : (_exp_extra_updates_assetPatternsToBeBundled = _exp_extra_updates.assetPatternsToBeBundled) == null ? void 0 : _exp_extra_updates_assetPatternsToBeBundled.length) {
        return exp.extra.updates.assetPatternsToBeBundled;
    }
    return undefined;
}
/**
 * Given an asset and a set of strings representing the assets to be bundled, returns true if
 * the asset is part of the set to be bundled.
 * @param asset Asset object
 * @param bundledAssetsSet Set of strings
 * @returns true if the asset should be bundled
 */ function assetShouldBeIncludedInExport(asset, bundledAssetsSet) {
    if (!bundledAssetsSet) {
        return true;
    }
    return asset.fileHashes.filter((hash)=>bundledAssetsSet.has(mapAssetHashToAssetString(asset, hash))).length > 0;
}
/**
 * Computes a set of strings representing the assets to be bundled with an export, given an array of assets,
 * and a set of patterns to match
 * @param assets The asset array
 * @param assetPatternsToBeBundled An array of strings with glob patterns to match
 * @param projectRoot The project root
 * @returns A set of asset strings
 */ function setOfAssetsToBeBundled(assets, assetPatternsToBeBundled, projectRoot) {
    // Convert asset patterns to a list of asset strings that match them.
    // Assets strings are formatted as `asset_<hash>.<type>` and represent
    // the name that the file will have in the app bundle. The `asset_` prefix is
    // needed because android doesn't support assets that start with numbers.
    const fullPatterns = assetPatternsToBeBundled.map((p)=>_path().default.join(projectRoot, p));
    logPatterns(fullPatterns);
    const allBundledAssets = assets.map((asset)=>{
        const shouldBundle = shouldBundleAsset(asset, fullPatterns);
        if (shouldBundle) {
            var _asset_files;
            debug(`${shouldBundle ? 'Include' : 'Exclude'} asset ${(_asset_files = asset.files) == null ? void 0 : _asset_files[0]}`);
            return asset.fileHashes.map((hash)=>mapAssetHashToAssetString(asset, hash));
        }
        return [];
    }).flat();
    // The assets returned by the RN packager has duplicates so make sure we
    // only bundle each once.
    return new Set(allBundledAssets);
}
function resolveAssetPatternsToBeBundled(projectRoot, exp, assets) {
    const assetPatternsToBeBundledForConfig = assetPatternsToBeBundled(exp);
    if (!assetPatternsToBeBundledForConfig) {
        return undefined;
    }
    const bundledAssets = setOfAssetsToBeBundled(assets, assetPatternsToBeBundledForConfig, projectRoot);
    return bundledAssets;
}
function logPatterns(patterns) {
    // Only log the patterns in debug mode, if they aren't already defined in the app.json, then all files will be targeted.
    _log.log('\nProcessing asset bundle patterns:');
    patterns.forEach((p)=>_log.log('- ' + p));
}
function shouldBundleAsset(asset, patterns) {
    var _asset_files;
    const file = (_asset_files = asset.files) == null ? void 0 : _asset_files[0];
    return !!('__packager_asset' in asset && asset.__packager_asset && file && patterns.some((pattern)=>(0, _minimatch().minimatch)(file, pattern)));
}
async function exportAssetsAsync(projectRoot, { exp, outputDir, bundles: { web, ...bundles }, baseUrl, files = new Map(), hostedNative }) {
    var _assets_;
    const hostedAssets = web ? [
        ...web.assets
    ] : [];
    // If the native assets should be hosted like web, then we can add them to the hosted assets to export.
    if (hostedNative) {
        hostedAssets.push(...Object.values(bundles).flatMap((bundle)=>bundle.assets ?? []));
    }
    if (hostedAssets.length) {
        // Save assets like a typical bundler, preserving the file paths on web.
        // TODO: Update React Native Web to support loading files from asset hashes.
        await (0, _persistMetroAssets.persistMetroAssetsAsync)(projectRoot, hostedAssets, {
            files,
            platform: 'web',
            outputDirectory: outputDir,
            baseUrl
        });
    }
    if (hostedNative) {
        // Add google services file if it exists
        await (0, _resolveAssets.resolveGoogleServicesFile)(projectRoot, exp);
        return {
            exp,
            assets: [],
            embeddedHashSet: new Set(),
            files
        };
    }
    const assets = (0, _array.uniqBy)(Object.values(bundles).flatMap((bundle)=>bundle.assets), (asset)=>asset.hash);
    let bundledAssetsSet = undefined;
    let filteredAssets = assets;
    const embeddedHashSet = new Set();
    if ((_assets_ = assets[0]) == null ? void 0 : _assets_.fileHashes) {
        debug(`Assets = ${JSON.stringify(assets, null, 2)}`);
        // Updates the manifest to reflect additional asset bundling + configs
        // Get only asset strings for assets we will save
        bundledAssetsSet = resolveAssetPatternsToBeBundled(projectRoot, exp, assets);
        if (bundledAssetsSet) {
            debug(`Bundled assets = ${JSON.stringify([
                ...bundledAssetsSet
            ], null, 2)}`);
            // Filter asset objects to only ones that include assetPatternsToBeBundled matches
            filteredAssets = assets.filter((asset)=>{
                const shouldInclude = assetShouldBeIncludedInExport(asset, bundledAssetsSet);
                if (!shouldInclude) {
                    embeddedHashSet.add(asset.hash);
                }
                return shouldInclude;
            });
            debug(`Filtered assets count = ${filteredAssets.length}`);
        }
        const hashes = new Set();
        // Add assets to copy.
        filteredAssets.forEach((asset)=>{
            const assetId = (0, _persistMetroAssets.getAssetIdForLogGrouping)(projectRoot, asset);
            asset.files.forEach((fp, index)=>{
                const hash = asset.fileHashes[index];
                if (hashes.has(hash)) return;
                hashes.add(hash);
                files.set(_path().default.join('assets', hash), {
                    originFilename: _path().default.relative(projectRoot, fp),
                    contents: _fs().default.readFileSync(fp),
                    assetId
                });
            });
        });
    }
    // Add google services file if it exists
    await (0, _resolveAssets.resolveGoogleServicesFile)(projectRoot, exp);
    return {
        exp,
        assets,
        embeddedHashSet,
        files
    };
}

//# sourceMappingURL=exportAssets.js.map