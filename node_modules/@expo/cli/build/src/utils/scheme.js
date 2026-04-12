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
    getOptionalDevClientSchemeAsync: function() {
        return getOptionalDevClientSchemeAsync;
    },
    getSchemesForAndroidAsync: function() {
        return getSchemesForAndroidAsync;
    },
    getSchemesForIosAsync: function() {
        return getSchemesForIosAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
        return data;
    };
    return data;
}
function _getInfoPlistPath() {
    const data = require("@expo/config-plugins/build/ios/utils/getInfoPlistPath");
    _getInfoPlistPath = function() {
        return data;
    };
    return data;
}
function _plist() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/plist"));
    _plist = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
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
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _array = require("./array");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _clearNativeFolder = require("../prebuild/clearNativeFolder");
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
const debug = require('debug')('expo:utils:scheme');
// sort longest to ensure uniqueness.
// this might be undesirable as it causes the QR code to be longer.
function sortLongest(obj) {
    return obj.sort((a, b)=>b.length - a.length);
}
/**
 * Resolve the scheme for the dev client using two methods:
 *   - filter on known Expo schemes, starting with `exp+`, avoiding 3rd party schemes.
 *   - filter on longest to ensure uniqueness.
 */ function resolveExpoOrLongestScheme(schemes) {
    const expoOnlySchemes = schemes.filter((scheme)=>scheme.startsWith('exp+'));
    return expoOnlySchemes.length > 0 ? sortLongest(expoOnlySchemes) : sortLongest(schemes);
}
async function getSchemesForIosAsync(projectRoot) {
    try {
        const infoPlistBuildProperty = (0, _getInfoPlistPath().getInfoPlistPathFromPbxproj)(projectRoot);
        debug(`ios application Info.plist path:`, infoPlistBuildProperty);
        if (infoPlistBuildProperty) {
            const configPath = _path().default.join(projectRoot, 'ios', infoPlistBuildProperty);
            const rawPlist = _fs().default.readFileSync(configPath, 'utf8');
            const plistObject = _plist().default.parse(rawPlist);
            const schemes = _configplugins().IOSConfig.Scheme.getSchemesFromPlist(plistObject);
            debug(`ios application schemes:`, schemes);
            return resolveExpoOrLongestScheme(schemes);
        }
    } catch (error) {
        debug(`expected error collecting ios application schemes for the main target:`, error);
    }
    // No ios folder or some other error
    return [];
}
async function getSchemesForAndroidAsync(projectRoot) {
    try {
        const configPath = await _configplugins().AndroidConfig.Paths.getAndroidManifestAsync(projectRoot);
        const manifest = await _configplugins().AndroidConfig.Manifest.readAndroidManifestAsync(configPath);
        const schemes = await _configplugins().AndroidConfig.Scheme.getSchemesFromManifest(manifest);
        debug(`android application schemes:`, schemes);
        return resolveExpoOrLongestScheme(schemes);
    } catch (error) {
        debug(`expected error collecting android application schemes for the main activity:`, error);
        // No android folder or some other error
        return [];
    }
}
// TODO: Revisit and test after run code is merged.
async function getManagedDevClientSchemeAsync(projectRoot) {
    const { exp } = (0, _config().getConfig)(projectRoot);
    try {
        const getDefaultScheme = require((0, _resolvefrom().default)(projectRoot, 'expo-dev-client/getDefaultScheme'));
        const scheme = getDefaultScheme(exp);
        return scheme;
    } catch  {
        _log.warn('\nDevelopment build: Unable to determine the default URI scheme for deep linking into the app. Ensure that the expo-dev-client package is installed.');
        return null;
    }
}
async function getOptionalDevClientSchemeAsync(projectRoot) {
    const [hasIos, hasAndroid] = await Promise.all([
        (0, _clearNativeFolder.hasRequiredIOSFilesAsync)(projectRoot),
        (0, _clearNativeFolder.hasRequiredAndroidFilesAsync)(projectRoot)
    ]);
    const [ios, android] = await Promise.all([
        getSchemesForIosAsync(projectRoot),
        getSchemesForAndroidAsync(projectRoot)
    ]);
    // Allow managed projects
    if (!hasIos && !hasAndroid) {
        return {
            scheme: await getManagedDevClientSchemeAsync(projectRoot),
            resolution: 'config'
        };
    }
    // Allow for only one native project to exist.
    if (!hasIos) {
        return {
            scheme: android[0],
            resolution: 'android'
        };
    } else if (!hasAndroid) {
        return {
            scheme: ios[0],
            resolution: 'ios'
        };
    } else {
        return {
            scheme: (0, _array.intersecting)(ios, android)[0],
            resolution: 'shared'
        };
    }
}

//# sourceMappingURL=scheme.js.map