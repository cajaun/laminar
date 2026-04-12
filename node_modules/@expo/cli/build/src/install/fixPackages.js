"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "fixPackagesAsync", {
    enumerable: true,
    get: function() {
        return fixPackagesAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _applyPlugins = require("./applyPlugins");
const _installExpoPackage = require("./installExpoPackage");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _getVersionedPackages = require("../start/doctor/dependencies/getVersionedPackages");
const _array = require("../utils/array");
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
async function fixPackagesAsync(projectRoot, { packages, packageManager, sdkVersion, packageManagerArguments }) {
    if (!packages.length) {
        return;
    }
    const { dependencies = [], devDependencies = [] } = (0, _array.groupBy)(packages, (dep)=>dep.packageType);
    const versioningMessages = (0, _getVersionedPackages.getOperationLog)({
        othersCount: 0,
        nativeModulesCount: packages.length,
        sdkVersion
    });
    // display all packages to update, including expo package
    _log.log((0, _chalk().default)`\u203A Installing ${versioningMessages.length ? versioningMessages.join(' and ') + ' ' : ''}using {bold ${packageManager.name}}`);
    // if updating expo package, install this first, then run expo install --fix again under new version
    const expoDep = dependencies.find((dep)=>dep.packageName === 'expo');
    if (expoDep) {
        await (0, _installExpoPackage.installExpoPackageAsync)(projectRoot, {
            packageManager,
            packageManagerArguments,
            expoPackageToInstall: `expo@${expoDep.expectedVersionOrRange}`,
            followUpCommandArgs: [
                '--fix'
            ]
        });
        // follow-up commands will be spawned in a detached process, so return immediately
        return;
    }
    if (dependencies.length) {
        const versionedPackages = dependencies.map((dep)=>`${dep.packageName}@${dep.expectedVersionOrRange}`);
        await packageManager.addAsync([
            ...packageManagerArguments,
            ...versionedPackages
        ]);
        await (0, _applyPlugins.applyPluginsAsync)(projectRoot, dependencies.map((dep)=>dep.packageName));
    }
    if (devDependencies.length) {
        await packageManager.addDevAsync([
            ...packageManagerArguments,
            ...devDependencies.map((dep)=>`${dep.packageName}@${dep.expectedVersionOrRange}`)
        ]);
    }
}

//# sourceMappingURL=fixPackages.js.map