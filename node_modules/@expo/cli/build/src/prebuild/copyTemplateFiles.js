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
    copyTemplateFiles: function() {
        return copyTemplateFiles;
    },
    createCopyFilesSuccessMessage: function() {
        return createCopyFilesSuccessMessage;
    }
});
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
const _dir = require("../utils/dir");
const _mergeGitIgnorePaths = require("../utils/mergeGitIgnorePaths");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:prebuild:copyTemplateFiles');
/**
 * Return true if the given platforms all have an internal `.gitignore` file.
 *
 * @param projectRoot
 * @param platforms
 */ function hasAllPlatformSpecificGitIgnores(projectRoot, platforms) {
    return platforms.reduce((p, platform)=>p && _fs().default.existsSync(_path().default.join(projectRoot, platform, '.gitignore')), true);
}
function createCopyFilesSuccessMessage(platforms, { skippedPaths, gitignore }) {
    const pluralized = platforms.length > 1 ? 'directories' : 'directory';
    let message = `Created native ${pluralized}`;
    if (skippedPaths.length) {
        message += _chalk().default.dim(` | reusing ${skippedPaths.map((path)=>_chalk().default.bold(`/${path}`)).join(', ')}`);
    }
    if (!gitignore) {
    // Add no additional message...
    } else if (!gitignore.didMerge) {
        message += _chalk().default.dim(` | reusing gitignore`);
    } else if (gitignore.didMerge && gitignore.didClear) {
        // This is legacy and for non-standard templates. The Expo template adds gitignores to the platform folders.
        message += _chalk().default.dim(` | updated gitignore`);
    }
    return message;
}
function copyTemplateFiles(projectRoot, { templateDirectory, platforms }) {
    const copiedPaths = [];
    const skippedPaths = [];
    platforms.forEach((copyFilePath)=>{
        const projectPath = _path().default.join(projectRoot, copyFilePath);
        if (_fs().default.existsSync(projectPath)) {
            skippedPaths.push(copyFilePath);
        } else {
            copiedPaths.push(copyFilePath);
            (0, _dir.copySync)(_path().default.join(templateDirectory, copyFilePath), projectPath);
        }
    });
    const hasPlatformSpecificGitIgnores = hasAllPlatformSpecificGitIgnores(templateDirectory, platforms);
    debug(`All platforms have an internal gitignore: ${hasPlatformSpecificGitIgnores}`);
    // TODO: Remove gitignore modifications -- maybe move to `npx expo-doctor`
    const gitignore = hasPlatformSpecificGitIgnores ? null : (0, _mergeGitIgnorePaths.mergeGitIgnorePaths)(_path().default.join(projectRoot, '.gitignore'), _path().default.join(templateDirectory, '.gitignore'));
    return {
        copiedPaths,
        skippedPaths,
        gitignore
    };
}

//# sourceMappingURL=copyTemplateFiles.js.map