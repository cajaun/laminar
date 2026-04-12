"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cloneTemplateAsync", {
    enumerable: true,
    get: function() {
        return cloneTemplateAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
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
const _client = require("../api/rest/client");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _resolveLocalTemplate = require("./resolveLocalTemplate");
const _createFileTransform = require("../utils/createFileTransform");
const _errors = require("../utils/errors");
const _npm = require("../utils/npm");
const _url = require("../utils/url");
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
const debug = require('debug')('expo:prebuild:resolveTemplate');
async function cloneTemplateAsync({ templateDirectory, projectRoot, template, exp, ora }) {
    if (template) {
        const appName = exp.name;
        const { type, uri } = template;
        if (type === 'file') {
            return await (0, _npm.extractLocalNpmTarballAsync)(uri, {
                cwd: templateDirectory,
                name: appName
            });
        } else if (type === 'npm') {
            return await (0, _npm.downloadAndExtractNpmModuleAsync)(uri, {
                cwd: templateDirectory,
                name: appName
            });
        } else if (type === 'repository') {
            return await resolveAndDownloadRepoTemplateAsync(templateDirectory, ora, appName, uri);
        } else {
            throw new Error(`Unknown template type: ${type}`);
        }
    } else {
        try {
            return await (0, _resolveLocalTemplate.resolveLocalTemplateAsync)({
                templateDirectory,
                projectRoot,
                exp
            });
        } catch (error) {
            const templatePackageName = getTemplateNpmPackageNameFromSdkVersion(exp.sdkVersion);
            debug('Fallback to SDK template:', templatePackageName);
            return await (0, _npm.downloadAndExtractNpmModuleAsync)(templatePackageName, {
                cwd: templateDirectory,
                name: exp.name
            });
        }
    }
}
/** Given an `sdkVersion` like `44.0.0` return a fully qualified NPM package name like: `expo-template-bare-minimum@sdk-44` */ function getTemplateNpmPackageNameFromSdkVersion(sdkVersion) {
    // When undefined or UNVERSIONED, we use the latest version.
    if (!sdkVersion || sdkVersion === 'UNVERSIONED') {
        _log.log('Using an unspecified Expo SDK version. The latest template will be used.');
        return `expo-template-bare-minimum@latest`;
    }
    return `expo-template-bare-minimum@sdk-${_semver().default.major(sdkVersion)}`;
}
async function getRepoInfo(url, examplePath) {
    const [, username, name, t, _branch, ...file] = url.pathname.split('/');
    const filePath = examplePath ? examplePath.replace(/^\//, '') : file.join('/');
    // Support repos whose entire purpose is to be an example, e.g.
    // https://github.com/:username/:my-cool-example-repo-name.
    if (t === undefined) {
        const infoResponse = await (0, _client.fetchAsync)(`https://api.github.com/repos/${username}/${name}`);
        if (infoResponse.status !== 200) {
            return;
        }
        const info = await infoResponse.json();
        return {
            username,
            name,
            branch: info['default_branch'],
            filePath
        };
    }
    // If examplePath is available, the branch name takes the entire path
    const branch = examplePath ? `${_branch}/${file.join('/')}`.replace(new RegExp(`/${filePath}|/$`), '') : _branch;
    if (username && name && branch && t === 'tree') {
        return {
            username,
            name,
            branch,
            filePath
        };
    }
    return undefined;
}
function hasRepo({ username, name, branch, filePath }) {
    const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`;
    const packagePath = `${filePath ? `/${filePath}` : ''}/package.json`;
    return (0, _url.isUrlOk)(contentsUrl + packagePath + `?ref=${branch}`);
}
async function downloadAndExtractRepoAsync({ username, name, branch, filePath }, props) {
    const url = `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`;
    debug('Downloading tarball from:', url);
    // Extract the (sub)directory into non-empty path segments
    const directory = filePath.replace(/^\//, '').split('/').filter(Boolean);
    // Remove the (sub)directory paths, and the root folder added by GitHub
    const strip = directory.length + 1;
    // Only extract the relevant (sub)directories, ignoring irrelevant files
    // The filder auto-ignores dotfiles, unless explicitly included
    const filter = (0, _createFileTransform.createGlobFilter)(!directory.length ? [
        '*/**',
        '*/ios/.xcode.env'
    ] : [
        `*/${directory.join('/')}/**`,
        `*/${directory.join('/')}/ios/.xcode.env`
    ], {
        // Always ignore the `.xcworkspace` folder
        ignore: [
            '**/ios/*.xcworkspace/**'
        ]
    });
    return await (0, _npm.extractNpmTarballFromUrlAsync)(url, {
        ...props,
        strip,
        filter
    });
}
async function resolveAndDownloadRepoTemplateAsync(templateDirectory, oraInstance, appName, template, templatePath) {
    let repoUrl;
    try {
        repoUrl = new URL(template);
    } catch (error) {
        if (error.code !== 'ERR_INVALID_URL') {
            oraInstance.fail(error);
            throw error;
        }
    }
    if (!repoUrl) {
        oraInstance.fail(`Invalid URL: ${_chalk().default.red(`"${template}"`)}. Try again with a valid URL.`);
        throw new _errors.AbortCommandError();
    }
    if (repoUrl.origin !== 'https://github.com') {
        oraInstance.fail(`Invalid URL: ${_chalk().default.red(`"${template}"`)}. Only GitHub repositories are supported. Try again with a valid GitHub URL.`);
        throw new _errors.AbortCommandError();
    }
    const repoInfo = await getRepoInfo(repoUrl, templatePath);
    if (!repoInfo) {
        oraInstance.fail(`Found invalid GitHub URL: ${_chalk().default.red(`"${template}"`)}. Fix the URL and try again.`);
        throw new _errors.AbortCommandError();
    }
    const found = await hasRepo(repoInfo);
    if (!found) {
        oraInstance.fail(`Could not locate the repository for ${_chalk().default.red(`"${template}"`)}. Check that the repository exists and try again.`);
        throw new _errors.AbortCommandError();
    }
    oraInstance.text = _chalk().default.bold(`Downloading files from repo ${_chalk().default.cyan(template)}. This might take a moment.`);
    return await downloadAndExtractRepoAsync(repoInfo, {
        cwd: templateDirectory,
        name: appName
    });
}

//# sourceMappingURL=resolveTemplate.js.map