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
    WebSupportProjectPrerequisite: function() {
        return WebSupportProjectPrerequisite;
    },
    isWebPlatformExcluded: function() {
        return isWebPlatformExcluded;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _env = require("../../../utils/env");
const _platformBundlers = require("../../server/platformBundlers");
const _Prerequisite = require("../Prerequisite");
const _ensureDependenciesAsync = require("../dependencies/ensureDependenciesAsync");
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
const debug = require('debug')('expo:doctor:webSupport');
class WebSupportProjectPrerequisite extends _Prerequisite.ProjectPrerequisite {
    /** Ensure a project that hasn't explicitly disabled web support has all the required packages for running in the browser. */ async assertImplementation() {
        if (_env.env.EXPO_NO_WEB_SETUP) {
            _log.warn('Skipping web setup: EXPO_NO_WEB_SETUP is enabled.');
            return;
        }
        debug('Ensuring web support is setup');
        const result = await this._shouldSetupWebSupportAsync();
        // Ensure web packages are installed
        await this._ensureWebDependenciesInstalledAsync({
            exp: result.exp
        });
    }
    /** Exposed for testing. */ async _shouldSetupWebSupportAsync() {
        const config = (0, _config().getConfig)(this.projectRoot);
        // Detect if the 'web' string is purposefully missing from the platforms array.
        if (isWebPlatformExcluded(config.rootConfig)) {
            // Get exact config description with paths.
            const configName = (0, _config().getProjectConfigDescriptionWithPaths)(this.projectRoot, config);
            throw new _Prerequisite.PrerequisiteCommandError('WEB_SUPPORT', (0, _chalk().default)`Skipping web setup: {bold "web"} is not included in the project ${configName} {bold "platforms"} array.`);
        }
        return config;
    }
    /** Exposed for testing. */ async _ensureWebDependenciesInstalledAsync({ exp }) {
        const requiredPackages = [
            {
                file: 'react-dom/package.json',
                pkg: 'react-dom'
            }
        ];
        if (!_env.env.EXPO_NO_REACT_NATIVE_WEB) {
            // use react-native-web/package.json to skip node module cache issues when the user installs
            // the package and attempts to resolve the module in the same process.
            requiredPackages.push({
                file: 'react-native-web/package.json',
                pkg: 'react-native-web'
            });
        }
        const bundler = (0, _platformBundlers.getPlatformBundlers)(this.projectRoot, exp).web;
        // Only include webpack-config if bundler is webpack.
        if (bundler === 'webpack') {
            requiredPackages.push(// `webpack` and `webpack-dev-server` should be installed in the `@expo/webpack-config`
            {
                file: '@expo/webpack-config/package.json',
                pkg: '@expo/webpack-config',
                dev: true
            });
        } else if (bundler === 'metro') {
        // NOTE(@kitten): We used to require `@expo/metro-runtime` here but part of what we required from
        // it has moved out of that package (async-require). Hence, this isn't needed anymore, and if
        // a user has `expo-router`, this is fulfilled anyway.
        /*requiredPackages.push({
        file: '@expo/metro-runtime/package.json',
        pkg: '@expo/metro-runtime',
      });*/ }
        try {
            return await (0, _ensureDependenciesAsync.ensureDependenciesAsync)(this.projectRoot, {
                // This never seems to work when prompting, installing, and running -- instead just inform the user to run the install command and try again.
                skipPrompt: true,
                isProjectMutable: false,
                exp,
                installMessage: `It looks like you're trying to use web support but don't have the required dependencies installed.`,
                warningMessage: (0, _chalk().default)`If you're not using web, please ensure you remove the {bold "web"} string from the platforms array in the project Expo config.`,
                requiredPackages
            });
        } catch (error) {
            // Reset the cached check so we can re-run the check if the user re-runs the command by pressing 'w' in the Terminal UI.
            this.resetAssertion();
            throw error;
        }
    }
}
function isWebPlatformExcluded(rootConfig) {
    var _rootConfig_expo, _rootConfig_expo1, _rootConfig_expo2;
    // Detect if the 'web' string is purposefully missing from the platforms array.
    const isWebExcluded = Array.isArray(rootConfig == null ? void 0 : (_rootConfig_expo = rootConfig.expo) == null ? void 0 : _rootConfig_expo.platforms) && !!((_rootConfig_expo1 = rootConfig.expo) == null ? void 0 : _rootConfig_expo1.platforms.length) && !((_rootConfig_expo2 = rootConfig.expo) == null ? void 0 : _rootConfig_expo2.platforms.includes('web'));
    return isWebExcluded;
}

//# sourceMappingURL=WebSupportProjectPrerequisite.js.map