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
    fileExists: function() {
        return fileExists;
    },
    moduleNameIsDirectFileReference: function() {
        return moduleNameIsDirectFileReference;
    },
    moduleNameIsPackageReference: function() {
        return moduleNameIsPackageReference;
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
function moduleNameIsDirectFileReference(name) {
    var _name_split;
    // Check if path is a file. Matches lines starting with: . / ~/
    if (name.match(/^(\.|~\/|\/)/g)) {
        return true;
    }
    const slashCount = (_name_split = name.split('/')) == null ? void 0 : _name_split.length;
    // Orgs (like @expo/config ) should have more than one slash to be a direct file.
    if (name.startsWith('@')) {
        return slashCount > 2;
    }
    // Regular packages should be considered direct reference if they have more than one slash.
    return slashCount > 1;
}
function moduleNameIsPackageReference(name) {
    var _name_split;
    const slashCount = (_name_split = name.split('/')) == null ? void 0 : _name_split.length;
    return name.startsWith('@') ? slashCount === 2 : slashCount === 1;
}
function fileExists(file) {
    try {
        return _fs().default.statSync(file).isFile();
    } catch  {
        return false;
    }
}

//# sourceMappingURL=helpers.js.map