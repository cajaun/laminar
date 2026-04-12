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
    hasPackageJsonDependencyListChangedAsync: function() {
        return hasPackageJsonDependencyListChangedAsync;
    },
    installCocoaPodsAsync: function() {
        return installCocoaPodsAsync;
    },
    maybePromptToSyncPodsAsync: function() {
        return maybePromptToSyncPodsAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
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
const _dir = require("./dir");
const _env = require("./env");
const _errors = require("./errors");
const _ora = require("./ora");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _updatePackageJson = require("../prebuild/updatePackageJson");
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
const PROJECT_PREBUILD_SETTINGS = '.expo/prebuild';
const CACHED_PACKAGE_JSON = 'cached-packages.json';
function getTempPrebuildFolder(projectRoot) {
    return _path().default.join(projectRoot, PROJECT_PREBUILD_SETTINGS);
}
function hasNewDependenciesSinceLastBuild(projectRoot, packageChecksums) {
    // TODO: Maybe comparing lock files would be better...
    const templateDirectory = getTempPrebuildFolder(projectRoot);
    const tempPkgJsonPath = _path().default.join(templateDirectory, CACHED_PACKAGE_JSON);
    if (!_fs().default.existsSync(tempPkgJsonPath)) {
        return true;
    }
    const { dependencies, devDependencies } = _jsonfile().default.read(tempPkgJsonPath);
    // Only change the dependencies if the normalized hash changes, this helps to reduce meaningless changes.
    const hasNewDependencies = packageChecksums.dependencies !== dependencies;
    const hasNewDevDependencies = packageChecksums.devDependencies !== devDependencies;
    return hasNewDependencies || hasNewDevDependencies;
}
function createPackageChecksums(pkg) {
    return {
        dependencies: (0, _updatePackageJson.hashForDependencyMap)(pkg.dependencies || {}),
        devDependencies: (0, _updatePackageJson.hashForDependencyMap)(pkg.devDependencies || {})
    };
}
async function hasPackageJsonDependencyListChangedAsync(projectRoot) {
    const pkg = (0, _config().getPackageJson)(projectRoot);
    const packages = createPackageChecksums(pkg);
    const hasNewDependencies = hasNewDependenciesSinceLastBuild(projectRoot, packages);
    // Cache package.json
    await (0, _dir.ensureDirectoryAsync)(getTempPrebuildFolder(projectRoot));
    const templateDirectory = _path().default.join(getTempPrebuildFolder(projectRoot), CACHED_PACKAGE_JSON);
    await _jsonfile().default.writeAsync(templateDirectory, packages);
    return hasNewDependencies;
}
async function installCocoaPodsAsync(projectRoot) {
    let step = (0, _ora.logNewSection)('Installing CocoaPods...');
    if (process.platform !== 'darwin') {
        step.succeed('Skipped installing CocoaPods because operating system is not on macOS.');
        return false;
    }
    const packageManager = new (_packagemanager()).CocoaPodsPackageManager({
        cwd: _path().default.join(projectRoot, 'ios'),
        silent: !(_env.env.EXPO_DEBUG || _env.env.CI)
    });
    if (!await packageManager.isCLIInstalledAsync()) {
        try {
            // prompt user -- do you want to install cocoapods right now?
            step.text = 'CocoaPods CLI not found in your PATH, installing it now.';
            step.stopAndPersist();
            await _packagemanager().CocoaPodsPackageManager.installCLIAsync({
                nonInteractive: true,
                spawnOptions: {
                    ...packageManager.options,
                    // Don't silence this part
                    stdio: [
                        'inherit',
                        'inherit',
                        'pipe'
                    ]
                }
            });
            step.succeed('Installed CocoaPods CLI.');
            step = (0, _ora.logNewSection)('Running `pod install` in the `ios` directory.');
        } catch (error) {
            step.stopAndPersist({
                symbol: '⚠️ ',
                text: _chalk().default.red('Unable to install the CocoaPods CLI.')
            });
            if (error instanceof _packagemanager().CocoaPodsError) {
                _log.log(error.message);
            } else {
                _log.log(`Unknown error: ${error.message}`);
            }
            return false;
        }
    }
    try {
        await packageManager.installAsync({
            spinner: step
        });
        // Create cached list for later
        await hasPackageJsonDependencyListChangedAsync(projectRoot).catch(()=>null);
        step.succeed('Installed CocoaPods');
        return true;
    } catch (error) {
        step.stopAndPersist({
            symbol: '⚠️ ',
            text: _chalk().default.red('Something went wrong running `pod install` in the `ios` directory.')
        });
        if (error instanceof _packagemanager().CocoaPodsError) {
            _log.log(error.message);
        } else {
            _log.log(`Unknown error: ${error.message}`);
        }
        return false;
    }
}
function doesProjectUseCocoaPods(projectRoot) {
    return _fs().default.existsSync(_path().default.join(projectRoot, 'ios', 'Podfile'));
}
function isLockfileCreated(projectRoot) {
    const podfileLockPath = _path().default.join(projectRoot, 'ios', 'Podfile.lock');
    return _fs().default.existsSync(podfileLockPath);
}
function isPodFolderCreated(projectRoot) {
    const podFolderPath = _path().default.join(projectRoot, 'ios', 'Pods');
    return _fs().default.existsSync(podFolderPath);
}
async function maybePromptToSyncPodsAsync(projectRoot) {
    if (!doesProjectUseCocoaPods(projectRoot)) {
        // Project does not use CocoaPods
        return;
    }
    if (!isLockfileCreated(projectRoot) || !isPodFolderCreated(projectRoot)) {
        if (!await installCocoaPodsAsync(projectRoot)) {
            throw new _errors.AbortCommandError();
        }
        return;
    }
    // Getting autolinked packages can be heavy, optimize around checking every time.
    if (!await hasPackageJsonDependencyListChangedAsync(projectRoot)) {
        return;
    }
    await promptToInstallPodsAsync(projectRoot, []);
}
async function promptToInstallPodsAsync(projectRoot, missingPods) {
    if (missingPods == null ? void 0 : missingPods.length) {
        _log.log(`Could not find the following native modules: ${missingPods.map((pod)=>_chalk().default.bold(pod)).join(', ')}. Did you forget to run "${_chalk().default.bold('pod install')}" ?`);
    }
    try {
        if (!await installCocoaPodsAsync(projectRoot)) {
            throw new _errors.AbortCommandError();
        }
    } catch (error) {
        await _fs().default.promises.rm(_path().default.join(getTempPrebuildFolder(projectRoot), CACHED_PACKAGE_JSON), {
            recursive: true,
            force: true
        });
        throw error;
    }
}

//# sourceMappingURL=cocoapods.js.map