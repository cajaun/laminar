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
    removeExpoEnvDTS: function() {
        return removeExpoEnvDTS;
    },
    writeExpoEnvDTS: function() {
        return writeExpoEnvDTS;
    }
});
function _promises() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
    _promises = function() {
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
const template = `/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore`;
async function writeExpoEnvDTS(projectRoot) {
    return _promises().default.writeFile(_path().default.join(projectRoot, 'expo-env.d.ts'), template);
}
async function removeExpoEnvDTS(projectRoot) {
    // Force removal of expo-env.d.ts - Ignore any errors if the file does not exist
    return _promises().default.rm(_path().default.join(projectRoot, 'expo-env.d.ts'), {
        force: true
    });
}

//# sourceMappingURL=expo-env.js.map