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
    createDependenciesMap: function() {
        return createDependenciesMap;
    },
    createFileHash: function() {
        return createFileHash;
    },
    hashForDependencyMap: function() {
        return hashForDependencyMap;
    },
    updatePackageJSONAsync: function() {
        return updatePackageJSONAsync;
    },
    updatePkgDependencies: function() {
        return updatePkgDependencies;
    },
    updatePkgScripts: function() {
        return updatePkgScripts;
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
function _crypto() {
    const data = /*#__PURE__*/ _interop_require_default(require("crypto"));
    _crypto = function() {
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
function _semver() {
    const data = require("semver");
    _semver = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _isModuleSymlinked = require("../utils/isModuleSymlinked");
const _ora = require("../utils/ora");
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
async function updatePackageJSONAsync(projectRoot, { templateDirectory, templatePkg = (0, _config().getPackageJson)(templateDirectory), pkg, skipDependencyUpdate }) {
    const updatingPackageJsonStep = (0, _ora.logNewSection)('Updating package.json');
    const results = modifyPackageJson(projectRoot, {
        templatePkg,
        pkg,
        skipDependencyUpdate
    });
    const hasChanges = results.changedDependencies.length || results.scriptsChanged;
    // NOTE: This is effectively bundler caching and subject to breakage if the inputs don't match the mutations.
    if (hasChanges) {
        await _fs().default.promises.writeFile(_path().default.resolve(projectRoot, 'package.json'), // Add new line to match the format of running yarn.
        // This prevents the `package.json` from changing when running `prebuild --no-install` multiple times.
        JSON.stringify(pkg, null, 2) + '\n');
    }
    updatingPackageJsonStep.succeed('Updated package.json' + (hasChanges ? '' : _chalk().default.dim(` | no changes`)));
    return results;
}
/**
 * Make required modifications to the `package.json` file as a JSON object.
 *
 * 1. Update `package.json` `scripts`.
 * 2. Update `package.json` `dependencies` (not `devDependencies`).
 * 3. Update `package.json` `main`.
 *
 * @param projectRoot The root directory of the project.
 * @param templatePkg Template project package.json as JSON.
 * @param pkg Current package.json as JSON.
 * @param skipDependencyUpdate Array of dependencies to skip updating.
 * @returns
 */ function modifyPackageJson(projectRoot, { templatePkg, pkg, skipDependencyUpdate }) {
    const scriptsChanged = updatePkgScripts({
        pkg
    });
    // TODO: Move to `npx expo-doctor`
    return {
        scriptsChanged,
        ...updatePkgDependencies(projectRoot, {
            pkg,
            templatePkg,
            skipDependencyUpdate
        })
    };
}
function updatePkgDependencies(projectRoot, { pkg, templatePkg, skipDependencyUpdate = [] }) {
    const { dependencies } = templatePkg;
    // The default values come from the bare-minimum template's package.json.
    // Users can change this by using different templates with the `--template` flag.
    // The main reason for allowing the changing of dependencies would be to include
    // dependencies that are required for the native project to build. For example,
    // it does not need to include dependencies that are used in the JS-code only.
    const defaultDependencies = createDependenciesMap(dependencies);
    // NOTE: This is a hack to ensure this doesn't trigger an extraneous change in the `package.json`
    // it isn't required for anything in the `ios` and `android` folders.
    delete defaultDependencies['expo-status-bar'];
    // NOTE: Expo splash screen is installed by default in the template but the config plugin also lives in prebuild-config
    // so we can delete it to prevent an extraneous change in the `package.json`.
    delete defaultDependencies['expo-splash-screen'];
    const combinedDependencies = createDependenciesMap({
        ...defaultDependencies,
        ...pkg.dependencies
    });
    // These dependencies are only added, not overwritten from the project
    const requiredDependencies = [
        // TODO: This is no longer required because it's this same package.
        'expo',
        // TODO: Drop this somehow.
        'react-native'
    ].filter((depKey)=>!!defaultDependencies[depKey]);
    const symlinkedPackages = [];
    const nonRecommendedPackages = [];
    for (const dependencyKey of requiredDependencies){
        var _pkg_dependencies;
        // If the local package.json defined the dependency that we want to overwrite...
        if ((_pkg_dependencies = pkg.dependencies) == null ? void 0 : _pkg_dependencies[dependencyKey]) {
            // Then ensure it isn't symlinked (i.e. the user has a custom version in their yarn workspace).
            if ((0, _isModuleSymlinked.isModuleSymlinked)(projectRoot, {
                moduleId: dependencyKey,
                isSilent: true
            })) {
                // If the package is in the project's package.json and it's symlinked, then skip overwriting it.
                symlinkedPackages.push([
                    `${dependencyKey}`,
                    `${dependencyKey}@${defaultDependencies[dependencyKey]}`
                ]);
                continue;
            }
            // Do not modify manually skipped dependencies
            if (skipDependencyUpdate.includes(dependencyKey)) {
                continue;
            }
            // Warn users for outdated dependencies when prebuilding
            const hasRecommendedVersion = versionRangesIntersect(pkg.dependencies[dependencyKey], String(defaultDependencies[dependencyKey]), true);
            if (!hasRecommendedVersion) {
                nonRecommendedPackages.push([
                    `${dependencyKey}@${pkg.dependencies[dependencyKey]}`,
                    `${dependencyKey}@${defaultDependencies[dependencyKey]}`
                ]);
            }
        }
    }
    if (symlinkedPackages.length) {
        symlinkedPackages.forEach(([current, recommended])=>{
            _log.log(`\u203A Using symlinked ${_chalk().default.bold(current)} instead of recommended ${_chalk().default.bold(recommended)}.`);
        });
    }
    if (nonRecommendedPackages.length) {
        nonRecommendedPackages.forEach(([current, recommended])=>{
            _log.warn(`\u203A Using ${_chalk().default.bold(current)} instead of recommended ${_chalk().default.bold(recommended)}.`);
        });
    }
    // Only change the dependencies if the normalized hash changes, this helps to reduce meaningless changes.
    const hasNewDependencies = hashForDependencyMap(pkg.dependencies) !== hashForDependencyMap(combinedDependencies);
    // Save the dependencies
    let changedDependencies = [];
    if (hasNewDependencies) {
        changedDependencies = diffKeys(combinedDependencies, pkg.dependencies ?? {}).sort();
        // Use Object.assign to preserve the original order of dependencies, this makes it easier to see what changed in the git diff.
        pkg.dependencies = Object.assign(pkg.dependencies ?? {}, combinedDependencies);
    }
    return {
        changedDependencies
    };
}
function diffKeys(a, b) {
    return Object.keys(a).filter((key)=>a[key] !== b[key]);
}
function createDependenciesMap(dependencies) {
    if (typeof dependencies !== 'object') {
        throw new Error(`Dependency map is invalid, expected object but got ${typeof dependencies}`);
    } else if (!dependencies) {
        return {};
    }
    const outputMap = {};
    for (const key of Object.keys(dependencies)){
        const value = dependencies[key];
        if (typeof value === 'string') {
            outputMap[key] = value;
        } else {
            throw new Error(`Dependency for key \`${key}\` should be a \`string\`, instead got: \`{ ${key}: ${JSON.stringify(value)} }\``);
        }
    }
    return outputMap;
}
function updatePkgScripts({ pkg }) {
    let hasChanged = false;
    if (!pkg.scripts) {
        pkg.scripts = {};
    }
    if (!pkg.scripts.android || pkg.scripts.android === 'expo start --android' || pkg.scripts.android === 'react-native run-android') {
        pkg.scripts.android = 'expo run:android';
        hasChanged = true;
    }
    if (!pkg.scripts.ios || pkg.scripts.ios === 'expo start --ios' || pkg.scripts.ios === 'react-native run-ios') {
        pkg.scripts.ios = 'expo run:ios';
        hasChanged = true;
    }
    return hasChanged;
}
function normalizeDependencyMap(deps) {
    return Object.keys(deps).map((dependency)=>`${dependency}@${deps[dependency]}`).sort();
}
function hashForDependencyMap(deps = {}) {
    const depsList = normalizeDependencyMap(deps);
    const depsString = depsList.join('\n');
    return createFileHash(depsString);
}
function createFileHash(contents) {
    // this doesn't need to be secure, the shorter the better.
    return _crypto().default.createHash('sha1').update(contents).digest('hex');
}
/**
 * Determine if two semver ranges are overlapping or intersecting.
 * This is a safe version of `semver.intersects` that does not throw.
 */ function versionRangesIntersect(rangeA, rangeB, includePrerelease = false) {
    try {
        return (0, _semver().intersects)(rangeA, rangeB, {
            includePrerelease
        });
    } catch  {
        return false;
    }
}

//# sourceMappingURL=updatePackageJson.js.map