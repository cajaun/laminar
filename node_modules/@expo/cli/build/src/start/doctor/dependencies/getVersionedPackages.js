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
    getCombinedKnownVersionsAsync: function() {
        return getCombinedKnownVersionsAsync;
    },
    getOperationLog: function() {
        return getOperationLog;
    },
    getRemoteVersionsForSdkAsync: function() {
        return getRemoteVersionsForSdkAsync;
    },
    getVersionedPackagesAsync: function() {
        return getVersionedPackagesAsync;
    }
});
function _npmpackagearg() {
    const data = /*#__PURE__*/ _interop_require_default(require("npm-package-arg"));
    _npmpackagearg = function() {
        return data;
    };
    return data;
}
const _bundledNativeModules = require("./bundledNativeModules");
const _resolvePackages = require("./resolvePackages");
const _getVersions = require("../../../api/getVersions");
const _log = require("../../../log");
const _env = require("../../../utils/env");
const _errors = require("../../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:doctor:dependencies:getVersionedPackages');
/** Adds `react-dom`, `react`, and `react-native` to the list of known package versions (`relatedPackages`) */ function normalizeSdkVersionObject(version) {
    if (!version) {
        return {};
    }
    const { relatedPackages, facebookReactVersion, facebookReactNativeVersion, expoVersion } = version;
    const reactVersion = facebookReactVersion ? {
        react: facebookReactVersion,
        'react-dom': facebookReactVersion
    } : undefined;
    const expoVersionIfAvailable = expoVersion ? {
        expo: expoVersion
    } : undefined;
    return {
        ...relatedPackages,
        ...reactVersion,
        ...expoVersionIfAvailable,
        'react-native': facebookReactNativeVersion
    };
}
async function getCombinedKnownVersionsAsync({ projectRoot, sdkVersion, skipCache }) {
    const skipRemoteVersions = await (0, _resolvePackages.hasExpoCanaryAsync)(projectRoot);
    if (skipRemoteVersions) {
        _log.Log.warn('Dependency validation might be unreliable when using canary SDK versions');
    }
    const bundledNativeModules = sdkVersion ? await (0, _bundledNativeModules.getVersionedNativeModulesAsync)(projectRoot, sdkVersion, {
        skipRemoteVersions
    }) : {};
    const versionsForSdk = !skipRemoteVersions ? await getRemoteVersionsForSdkAsync({
        sdkVersion,
        skipCache
    }) : {};
    return {
        ...bundledNativeModules,
        // Prefer the remote versions over the bundled versions, this enables us to push
        // emergency fixes that users can access without having to update the `expo` package.
        ...versionsForSdk
    };
}
async function getRemoteVersionsForSdkAsync({ sdkVersion, skipCache } = {}) {
    if (_env.env.EXPO_OFFLINE) {
        _log.Log.warn('Dependency validation is unreliable in offline-mode');
        return {};
    }
    try {
        const { sdkVersions } = await (0, _getVersions.getVersionsAsync)({
            skipCache
        });
        // We only want versioned dependencies so skip if they cannot be found.
        if (!sdkVersion || !(sdkVersion in sdkVersions)) {
            debug(`Skipping versioned dependencies because the SDK version is not found. (sdkVersion: ${sdkVersion}, available: ${Object.keys(sdkVersions).join(', ')})`);
            return {};
        }
        const version = sdkVersions[sdkVersion];
        return normalizeSdkVersionObject(version);
    } catch (error) {
        if (error instanceof _errors.CommandError && error.code === 'OFFLINE') {
            return getRemoteVersionsForSdkAsync({
                sdkVersion,
                skipCache
            });
        }
        throw error;
    }
}
async function getVersionedPackagesAsync(projectRoot, { packages, sdkVersion, pkg }) {
    const versionsForSdk = await getCombinedKnownVersionsAsync({
        projectRoot,
        sdkVersion,
        skipCache: true
    });
    let nativeModulesCount = 0;
    let othersCount = 0;
    const excludedNativeModules = [];
    const versionedPackages = packages.map((arg)=>{
        const { name, type, raw, rawSpec } = (0, _npmpackagearg().default)(arg);
        if ([
            'tag',
            'version',
            'range'
        ].includes(type) && name && versionsForSdk[name]) {
            var _pkg_expo_install_exclude, _pkg_expo_install, _pkg_expo;
            // Unimodule packages from npm registry are modified to use the bundled version.
            // Some packages have the recommended version listed in https://exp.host/--/api/v2/versions.
            const isExcludedFromValidation = pkg == null ? void 0 : (_pkg_expo = pkg.expo) == null ? void 0 : (_pkg_expo_install = _pkg_expo.install) == null ? void 0 : (_pkg_expo_install_exclude = _pkg_expo_install.exclude) == null ? void 0 : _pkg_expo_install_exclude.includes(name);
            const hasSpecifiedExactVersion = rawSpec !== '' && rawSpec !== '*';
            if (isExcludedFromValidation || hasSpecifiedExactVersion) {
                othersCount++;
                excludedNativeModules.push({
                    name,
                    bundledNativeVersion: versionsForSdk[name],
                    isExcludedFromValidation,
                    specifiedVersion: hasSpecifiedExactVersion ? rawSpec : ''
                });
                return raw;
            }
            nativeModulesCount++;
            return `${name}@${versionsForSdk[name]}`;
        } else {
            // Other packages are passed through unmodified.
            othersCount++;
            return raw;
        }
    });
    const messages = getOperationLog({
        othersCount,
        nativeModulesCount,
        sdkVersion
    });
    return {
        packages: versionedPackages,
        messages,
        excludedNativeModules
    };
}
function getOperationLog({ nativeModulesCount, sdkVersion, othersCount }) {
    return [
        nativeModulesCount > 0 && `${nativeModulesCount} SDK ${sdkVersion} compatible native ${nativeModulesCount === 1 ? 'module' : 'modules'}`,
        othersCount > 0 && `${othersCount} other ${othersCount === 1 ? 'package' : 'packages'}`
    ].filter(Boolean);
}

//# sourceMappingURL=getVersionedPackages.js.map