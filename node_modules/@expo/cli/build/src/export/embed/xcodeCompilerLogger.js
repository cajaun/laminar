/**
 * Copyright © 2023 650 Industries.
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
    getXcodeCompilerErrorMessage: function() {
        return getXcodeCompilerErrorMessage;
    },
    isExecutingFromXcodebuild: function() {
        return isExecutingFromXcodebuild;
    },
    isPossiblyUnableToResolveError: function() {
        return isPossiblyUnableToResolveError;
    },
    logInXcode: function() {
        return logInXcode;
    },
    logMetroErrorInXcode: function() {
        return logMetroErrorInXcode;
    },
    warnInXcode: function() {
        return warnInXcode;
    }
});
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
const _log = require("../../log");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function isPossiblyUnableToResolveError(error) {
    return 'message' in error && typeof error.message === 'string' && 'originModulePath' in error && typeof error.originModulePath === 'string' && 'targetModuleName' in error && typeof error.targetModuleName === 'string';
}
function isPossiblyTransformError(error) {
    return 'message' in error && typeof error.message === 'string' && 'filename' in error && typeof error.filename === 'string' && 'lineNumber' in error && typeof error.lineNumber === 'number';
}
function getXcodeCompilerErrorMessage(projectRoot, error) {
    const makeFilepathAbsolute = (filepath)=>filepath.startsWith('/') ? filepath : _path().default.join(projectRoot, filepath);
    if (typeof error === 'string') {
        return makeXcodeCompilerLog('error', error);
    } else if ('message' in error) {
        // Metro's `UnableToResolveError`
        if (isPossiblyUnableToResolveError(error)) {
            const loc = getLineNumberForStringInFile(error.originModulePath, error.targetModuleName);
            return makeXcodeCompilerLog('error', error.message, {
                fileName: error.originModulePath,
                lineNumber: loc == null ? void 0 : loc.lineNumber,
                column: loc == null ? void 0 : loc.column
            });
        } else if (isPossiblyTransformError(error)) {
            return makeXcodeCompilerLog('error', error.message, {
                // Metro generally returns the filename as relative from the project root.
                fileName: makeFilepathAbsolute(error.filename),
                lineNumber: error.lineNumber,
                column: error.column
            });
        // TODO: ResourceNotFoundError, GraphNotFoundError, RevisionNotFoundError, AmbiguousModuleResolutionError
        } else {
            // Unknown error
            return makeXcodeCompilerLog('error', error.message);
        }
    }
    return null;
}
function logMetroErrorInXcode(projectRoot, error) {
    const message = getXcodeCompilerErrorMessage(projectRoot, error);
    if (message != null) {
        console.error(message);
    }
}
function logInXcode(message) {
    _log.Log.log(makeXcodeCompilerLog('note', message));
}
function warnInXcode(message) {
    _log.Log.warn(makeXcodeCompilerLog('warning', message));
}
function isExecutingFromXcodebuild() {
    return !!process.env.BUILT_PRODUCTS_DIR;
}
function makeXcodeCompilerLog(type, message, { fileName, lineNumber, column } = {}) {
    if (!isExecutingFromXcodebuild()) {
        return message;
    }
    // TODO: Figure out how to support multi-line logs.
    const firstLine = message.split('\n')[0];
    if (fileName && !(fileName == null ? void 0 : fileName.includes(':'))) {
        return `${fileName}:${lineNumber || 0}:${column != null ? column + ':' : ''} ${type}: ${firstLine}`;
    }
    return `${type}: ${firstLine}`;
}
// TODO: Metro doesn't expose this info even though it knows it.
function getLineNumberForStringInFile(originModulePath, targetModuleName) {
    let file;
    try {
        file = _fs().default.readFileSync(originModulePath, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'EISDIR') {
            // We're probably dealing with a virtualised file system where
            // `this.originModulePath` doesn't actually exist on disk.
            // We can't show a code frame, but there's no need to let this I/O
            // error shadow the original module resolution error.
            return null;
        }
        throw error;
    }
    const lines = file.split('\n');
    let lineNumber = 0;
    let column = -1;
    for(let line = 0; line < lines.length; line++){
        const columnLocation = lines[line].lastIndexOf(targetModuleName);
        if (columnLocation >= 0) {
            lineNumber = line;
            column = columnLocation;
            break;
        }
    }
    return {
        lineNumber,
        column
    };
}

//# sourceMappingURL=xcodeCompilerLogger.js.map