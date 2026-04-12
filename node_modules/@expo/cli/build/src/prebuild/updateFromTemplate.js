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
    cloneTemplateAndCopyToProjectAsync: function() {
        return cloneTemplateAndCopyToProjectAsync;
    },
    updateFromTemplateAsync: function() {
        return updateFromTemplateAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _copyTemplateFiles = require("./copyTemplateFiles");
const _renameTemplateAppName = require("./renameTemplateAppName");
const _resolveTemplate = require("./resolveTemplate");
const _updatePackageJson = require("./updatePackageJson");
const _validateTemplatePlatforms = require("./validateTemplatePlatforms");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _createTempPath = require("../utils/createTempPath");
const _errors = require("../utils/errors");
const _ora = require("../utils/ora");
const _profile = require("../utils/profile");
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
async function updateFromTemplateAsync(projectRoot, { exp, pkg, template, templateDirectory, platforms, skipDependencyUpdate }) {
    if (!templateDirectory) {
        templateDirectory = (0, _createTempPath.createTempDirectoryPath)();
    }
    const { copiedPaths, templateChecksum } = await (0, _profile.profile)(cloneTemplateAndCopyToProjectAsync)({
        projectRoot,
        template,
        templateDirectory,
        exp,
        platforms
    });
    const depsResults = await (0, _profile.profile)(_updatePackageJson.updatePackageJSONAsync)(projectRoot, {
        templateDirectory,
        pkg,
        skipDependencyUpdate
    });
    return {
        hasNewProjectFiles: !!copiedPaths.length,
        // If the iOS folder changes or new packages are added, we should rerun pod install.
        needsPodInstall: copiedPaths.includes('ios') || !!depsResults.changedDependencies.length,
        templateChecksum,
        ...depsResults
    };
}
async function cloneTemplateAndCopyToProjectAsync({ projectRoot, templateDirectory, template, exp, platforms: unknownPlatforms }) {
    const platformDirectories = unknownPlatforms.map((platform)=>`./${platform}`).reverse().join(' and ');
    const pluralized = unknownPlatforms.length > 1 ? 'directories' : 'directory';
    const ora = (0, _ora.logNewSection)(`Creating native ${pluralized} (${platformDirectories})`);
    try {
        const templateChecksum = await (0, _resolveTemplate.cloneTemplateAsync)({
            templateDirectory,
            projectRoot,
            template,
            exp,
            ora
        });
        const platforms = (0, _validateTemplatePlatforms.validateTemplatePlatforms)({
            templateDirectory,
            platforms: unknownPlatforms
        });
        const results = (0, _copyTemplateFiles.copyTemplateFiles)(projectRoot, {
            templateDirectory,
            platforms
        });
        const files = await (0, _renameTemplateAppName.getTemplateFilesToRenameAsync)({
            cwd: projectRoot
        });
        await (0, _renameTemplateAppName.renameTemplateAppNameAsync)({
            cwd: projectRoot,
            files,
            name: exp.name
        });
        // Says: "Created native directories"
        ora.succeed((0, _copyTemplateFiles.createCopyFilesSuccessMessage)(platforms, results));
        return {
            copiedPaths: results.copiedPaths,
            templateChecksum
        };
    } catch (e) {
        if (!(e instanceof _errors.AbortCommandError)) {
            _log.error(e.message);
        }
        ora.fail(`Failed to create the native ${pluralized}`);
        _log.log(_chalk().default.yellow((0, _chalk().default)`You may want to delete the {bold ./ios} and/or {bold ./android} directories before trying again.`));
        throw new _errors.SilentError(e);
    }
}

//# sourceMappingURL=updateFromTemplate.js.map