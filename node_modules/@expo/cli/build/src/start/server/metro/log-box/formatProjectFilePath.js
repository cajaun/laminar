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
    formatProjectFilePath: function() {
        return formatProjectFilePath;
    },
    getStackFormattedLocation: function() {
        return getStackFormattedLocation;
    }
});
function _nodepath() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:path"));
    _nodepath = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function formatProjectFilePath(projectRoot, file) {
    if (file == null) {
        return '<unknown>';
    }
    if (file === '<anonymous>') {
        return file;
    }
    return _nodepath().default.relative(projectRoot.replace(/\\/g, '/'), file.replace(/\\/g, '/')).replace(/\?.*$/, '');
}
function getStackFormattedLocation(projectRoot, frame) {
    const column = frame.column != null && parseInt(String(frame.column), 10);
    const location = formatProjectFilePath(projectRoot, frame.file) + (frame.lineNumber != null ? ':' + frame.lineNumber + (column && !isNaN(column) ? ':' + (column + 1) : '') : '');
    return location;
}

//# sourceMappingURL=formatProjectFilePath.js.map