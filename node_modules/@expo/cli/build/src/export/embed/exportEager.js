"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "exportEagerAsync", {
    enumerable: true,
    get: function() {
        return exportEagerAsync;
    }
});
const _exportEmbedAsync = require("./exportEmbedAsync");
const _resolveOptions = require("./resolveOptions");
const _env = require("../../utils/env");
const debug = require('debug')('expo:eager');
async function exportEagerAsync(projectRoot, { dev, platform, // We default to resetting the cache in non-CI environments since prebundling overwrites the cache reset later.
resetCache = !_env.env.CI, assetsDest, bundleOutput }) {
    const options = await (0, _resolveOptions.resolveEagerOptionsAsync)(projectRoot, {
        dev,
        platform,
        resetCache,
        assetsDest,
        bundleOutput
    });
    debug('Starting eager export: ' + options.bundleOutput);
    await (0, _exportEmbedAsync.exportEmbedInternalAsync)(projectRoot, options);
    debug('Eager export complete');
    return {
        options,
        key: (0, _resolveOptions.getExportEmbedOptionsKey)(options)
    };
}

//# sourceMappingURL=exportEager.js.map