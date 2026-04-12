// NOTE(@kitten): These are currently only used by expo-updates (expo-updates/utols/src/createManifestForBuildAsync)
// They're re-exported via `expo/internal/cli-unstable-expo-updates-exports` to establish a valid dependency chain
// NOTE for Expo Maintainers: Do not add to this file. We want to remove this
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
    createMetroServerAndBundleRequestAsync: function() {
        return _exportEmbedAsync.createMetroServerAndBundleRequestAsync;
    },
    drawableFileTypes: function() {
        return _metroAssetLocalPath.drawableFileTypes;
    },
    exportEmbedAssetsAsync: function() {
        return _exportEmbedAsync.exportEmbedAssetsAsync;
    }
});
const _metroAssetLocalPath = require("./export/metroAssetLocalPath");
const _exportEmbedAsync = require("./export/embed/exportEmbedAsync");

//# sourceMappingURL=expoUpdatesExports.js.map