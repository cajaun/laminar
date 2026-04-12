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
    installAsync: function() {
        return installAsync;
    },
    installPackagesAsync: function() {
        return installPackagesAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _packagemanager() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/package-manager"));
    _packagemanager = function() {
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
const _applyPlugins = require("./applyPlugins");
const _checkPackages = require("./checkPackages");
const _installExpoPackage = require("./installExpoPackage");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _checkPackagesCompatibility = require("./utils/checkPackagesCompatibility");
const _getVersionedPackages = require("../start/doctor/dependencies/getVersionedPackages");
const _env = require("../utils/env");
const _errors = require("../utils/errors");
const _findUp = require("../utils/findUp");
const _link = require("../utils/link");
const _nodeEnv = require("../utils/nodeEnv");
const _strings = require("../utils/strings");
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
async function installAsync(packages, options, packageManagerArguments = []) {
    (0, _nodeEnv.setNodeEnv)('development');
    // Locate the project root based on the process current working directory.
    // This enables users to run `npx expo install` from a subdirectory of the project.
    const projectRoot = (options == null ? void 0 : options.projectRoot) ?? (0, _findUp.findUpProjectRootOrAssert)(process.cwd());
    require('@expo/env').load(projectRoot);
    // Resolve the package manager used by the project, or based on the provided arguments.
    const packageManager = _packagemanager().createForProject(projectRoot, {
        npm: options.npm,
        yarn: options.yarn,
        bun: options.bun,
        pnpm: options.pnpm,
        silent: options.silent,
        log: _log.log
    });
    const expoVersion = findPackageByName(packages, 'expo');
    const otherPackages = packages.filter((pkg)=>pkg !== expoVersion);
    // Abort early when installing `expo@<version>` and other packages with `--fix/--check`
    if (packageHasVersion(expoVersion) && otherPackages.length && (options.check || options.fix)) {
        throw new _errors.CommandError('BAD_ARGS', `Cannot install other packages with ${expoVersion} and --fix or --check`);
    }
    // Only check/fix packages if `expo@<version>` is not requested
    if (!packageHasVersion(expoVersion) && (options.check || options.fix)) {
        return await (0, _checkPackages.checkPackagesAsync)(projectRoot, {
            packages,
            options,
            packageManager,
            packageManagerArguments
        });
    }
    // note(simek): check out the packages compatibility with New Architecture against RND API
    if (!_env.env.EXPO_NO_DEPENDENCY_VALIDATION && !_env.env.EXPO_NO_NEW_ARCH_COMPAT_CHECK) {
        await (0, _checkPackagesCompatibility.checkPackagesCompatibility)(otherPackages);
    }
    // Read the project Expo config without plugins.
    const { exp } = (0, _config().getConfig)(projectRoot, {
        // Sometimes users will add a plugin to the config before installing the library,
        // this wouldn't work unless we dangerously disable plugin serialization.
        skipPlugins: true
    });
    // Resolve the versioned packages, then install them.
    return installPackagesAsync(projectRoot, {
        ...options,
        packageManager,
        packages,
        packageManagerArguments,
        sdkVersion: exp.sdkVersion
    });
}
async function installPackagesAsync(projectRoot, { packages, packageManager, sdkVersion, packageManagerArguments, fix, check, dev }) {
    // Read the project Expo config without plugins.
    const pkg = (0, _config().getPackageJson)(projectRoot);
    //assertNotInstallingExcludedPackages(projectRoot, packages, pkg);
    const versioning = await (0, _getVersionedPackages.getVersionedPackagesAsync)(projectRoot, {
        packages,
        // sdkVersion is always defined because we don't skipSDKVersionRequirement in getConfig.
        sdkVersion,
        pkg
    });
    _log.log((0, _chalk().default)`\u203A Installing ${versioning.messages.length ? versioning.messages.join(' and ') + ' ' : ''}using {bold ${packageManager.name}}`);
    if (versioning.excludedNativeModules.length) {
        const alreadyExcluded = versioning.excludedNativeModules.filter((module)=>module.isExcludedFromValidation);
        const specifiedExactVersion = versioning.excludedNativeModules.filter((module)=>!module.isExcludedFromValidation);
        if (alreadyExcluded.length) {
            _log.log((0, _chalk().default)`\u203A Using ${(0, _strings.joinWithCommasAnd)(alreadyExcluded.map(({ bundledNativeVersion, name, specifiedVersion })=>`${specifiedVersion || 'latest'} instead of  ${bundledNativeVersion} for ${name}`))} because ${alreadyExcluded.length > 1 ? 'they are' : 'it is'} listed in {bold expo.install.exclude} in package.json. ${(0, _link.learnMore)('https://docs.expo.dev/more/expo-cli/#configuring-dependency-validation')}`);
        }
        if (specifiedExactVersion.length) {
            _log.log((0, _chalk().default)`\u203A Using ${(0, _strings.joinWithCommasAnd)(specifiedExactVersion.map(({ bundledNativeVersion, name, specifiedVersion })=>`${specifiedVersion} instead of ${bundledNativeVersion} for ${name}`))} because ${specifiedExactVersion.length > 1 ? 'these versions' : 'this version'} was explicitly provided. Packages excluded from dependency validation should be listed in {bold expo.install.exclude} in package.json. ${(0, _link.learnMore)('https://docs.expo.dev/more/expo-cli/#configuring-dependency-validation')}`);
        }
    }
    // `expo` needs to be installed before installing other packages
    const expoPackage = findPackageByName(packages, 'expo');
    if (expoPackage) {
        const postInstallCommand = packages.filter((pkg)=>pkg !== expoPackage);
        // Pipe options to the next command
        if (fix) postInstallCommand.push('--fix');
        if (check) postInstallCommand.push('--check');
        // Abort after installing `expo`, follow up command is spawn in a new process
        return await (0, _installExpoPackage.installExpoPackageAsync)(projectRoot, {
            packageManager,
            packageManagerArguments,
            expoPackageToInstall: versioning.packages.find((pkg)=>pkg.startsWith('expo@')),
            followUpCommandArgs: postInstallCommand
        });
    }
    if (dev) {
        await packageManager.addDevAsync([
            ...packageManagerArguments,
            ...versioning.packages
        ]);
    } else {
        await packageManager.addAsync([
            ...packageManagerArguments,
            ...versioning.packages
        ]);
    }
    await (0, _applyPlugins.applyPluginsAsync)(projectRoot, versioning.packages);
}
/** Find a package, by name, in the requested packages list (`expo` -> `expo`/`expo@<version>`) */ function findPackageByName(packages, name) {
    return packages.find((pkg)=>pkg === name || pkg.startsWith(`${name}@`));
}
/** Determine if a specific version is requested for a package */ function packageHasVersion(name = '') {
    return name.indexOf('@', 1) > 0; // Scoped packages may start with `@`
}

//# sourceMappingURL=installAsync.js.map