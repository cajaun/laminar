"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createAssetMap", {
    enumerable: true,
    get: function() {
        return createAssetMap;
    }
});
function createAssetMap({ assets }) {
    // Convert the assets array to a k/v pair where the asset hash is the key and the asset is the value.
    return Object.fromEntries(assets.map((asset)=>[
            asset.hash,
            asset
        ]));
}

//# sourceMappingURL=writeContents.js.map