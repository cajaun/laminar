/**
 * Copyright © 2022 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
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
    cachedSourceMaps: function() {
        return cachedSourceMaps;
    },
    createMetroEndpointAsync: function() {
        return createMetroEndpointAsync;
    },
    evalMetroAndWrapFunctions: function() {
        return evalMetroAndWrapFunctions;
    },
    evalMetroNoHandling: function() {
        return evalMetroNoHandling;
    }
});
function _paths() {
    const data = require("@expo/config/paths");
    _paths = function() {
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
function _requirefromstring() {
    const data = /*#__PURE__*/ _interop_require_default(require("require-from-string"));
    _requirefromstring = function() {
        return data;
    };
    return data;
}
const _metroErrorInterface = require("./metro/metroErrorInterface");
const _metroOptions = require("./middleware/metroOptions");
const _serverLogLikeMetro = require("./serverLogLikeMetro");
const _delay = require("../../utils/delay");
const _errors = require("../../utils/errors");
const _filePath = require("../../utils/filePath");
const _profile = require("../../utils/profile");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:server:getStaticRenderFunctions');
const cachedSourceMaps = new Map();
// Support unhandled rejections
// Detect if running in Bun
// @ts-expect-error: This is a global variable that is set by Bun.
if (!process.isBun) {
    require('source-map-support').install({
        retrieveSourceMap (source) {
            if (cachedSourceMaps.has(source)) {
                return cachedSourceMaps.get(source);
            }
            return null;
        }
    });
}
async function ensureFileInRootDirectory(projectRoot, otherFile) {
    // Cannot be accessed using Metro's server API, we need to move the file
    // into the project root and try again.
    if (!_path().default.relative(projectRoot, otherFile).startsWith('..' + _path().default.sep)) {
        return otherFile;
    }
    // Copy the file into the project to ensure it works in monorepos.
    // This means the file cannot have any relative imports.
    const tempDir = _path().default.join(projectRoot, '.expo/static-tmp');
    await _fs().default.promises.mkdir(tempDir, {
        recursive: true
    });
    const moduleId = _path().default.join(tempDir, _path().default.basename(otherFile));
    await _fs().default.promises.writeFile(moduleId, await _fs().default.promises.readFile(otherFile, 'utf8'));
    // Sleep to give watchman time to register the file.
    await (0, _delay.delayAsync)(50);
    return moduleId;
}
async function createMetroEndpointAsync(projectRoot, devServerUrl, absoluteFilePath, props) {
    const root = (0, _paths().getMetroServerRoot)(projectRoot);
    const safeOtherFile = await ensureFileInRootDirectory(projectRoot, absoluteFilePath);
    const serverPath = _path().default.relative(root, safeOtherFile).replace(/\.[jt]sx?$/, '');
    const urlFragment = (0, _metroOptions.createBundleUrlPath)({
        mainModuleName: serverPath,
        lazy: false,
        asyncRoutes: false,
        inlineSourceMap: false,
        engine: 'hermes',
        minify: false,
        bytecode: false,
        ...props
    });
    let url;
    if (devServerUrl) {
        url = new URL(urlFragment.replace(/^\//, ''), devServerUrl).toString();
    } else {
        url = '/' + urlFragment.replace(/^\/+/, '');
    }
    return url;
}
function evalMetroAndWrapFunctions(projectRoot, script, filename, isExporting) {
    // TODO: Add back stack trace logic that hides traces from metro-runtime and other internal modules.
    const contents = evalMetroNoHandling(projectRoot, script, filename);
    if (!contents) {
        // This can happen if ErrorUtils isn't working correctly on web and failing to throw an error when a module throws.
        // This is unexpected behavior and should not be pretty formatted, therefore we're avoiding CommandError.
        throw new Error('[Expo SSR] Module returned undefined, this could be due to a misconfiguration in Metro error handling');
    }
    // wrap each function with a try/catch that uses Metro's error formatter
    return Object.keys(contents).reduce((acc, key)=>{
        const fn = contents[key];
        if (typeof fn !== 'function') {
            return {
                ...acc,
                [key]: fn
            };
        }
        acc[key] = async function(...props) {
            try {
                return await fn.apply(this, props);
            } catch (error) {
                await (0, _metroErrorInterface.logMetroError)(projectRoot, {
                    error
                });
                if (isExporting || error[_metroErrorInterface.IS_METRO_BUNDLE_ERROR_SYMBOL]) {
                    throw error;
                } else {
                    // TODO: When does this happen?
                    throw new _errors.SilentError(error);
                }
            }
        };
        return acc;
    }, {});
}
function evalMetroNoHandling(projectRoot, src, filename) {
    (0, _serverLogLikeMetro.augmentLogs)(projectRoot);
    // NOTE(@kitten): `require-from-string` derives a base path from the filename we pass it,
    // but doesn't validate that the filename exists. These debug messages should help identify
    // these problems, if they occur in user projects without reproductions
    if (!_fs().default.existsSync(_path().default.dirname(filename))) {
        debug(`evalMetroNoHandling received filename in a directory that does not exist: ${filename}`);
    } else if (!(0, _filePath.toPosixPath)(_path().default.dirname(filename)).startsWith((0, _filePath.toPosixPath)(projectRoot))) {
        debug(`evalMetroNoHandling received filename outside of the project root: ${filename}`);
    }
    return (0, _profile.profile)(_requirefromstring().default, 'eval-metro-bundle')(src, filename);
}

//# sourceMappingURL=getStaticRenderFunctions.js.map