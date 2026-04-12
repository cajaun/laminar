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
    attachAtlasAsync: function() {
        return attachAtlasAsync;
    },
    waitUntilAtlasExportIsReadyAsync: function() {
        return waitUntilAtlasExportIsReadyAsync;
    }
});
const _AtlasPrerequisite = require("./AtlasPrerequisite");
const _env = require("../../../../utils/env");
const debug = require('debug')('expo:metro:debugging:attachAtlas');
async function attachAtlasAsync(options) {
    if (!_env.env.EXPO_ATLAS) {
        return;
    }
    debug('Atlas is enabled, initializing for this project...');
    await new _AtlasPrerequisite.AtlasPrerequisite(options.projectRoot).bootstrapAsync({
        exp: options.exp
    });
    return !options.isExporting ? attachAtlasToDevServer(options) : await attachAtlasToExport(options);
}
/**
 * Attach Atlas to the Metro bundler for development mode.
 * This includes attaching to Metro's middleware stack to host the Atlas UI.
 */ function attachAtlasToDevServer(options) {
    if (!options.middleware) {
        throw new Error('Expected middleware to be provided for Atlas when running in development mode');
    }
    const atlas = importAtlasForDev(options.projectRoot);
    if (!atlas) {
        return debug('Atlas is not installed in the project, skipping initialization');
    }
    // TODO(@kitten): Atlas' typings don't match @expo/metro yet
    const instance = atlas.createExpoAtlasMiddleware(options.metroConfig);
    options.middleware.use('/_expo/atlas', instance.middleware);
    debug('Attached Atlas middleware for development on: /_expo/atlas');
    return instance;
}
function importAtlasForDev(projectRoot) {
    try {
        return require(require.resolve('expo-atlas/cli', {
            paths: [
                projectRoot
            ]
        }));
    } catch (error) {
        debug('Failed to load Atlas from project:', error);
        return null;
    }
}
/**
 * Attach Atlas to the Metro bundler for exporting mode.
 * This only includes attaching the custom serializer to the Metro config.
 */ async function attachAtlasToExport(options) {
    const atlas = importAtlasForExport(options.projectRoot);
    if (!atlas) {
        return debug('Atlas is not installed in the project, skipping initialization');
    }
    if (options.resetAtlasFile) {
        const filePath = await atlas.resetExpoAtlasFile(options.projectRoot);
        debug('(Re)created Atlas file at:', filePath);
    }
    // TODO(@kitten): Atlas' typings don't match @expo/metro yet
    atlas.withExpoAtlas(options.metroConfig);
    debug('Attached Atlas to Metro config for exporting');
}
function importAtlasForExport(projectRoot) {
    try {
        return require(require.resolve('expo-atlas/metro', {
            paths: [
                projectRoot
            ]
        }));
    } catch (error) {
        debug('Failed to load Atlas from project:', error);
        return null;
    }
}
async function waitUntilAtlasExportIsReadyAsync(projectRoot) {
    if (!_env.env.EXPO_ATLAS) return;
    const atlas = importAtlasForExport(projectRoot);
    if (!atlas) {
        return debug('Atlas is not loaded, cannot wait for export to finish');
    }
    if (typeof atlas.waitUntilAtlasFileReady !== 'function') {
        return debug('Atlas is outdated, cannot wait for export to finish');
    }
    debug('Waiting for Atlas to finish exporting...');
    await atlas.waitUntilAtlasFileReady();
    debug('Atlas export is ready');
}

//# sourceMappingURL=attachAtlas.js.map