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
    copyPublicFolderAsync: function() {
        return copyPublicFolderAsync;
    },
    getUserDefinedFile: function() {
        return getUserDefinedFile;
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
const _dir = require("../utils/dir");
const _env = require("../utils/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:public-folder');
function getUserDefinedFile(projectRoot, possiblePaths) {
    const publicPath = _path().default.join(projectRoot, _env.env.EXPO_PUBLIC_FOLDER);
    for (const possiblePath of possiblePaths){
        const fullPath = _path().default.join(publicPath, possiblePath);
        if (_fs().default.existsSync(fullPath)) {
            debug(`Found user-defined public file: ` + possiblePath);
            return fullPath;
        }
    }
    return null;
}
async function copyPublicFolderAsync(publicFolder, outputFolder) {
    if (_fs().default.existsSync(publicFolder)) {
        await _fs().default.promises.mkdir(outputFolder, {
            recursive: true
        });
        await (0, _dir.copyAsync)(publicFolder, outputFolder);
    }
}

//# sourceMappingURL=publicFolder.js.map