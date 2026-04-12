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
    copyAsync: function() {
        return copyAsync;
    },
    copySync: function() {
        return copySync;
    },
    directoryExistsAsync: function() {
        return directoryExistsAsync;
    },
    directoryExistsSync: function() {
        return directoryExistsSync;
    },
    ensureDirectory: function() {
        return ensureDirectory;
    },
    ensureDirectoryAsync: function() {
        return ensureDirectoryAsync;
    },
    fileExistsAsync: function() {
        return fileExistsAsync;
    },
    fileExistsSync: function() {
        return fileExistsSync;
    },
    isPathInside: function() {
        return isPathInside;
    },
    removeAsync: function() {
        return removeAsync;
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function fileExistsSync(file) {
    var _fs_statSync;
    return !!((_fs_statSync = _fs().default.statSync(file, {
        throwIfNoEntry: false
    })) == null ? void 0 : _fs_statSync.isFile());
}
function directoryExistsSync(file) {
    var _fs_statSync;
    return !!((_fs_statSync = _fs().default.statSync(file, {
        throwIfNoEntry: false
    })) == null ? void 0 : _fs_statSync.isDirectory());
}
async function directoryExistsAsync(file) {
    var _this;
    return ((_this = await _fs().default.promises.stat(file).catch(()=>null)) == null ? void 0 : _this.isDirectory()) ?? false;
}
async function fileExistsAsync(file) {
    var _this;
    return ((_this = await _fs().default.promises.stat(file).catch(()=>null)) == null ? void 0 : _this.isFile()) ?? false;
}
const ensureDirectoryAsync = (path)=>_fs().default.promises.mkdir(path, {
        recursive: true
    });
const ensureDirectory = (path)=>{
    _fs().default.mkdirSync(path, {
        recursive: true
    });
};
const copySync = (src, dest)=>{
    const destParent = _path().default.dirname(dest);
    if (!_fs().default.existsSync(destParent)) ensureDirectory(destParent);
    _fs().default.cpSync(src, dest, {
        recursive: true,
        force: true
    });
};
const copyAsync = async (src, dest)=>{
    const destParent = _path().default.dirname(dest);
    if (!_fs().default.existsSync(destParent)) {
        await _fs().default.promises.mkdir(destParent, {
            recursive: true
        });
    }
    await _fs().default.promises.cp(src, dest, {
        recursive: true,
        force: true
    });
};
const removeAsync = (path)=>{
    return _fs().default.promises.rm(path, {
        recursive: true,
        force: true
    });
};
function isPathInside(child, parent) {
    const relative = _path().default.relative(parent, child);
    return !!relative && !relative.startsWith('..') && !_path().default.isAbsolute(relative);
}

//# sourceMappingURL=dir.js.map