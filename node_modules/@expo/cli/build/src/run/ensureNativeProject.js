"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureNativeProjectAsync", {
    enumerable: true,
    get: function() {
        return ensureNativeProjectAsync;
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
const _clearNativeFolder = require("../prebuild/clearNativeFolder");
const _prebuildAsync = require("../prebuild/prebuildAsync");
const _profile = require("../utils/profile");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function ensureNativeProjectAsync(projectRoot, { platform, install }) {
    // If the user has an empty android folder then the project won't build, this can happen when they delete the prebuild files in git.
    // Check to ensure most of the core files are in place, and prompt to remove the folder if they aren't.
    await (0, _profile.profile)(_clearNativeFolder.promptToClearMalformedNativeProjectsAsync)(projectRoot, [
        platform
    ]);
    // If the project doesn't have native code, prebuild it...
    if (!_fs().default.existsSync(_path().default.join(projectRoot, platform))) {
        await (0, _prebuildAsync.prebuildAsync)(projectRoot, {
            install: !!install,
            platforms: [
                platform
            ]
        });
    } else {
        return true;
    }
    return false;
}

//# sourceMappingURL=ensureNativeProject.js.map