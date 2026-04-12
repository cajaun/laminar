"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createMetadataJson", {
    enumerable: true,
    get: function() {
        return createMetadataJson;
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
function createMetadataJson({ bundles, fileNames, embeddedHashSet, domComponentAssetsMetadata }) {
    // Build metadata.json
    return {
        version: 0,
        bundler: 'metro',
        fileMetadata: Object.entries(bundles).reduce((metadata, [platform, bundle])=>{
            if (platform === 'web') return metadata;
            // Collect all of the assets and convert them to the serial format.
            const assets = bundle.assets.filter((asset)=>!embeddedHashSet || !embeddedHashSet.has(asset.hash)).map((asset)=>{
                var // Each asset has multiple hashes which we convert and then flatten.
                _asset_fileHashes;
                return (_asset_fileHashes = asset.fileHashes) == null ? void 0 : _asset_fileHashes.map((hash)=>({
                        path: _path().default.join('assets', hash),
                        ext: asset.type
                    }));
            }).filter(Boolean).flat();
            if ((domComponentAssetsMetadata == null ? void 0 : domComponentAssetsMetadata[platform]) != null) {
                assets.push(...domComponentAssetsMetadata == null ? void 0 : domComponentAssetsMetadata[platform]);
            }
            return {
                ...metadata,
                [platform]: {
                    // Get the filename for each platform's bundle.
                    // TODO: Add multi-bundle support to EAS Update!!
                    bundle: fileNames[platform][0],
                    assets
                }
            };
        }, {})
    };
}

//# sourceMappingURL=createMetadataJson.js.map