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
    importExpoWebpackConfigFromProject: function() {
        return importExpoWebpackConfigFromProject;
    },
    importWebpackDevServerFromProject: function() {
        return importWebpackDevServerFromProject;
    },
    importWebpackFromProject: function() {
        return importWebpackFromProject;
    }
});
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _errors = require("../../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// These resolvers enable us to test the CLI in older projects.
// We may be able to get rid of this in the future.
// TODO: Maybe combine with AsyncResolver?
class WebpackImportError extends _errors.CommandError {
    constructor(projectRoot, moduleId){
        super('WEBPACK_IMPORT', `Missing package "${moduleId}" in the project. Try running the command again. (cwd: ${projectRoot})`);
    }
}
function resolveFromProject(projectRoot, moduleId) {
    const resolvedPath = _resolvefrom().default.silent(projectRoot, moduleId);
    if (!resolvedPath) {
        throw new WebpackImportError(projectRoot, moduleId);
    }
    return resolvedPath;
}
function importFromProject(projectRoot, moduleId) {
    return require(resolveFromProject(projectRoot, moduleId));
}
function importWebpackFromProject(projectRoot) {
    return importFromProject(projectRoot, 'webpack');
}
function importExpoWebpackConfigFromProject(projectRoot) {
    return importFromProject(projectRoot, '@expo/webpack-config');
}
function importWebpackDevServerFromProject(projectRoot) {
    return importFromProject(projectRoot, 'webpack-dev-server');
}

//# sourceMappingURL=resolveFromProject.js.map