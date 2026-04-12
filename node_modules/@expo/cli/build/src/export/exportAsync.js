"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "exportAsync", {
    enumerable: true,
    get: function() {
        return exportAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
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
const _exportApp = require("./exportApp");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _attachAtlas = require("../start/server/metro/debugging/attachAtlas");
const _FileNotifier = require("../utils/FileNotifier");
const _dir = require("../utils/dir");
const _errors = require("../utils/errors");
const _exit = require("../utils/exit");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
async function exportAsync(projectRoot, options) {
    // Ensure the output directory is created
    const outputPath = _path().default.resolve(projectRoot, options.outputDir);
    if (outputPath === projectRoot) {
        throw new _errors.CommandError('--output-dir cannot be the same as the project directory.');
    } else if (projectRoot.startsWith(outputPath)) {
        throw new _errors.CommandError(`--output-dir cannot be a parent directory of the project directory.`);
    }
    // Delete the output directory if it exists
    await (0, _dir.removeAsync)(outputPath);
    // Create the output directory
    await (0, _dir.ensureDirectoryAsync)(outputPath);
    // Export the app
    await (0, _exportApp.exportAppAsync)(projectRoot, options);
    // Stop any file watchers to prevent the CLI from hanging.
    _FileNotifier.FileNotifier.stopAll();
    // Wait until Atlas is ready, when enabled
    // NOTE(cedric): this is a workaround, remove when `process.exit` is removed
    await (0, _attachAtlas.waitUntilAtlasExportIsReadyAsync)(projectRoot);
    // Final notes
    _log.log(_chalk().default.greenBright`Exported: ${options.outputDir}`);
    // Exit the process to stop any hanging processes from reading the app.config.js or server rendering.
    (0, _exit.ensureProcessExitsAfterDelay)();
}

//# sourceMappingURL=exportAsync.js.map