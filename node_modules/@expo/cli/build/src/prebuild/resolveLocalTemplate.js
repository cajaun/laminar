"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveLocalTemplateAsync", {
    enumerable: true,
    get: function() {
        return resolveLocalTemplateAsync;
    }
});
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _npm = require("../utils/npm");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:prebuild:resolveLocalTemplate');
async function resolveLocalTemplateAsync({ templateDirectory, projectRoot, exp }) {
    const templatePath = (0, _resolvefrom().default)(projectRoot, 'expo/template.tgz');
    debug('Using local template from Expo package:', templatePath);
    const stream = _fs().default.createReadStream(templatePath);
    return await (0, _npm.extractNpmTarballAsync)(stream, {
        cwd: templateDirectory,
        name: exp.name
    });
}

//# sourceMappingURL=resolveLocalTemplate.js.map