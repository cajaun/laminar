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
    resolveRealEntryFilePath: function() {
        return resolveRealEntryFilePath;
    },
    toPosixPath: function() {
        return toPosixPath;
    }
});
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const REGEXP_REPLACE_SLASHES = /\\/g;
function resolveRealEntryFilePath(projectRoot, entryFile) {
    if (projectRoot.startsWith('/private/var') && entryFile.startsWith('/var')) {
        return _fs().default.realpathSync(entryFile);
    }
    return entryFile;
}
function toPosixPath(filePath) {
    return filePath.replace(REGEXP_REPLACE_SLASHES, '/');
}

//# sourceMappingURL=filePath.js.map