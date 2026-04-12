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
    deserializeEagerKey: function() {
        return deserializeEagerKey;
    },
    getExportEmbedOptionsKey: function() {
        return getExportEmbedOptionsKey;
    },
    resolveEagerOptionsAsync: function() {
        return resolveEagerOptionsAsync;
    },
    resolveOptions: function() {
        return resolveOptions;
    }
});
function _paths() {
    const data = require("@expo/config/paths");
    _paths = function() {
        return data;
    };
    return data;
}
function _canonicalize() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro-core/canonicalize"));
    _canonicalize = function() {
        return data;
    };
    return data;
}
function _os() {
    const data = /*#__PURE__*/ _interop_require_default(require("os"));
    _os = function() {
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
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
const _exportHermes = require("../exportHermes");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function assertIsBoolean(val) {
    if (typeof val !== 'boolean') {
        throw new _errors.CommandError(`Expected boolean, got ${typeof val}`);
    }
}
function getBundleEncoding(encoding) {
    return encoding === 'utf8' || encoding === 'utf16le' || encoding === 'ascii' ? encoding : undefined;
}
function resolveOptions(projectRoot, args, parsed) {
    const dev = parsed.args['--dev'] ?? true;
    assertIsBoolean(dev);
    const platform = args['--platform'];
    if (!platform) {
        throw new _errors.CommandError(`Missing required argument: --platform`);
    }
    const bundleOutput = args['--bundle-output'];
    const commonOptions = {
        entryFile: args['--entry-file'] ?? (0, _paths().resolveEntryPoint)(projectRoot, {
            platform
        }),
        assetCatalogDest: args['--asset-catalog-dest'],
        platform,
        transformer: args['--transformer'],
        // TODO: Support `--dev false`
        //   dev: false,
        bundleOutput,
        bundleEncoding: getBundleEncoding(args['--bundle-encoding']) ?? 'utf8',
        maxWorkers: args['--max-workers'],
        sourcemapOutput: args['--sourcemap-output'],
        sourcemapSourcesRoot: args['--sourcemap-sources-root'],
        sourcemapUseAbsolutePath: !!parsed.args['--sourcemap-use-absolute-path'],
        assetsDest: args['--assets-dest'],
        unstableTransformProfile: args['--unstable-transform-profile'],
        resetCache: !!parsed.args['--reset-cache'],
        verbose: args['--verbose'] ?? _env.env.EXPO_DEBUG,
        config: args['--config'] ? _path().default.resolve(args['--config']) : undefined,
        dev,
        minify: parsed.args['--minify'],
        eager: !!parsed.args['--eager'],
        bytecode: parsed.args['--bytecode']
    };
    if (commonOptions.eager) {
        return resolveEagerOptionsAsync(projectRoot, commonOptions);
    }
    // Perform extra assertions after the eager options are resolved.
    if (!bundleOutput) {
        throw new _errors.CommandError(`Missing required argument: --bundle-output`);
    }
    const minify = parsed.args['--minify'] ?? !dev;
    assertIsBoolean(minify);
    return {
        ...commonOptions,
        minify,
        bundleOutput
    };
}
function getTemporaryPath() {
    return _path().default.join(_os().default.tmpdir(), Math.random().toString(36).substring(2));
}
function resolveEagerOptionsAsync(projectRoot, { dev, platform, assetsDest, bundleOutput, minify, ...options }) {
    // If the minify prop is undefined, then check if the project is using hermes.
    minify ??= !(platform === 'android' ? (0, _exportHermes.isAndroidUsingHermes)(projectRoot) : (0, _exportHermes.isIosUsingHermes)(projectRoot));
    let destination;
    if (!assetsDest) {
        destination ??= getTemporaryPath();
        assetsDest = _path().default.join(destination, 'assets');
    }
    if (!bundleOutput) {
        destination ??= getTemporaryPath();
        bundleOutput = platform === 'ios' ? _path().default.join(destination, 'main.jsbundle') : _path().default.join(destination, 'index.js');
    }
    return {
        ...options,
        eager: options.eager ?? true,
        bundleOutput,
        assetsDest,
        entryFile: options.entryFile ?? (0, _paths().resolveEntryPoint)(projectRoot, {
            platform
        }),
        resetCache: !!options.resetCache,
        platform,
        minify,
        dev,
        bundleEncoding: 'utf8',
        sourcemapUseAbsolutePath: false,
        verbose: _env.env.EXPO_DEBUG
    };
}
function getExportEmbedOptionsKey({ // Extract all values that won't change the Metro results.
resetCache, assetsDest, bundleOutput, verbose, maxWorkers, eager, ...options }) {
    // Create a sorted key for the options, removing values that won't change the Metro results.
    return JSON.stringify(options, _canonicalize().default);
}
function deserializeEagerKey(key) {
    return JSON.parse(key);
}

//# sourceMappingURL=resolveOptions.js.map