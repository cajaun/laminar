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
    getVersionedDependenciesAsync: function() {
        return getVersionedDependenciesAsync;
    },
    isDependencyVersionIncorrect: function() {
        return isDependencyVersionIncorrect;
    },
    logIncorrectDependencies: function() {
        return logIncorrectDependencies;
    },
    validateDependenciesVersionsAsync: function() {
        return validateDependenciesVersionsAsync;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
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
function _npmpackagearg() {
    const data = /*#__PURE__*/ _interop_require_default(require("npm-package-arg"));
    _npmpackagearg = function() {
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
function _subset() {
    const data = /*#__PURE__*/ _interop_require_default(require("semver/ranges/subset"));
    _subset = function() {
        return data;
    };
    return data;
}
const _getVersionedPackages = require("./getVersionedPackages");
const _resolvePackages = require("./resolvePackages");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _env = require("../../../utils/env");
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
const debug = require('debug')('expo:doctor:dependencies:validate');
async function validateDependenciesVersionsAsync(projectRoot, exp, pkg, packagesToCheck) {
    if (_env.env.EXPO_OFFLINE) {
        _log.warn('Skipping dependency validation in offline mode');
        return null;
    } else if (_env.env.EXPO_NO_DEPENDENCY_VALIDATION) {
        debug('Dependency validation is disabled through EXPO_NO_DEPENDENCY_VALIDATION=1');
        return null;
    }
    const incorrectDeps = await getVersionedDependenciesAsync(projectRoot, exp, pkg, packagesToCheck);
    return logIncorrectDependencies(incorrectDeps);
}
function logInvalidDependency({ packageName, expectedVersionOrRange, actualVersion }) {
    _log.warn((0, _chalk().default)`  {bold ${packageName}}{cyan @}{red ${actualVersion}} - expected version: {green ${expectedVersionOrRange}}`);
}
function logIncorrectDependencies(incorrectDeps) {
    if (!incorrectDeps.length) {
        return true;
    }
    _log.warn((0, _chalk().default)`The following packages should be updated for best compatibility with the installed {bold expo} version:`);
    incorrectDeps.forEach((dep)=>logInvalidDependency(dep));
    _log.warn('Your project may not work correctly until you install the expected versions of the packages.');
    return false;
}
async function getVersionedDependenciesAsync(projectRoot, exp, pkg, packagesToCheck) {
    var _pkg_expo_install, _pkg_expo;
    // This should never happen under normal circumstances since
    // the CLI is versioned in the `expo` package.
    (0, _assert().default)(exp.sdkVersion, 'SDK Version is missing');
    // Get from both endpoints and combine the known package versions.
    const combinedKnownPackages = await (0, _getVersionedPackages.getCombinedKnownVersionsAsync)({
        projectRoot,
        sdkVersion: exp.sdkVersion
    });
    // debug(`Known dependencies: %O`, combinedKnownPackages);
    const resolvedDependencies = (packagesToCheck == null ? void 0 : packagesToCheck.length) ? getFilteredObject(packagesToCheck, {
        ...pkg.dependencies,
        ...pkg.devDependencies
    }) : {
        ...pkg.dependencies,
        ...pkg.devDependencies
    };
    debug(`Checking dependencies for ${exp.sdkVersion}: %O`, resolvedDependencies);
    // intersection of packages from package.json and bundled native modules
    const { known: resolvedPackagesToCheck, unknown } = getPackagesToCheck(combinedKnownPackages, resolvedDependencies);
    debug(`Comparing known versions: %O`, resolvedPackagesToCheck);
    debug(`Skipping packages that cannot be versioned automatically: %O`, unknown);
    // read package versions from the file system (node_modules)
    const packageVersions = await (0, _resolvePackages.resolveAllPackageVersionsAsync)(projectRoot, resolvedPackagesToCheck);
    debug(`Package versions: %O`, packageVersions);
    // find incorrect dependencies by comparing the actual package versions with the bundled native module version ranges
    let incorrectDeps = findIncorrectDependencies(pkg, packageVersions, combinedKnownPackages);
    debug(`Incorrect dependencies: %O`, incorrectDeps);
    if (pkg == null ? void 0 : (_pkg_expo = pkg.expo) == null ? void 0 : (_pkg_expo_install = _pkg_expo.install) == null ? void 0 : _pkg_expo_install.exclude) {
        const packagesToExclude = pkg.expo.install.exclude;
        // Parse the exclude list to ensure we can factor in any specified version ranges
        const parsedPackagesToExclude = packagesToExclude.reduce((acc, packageName)=>{
            const npaResult = (0, _npmpackagearg().default)(packageName);
            if (typeof npaResult.name === 'string') {
                acc[npaResult.name] = npaResult;
            } else {
                acc[packageName] = npaResult;
            }
            return acc;
        }, {});
        const incorrectAndExcludedDeps = incorrectDeps.filter((dep)=>{
            if (parsedPackagesToExclude[dep.packageName]) {
                const { name, raw, rawSpec, type } = parsedPackagesToExclude[dep.packageName];
                const suggestedRange = combinedKnownPackages[name];
                // If only the package name itself is specified, then we keep it in the exclude list
                if (name === raw) {
                    return true;
                } else if (type === 'version') {
                    return suggestedRange === rawSpec;
                } else if (type === 'range') {
                    // Fall through exclusions if the suggested range is invalid
                    if (!_semver().default.validRange(suggestedRange)) {
                        debug(`Invalid semver range in combined known packages for package ${name} in expo.install.exclude: %O`, suggestedRange);
                        return false;
                    }
                    return (0, _subset().default)(suggestedRange, rawSpec);
                } else {
                    debug(`Unsupported npm package argument type for package ${name} in expo.install.exclude: %O`, type);
                }
            }
            return false;
        }).map((dep)=>dep.packageName);
        debug(`Incorrect dependency warnings filtered out by expo.install.exclude: %O`, incorrectAndExcludedDeps);
        incorrectDeps = incorrectDeps.filter((dep)=>!incorrectAndExcludedDeps.includes(dep.packageName));
    }
    return incorrectDeps;
}
function getFilteredObject(keys, object) {
    return keys.reduce((acc, key)=>{
        acc[key] = object[key];
        return acc;
    }, {});
}
function getPackagesToCheck(bundledNativeModules, dependencies) {
    const dependencyNames = Object.keys(dependencies ?? {});
    const known = [];
    const unknown = [];
    for (const dependencyName of dependencyNames){
        if (dependencyName in bundledNativeModules) {
            known.push(dependencyName);
        } else {
            unknown.push(dependencyName);
        }
    }
    return {
        known,
        unknown
    };
}
function findIncorrectDependencies(pkg, packageVersions, bundledNativeModules) {
    const packages = Object.keys(packageVersions);
    const incorrectDeps = [];
    for (const packageName of packages){
        const expectedVersionOrRange = bundledNativeModules[packageName];
        const actualVersion = packageVersions[packageName];
        if (isDependencyVersionIncorrect(packageName, actualVersion, expectedVersionOrRange)) {
            incorrectDeps.push({
                packageName,
                packageType: findDependencyType(pkg, packageName),
                expectedVersionOrRange,
                actualVersion
            });
        }
    }
    return incorrectDeps;
}
function isDependencyVersionIncorrect(packageName, actualVersion, expectedVersionOrRange) {
    if (!expectedVersionOrRange) {
        return false;
    }
    // we never want to go backwards with the expo patch version
    if (packageName === 'expo') {
        return _semver().default.ltr(actualVersion, expectedVersionOrRange);
    }
    // For all other packages, check if the actual version satisfies the expected range
    const satisfies = _semver().default.satisfies(actualVersion, expectedVersionOrRange, {
        includePrerelease: true
    });
    return !satisfies;
}
function findDependencyType(pkg, packageName) {
    if (pkg.devDependencies && packageName in pkg.devDependencies) {
        return 'devDependencies';
    }
    return 'dependencies';
}

//# sourceMappingURL=validateDependenciesVersions.js.map