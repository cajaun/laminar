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
    clearNativeFolder: function() {
        return clearNativeFolder;
    },
    getMalformedNativeProjectsAsync: function() {
        return getMalformedNativeProjectsAsync;
    },
    hasRequiredAndroidFilesAsync: function() {
        return hasRequiredAndroidFilesAsync;
    },
    hasRequiredIOSFilesAsync: function() {
        return hasRequiredIOSFilesAsync;
    },
    promptToClearMalformedNativeProjectsAsync: function() {
        return promptToClearMalformedNativeProjectsAsync;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
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
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _dir = require("../utils/dir");
const _interactive = require("../utils/interactive");
const _ora = require("../utils/ora");
const _prompts = require("../utils/prompts");
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
async function clearNativeFolder(projectRoot, folders) {
    const step = (0, _ora.logNewSection)(`Clearing ${folders.join(', ')}`);
    try {
        await Promise.all(folders.map((folderName)=>_fs().default.promises.rm(_path().default.join(projectRoot, folderName), {
                recursive: true,
                force: true
            })));
        step.succeed(`Cleared ${folders.join(', ')} code`);
    } catch (error) {
        step.fail(`Failed to delete ${folders.join(', ')} code: ${error.message}`);
        throw error;
    }
}
async function hasRequiredAndroidFilesAsync(projectRoot) {
    try {
        await Promise.all([
            _configplugins().AndroidConfig.Paths.getAppBuildGradleAsync(projectRoot),
            _configplugins().AndroidConfig.Paths.getProjectBuildGradleAsync(projectRoot),
            _configplugins().AndroidConfig.Paths.getAndroidManifestAsync(projectRoot),
            _configplugins().AndroidConfig.Paths.getMainApplicationAsync(projectRoot)
        ]);
        return true;
    } catch  {
        return false;
    }
}
async function hasRequiredIOSFilesAsync(projectRoot) {
    try {
        // If any of the following required files are missing, then the project is malformed.
        await Promise.all([
            _configplugins().IOSConfig.Paths.getAllXcodeProjectPaths(projectRoot),
            _configplugins().IOSConfig.Paths.getAllPBXProjectPaths(projectRoot)
        ]);
        return true;
    } catch  {
        return false;
    }
}
/**
 * Filter out platforms that do not have an existing platform folder.
 * If the user wants to validate that neither of ['ios', 'android'] are malformed then we should
 * first check that both `ios` and `android` folders exist.
 *
 * This optimization prevents us from prompting to clear a "malformed" project that doesn't exist yet.
 */ async function filterPlatformsThatDoNotExistAsync(projectRoot, platforms) {
    const valid = await Promise.all(platforms.map(async (platform)=>{
        if (await (0, _dir.directoryExistsAsync)(_path().default.join(projectRoot, platform))) {
            return platform;
        }
        return null;
    }));
    return valid.filter(Boolean);
}
async function getMalformedNativeProjectsAsync(projectRoot, platforms) {
    const VERIFIERS = {
        android: hasRequiredAndroidFilesAsync,
        ios: hasRequiredIOSFilesAsync
    };
    const checkablePlatforms = platforms.filter((platform)=>platform in VERIFIERS);
    const checkPlatforms = await filterPlatformsThatDoNotExistAsync(projectRoot, checkablePlatforms);
    return (await Promise.all(checkPlatforms.map(async (platform)=>{
        if (!VERIFIERS[platform]) {
            return false;
        }
        if (await VERIFIERS[platform](projectRoot)) {
            return false;
        }
        return platform;
    }))).filter(Boolean);
}
async function promptToClearMalformedNativeProjectsAsync(projectRoot, checkPlatforms) {
    const platforms = await getMalformedNativeProjectsAsync(projectRoot, checkPlatforms);
    if (!platforms.length) {
        return;
    }
    const displayPlatforms = platforms.map((platform)=>_chalk().default.cyan(platform));
    // Prompt which platforms to reset.
    const message = platforms.length > 1 ? `The ${displayPlatforms[0]} and ${displayPlatforms[1]} projects are malformed` : `The ${displayPlatforms[0]} project is malformed`;
    if (// If the process is non-interactive, default to clearing the malformed native project.
    // This would only happen on re-running prebuild.
    !(0, _interactive.isInteractive)() || // Prompt to clear the native folders.
    await (0, _prompts.confirmAsync)({
        message: `${message}, would you like to clear the project files and reinitialize them?`,
        initial: true
    })) {
        if (!(0, _interactive.isInteractive)()) {
            _log.warn(`${message}, project files will be cleared and reinitialized.`);
        }
        await clearNativeFolder(projectRoot, platforms);
    } else {
        // Warn the user that the process may fail.
        _log.warn('Continuing with malformed native projects');
    }
}

//# sourceMappingURL=clearNativeFolder.js.map