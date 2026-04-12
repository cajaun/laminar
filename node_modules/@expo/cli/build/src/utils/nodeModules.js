"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "clearNodeModulesAsync", {
    enumerable: true,
    get: function() {
        return clearNodeModulesAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _ora = require("./ora");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function clearNodeModulesAsync(projectRoot) {
    // This step can take a couple seconds, if the installation logs are enabled (with EXPO_DEBUG) then it
    // ends up looking odd to see "Installing JavaScript dependencies" for ~5 seconds before the logs start showing up.
    const cleanJsDepsStep = (0, _ora.logNewSection)('Cleaning JavaScript dependencies');
    const time = Date.now();
    // nuke the node modules
    // TODO: this is substantially slower, we should find a better alternative to ensuring the modules are installed.
    await _fs().default.promises.rm(_path().default.join(projectRoot, 'node_modules'), {
        recursive: true,
        force: true
    });
    cleanJsDepsStep.succeed(`Cleaned JavaScript dependencies ${_chalk().default.gray(Date.now() - time + 'ms')}`);
}

//# sourceMappingURL=nodeModules.js.map