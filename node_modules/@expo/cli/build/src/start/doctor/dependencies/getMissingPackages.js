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
    collectMissingPackages: function() {
        return collectMissingPackages;
    },
    getMissingPackagesAsync: function() {
        return getMissingPackagesAsync;
    },
    mutatePackagesWithKnownVersionsAsync: function() {
        return mutatePackagesWithKnownVersionsAsync;
    },
    versionSatisfiesRequiredPackage: function() {
        return versionSatisfiesRequiredPackage;
    }
});
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
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
function _semver() {
    const data = /*#__PURE__*/ _interop_require_default(require("semver"));
    _semver = function() {
        return data;
    };
    return data;
}
const _getVersionedPackages = require("./getVersionedPackages");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:doctor:dependencies:getMissingPackages');
function collectMissingPackages(projectRoot, requiredPackages) {
    const resolutions = {};
    const missingPackages = requiredPackages.filter((p)=>{
        const resolved = _resolvefrom().default.silent(projectRoot, p.file);
        if (!resolved || !versionSatisfiesRequiredPackage(resolved, p)) {
            return true;
        }
        resolutions[p.pkg] = resolved;
        return false;
    });
    return {
        missing: missingPackages,
        resolutions
    };
}
function versionSatisfiesRequiredPackage(packageJsonFilePath, resolvedPackage) {
    // If the version is specified, check that it satisfies the installed version.
    if (!resolvedPackage.version) {
        debug(`Required package "${resolvedPackage.pkg}" found (no version constraint specified).`);
        return true;
    }
    const pkgJson = _jsonfile().default.read(packageJsonFilePath);
    if (// package.json has version.
    typeof pkgJson.version === 'string' && // semver satisfaction.
    _semver().default.satisfies(pkgJson.version, resolvedPackage.version)) {
        return true;
    }
    debug(`Installed package "${resolvedPackage.pkg}" does not satisfy version constraint "${resolvedPackage.version}" (version: "${pkgJson.version}")`);
    return false;
}
async function getMissingPackagesAsync(projectRoot, { sdkVersion, requiredPackages }) {
    const results = collectMissingPackages(projectRoot, requiredPackages);
    if (!results.missing.length) {
        return results;
    }
    // Ensure the versions are right for the SDK that the project is currently using.
    await mutatePackagesWithKnownVersionsAsync(projectRoot, sdkVersion, results.missing);
    return results;
}
async function mutatePackagesWithKnownVersionsAsync(projectRoot, sdkVersion, packages) {
    // Ensure the versions are right for the SDK that the project is currently using.
    const relatedPackages = await (0, _getVersionedPackages.getCombinedKnownVersionsAsync)({
        projectRoot,
        sdkVersion
    });
    for (const pkg of packages){
        if (// Only use the SDK versions if the package does not already have a hardcoded version.
        // We do this because some packages have API coded into the CLI which expects an exact version.
        !pkg.version && pkg.pkg in relatedPackages) {
            pkg.version = relatedPackages[pkg.pkg];
        }
    }
    return packages;
}

//# sourceMappingURL=getMissingPackages.js.map