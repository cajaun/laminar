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
    createTempDirectoryPath: function() {
        return createTempDirectoryPath;
    },
    createTempFilePath: function() {
        return createTempFilePath;
    }
});
function _crypto() {
    const data = require("crypto");
    _crypto = function() {
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
function _os() {
    const data = /*#__PURE__*/ _interop_require_default(require("os"));
    _os = function() {
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const uniqueTempPath = ()=>{
    return _path().default.join(_os().default.tmpdir(), (0, _crypto().randomBytes)(16).toString('hex'));
};
function createTempDirectoryPath() {
    const directory = uniqueTempPath();
    _fs().default.mkdirSync(directory);
    return directory;
}
function createTempFilePath(name = '') {
    if (name) {
        return _path().default.join(createTempDirectoryPath(), name);
    } else {
        return uniqueTempPath();
    }
}

//# sourceMappingURL=createTempPath.js.map