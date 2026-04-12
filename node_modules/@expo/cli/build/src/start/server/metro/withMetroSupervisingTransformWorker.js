"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "withMetroSupervisingTransformWorker", {
    enumerable: true,
    get: function() {
        return withMetroSupervisingTransformWorker;
    }
});
function _metroconfig() {
    const data = require("@expo/metro-config");
    _metroconfig = function() {
        return data;
    };
    return data;
}
const debug = require('debug')('expo:metro:withMetroSupervisingTransformWorker');
// The default babel transformer is either `@expo/metro-config/babel-transformer` set by the user
// or @expo/metro-config/build/babel-transformer
const defaultBabelTransformerPaths = [
    require.resolve('@expo/metro-config/babel-transformer'),
    require.resolve('@expo/metro-config/build/babel-transformer')
];
function withMetroSupervisingTransformWorker(config) {
    var _config_transformer, _config_transformer1;
    // NOTE: This is usually a required property, but we don't always set it in mocks
    const originalBabelTransformerPath = (_config_transformer = config.transformer) == null ? void 0 : _config_transformer.babelTransformerPath;
    const originalTransformerPath = config.transformerPath;
    const hasDefaultTransformerPath = originalTransformerPath === _metroconfig().unstable_transformerPath;
    const hasDefaultBabelTransformerPath = !originalBabelTransformerPath || defaultBabelTransformerPaths.includes(originalBabelTransformerPath);
    if (hasDefaultTransformerPath && hasDefaultBabelTransformerPath) {
        return config;
    }
    // DEBUGGING: When set to false the supervisor is disabled for debugging
    if (((_config_transformer1 = config.transformer) == null ? void 0 : _config_transformer1.expo_customTransformerPath) === false) {
        debug('Skipping transform worker supervisor: transformer.expo_customTransformerPath is false');
        return config;
    }
    // We modify the config if the user either has a custom transformerPath or
    // a custom transformer.babelTransformerPath
    // NOTE: It's not a bad thing if we load the superivising transformer even if
    // we don't need to. It will do nothing to our transformer
    if (!hasDefaultTransformerPath) {
        debug('Detected customized "transformerPath"');
    }
    if (!hasDefaultBabelTransformerPath) {
        debug('Detected customized "transformer.babelTransformerPath"');
    }
    debug('Applying transform worker supervisor to "transformerPath"');
    return {
        ...config,
        transformerPath: _metroconfig().internal_supervisingTransformerPath,
        transformer: {
            ...config.transformer,
            // Only pass the custom transformer path, if the user has set one, otherwise we're only applying
            // the supervisor for the Babel transformer
            expo_customTransformerPath: !hasDefaultTransformerPath ? originalTransformerPath : undefined
        }
    };
}

//# sourceMappingURL=withMetroSupervisingTransformWorker.js.map