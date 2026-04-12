"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "configureProjectAsync", {
    enumerable: true,
    get: function() {
        return configureProjectAsync;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
        return data;
    };
    return data;
}
function _prebuildconfig() {
    const data = require("@expo/prebuild-config");
    _prebuildconfig = function() {
        return data;
    };
    return data;
}
const _configAsync = require("../config/configAsync");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _env = require("../utils/env");
const _getOrPromptApplicationId = require("../utils/getOrPromptApplicationId");
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
async function configureProjectAsync(projectRoot, { platforms, exp, templateChecksum }) {
    let bundleIdentifier;
    if (platforms.includes('ios')) {
        // Check bundle ID before reading the config because it may mutate the config if the user is prompted to define it.
        bundleIdentifier = await (0, _getOrPromptApplicationId.getOrPromptForBundleIdentifierAsync)(projectRoot, exp);
    }
    let packageName;
    if (platforms.includes('android')) {
        // Check package before reading the config because it may mutate the config if the user is prompted to define it.
        packageName = await (0, _getOrPromptApplicationId.getOrPromptForPackageAsync)(projectRoot, exp);
    }
    let { exp: config } = await (0, _prebuildconfig().getPrebuildConfigAsync)(projectRoot, {
        platforms,
        packageName,
        bundleIdentifier
    });
    if (templateChecksum) {
        // Prepare template checksum for the patch mods
        config._internal = config._internal ?? {};
        config._internal.templateChecksum = templateChecksum;
    }
    // compile all plugins and mods
    config = await (0, _configplugins().compileModsAsync)(config, {
        projectRoot,
        platforms,
        assertMissingModProviders: false
    });
    if (_env.env.EXPO_DEBUG) {
        _log.log();
        _log.log('Evaluated config:');
        (0, _configAsync.logConfig)(config);
        _log.log();
    }
    return config;
}

//# sourceMappingURL=configureProjectAsync.js.map