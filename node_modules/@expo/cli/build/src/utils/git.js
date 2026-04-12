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
    maybeBailOnGitStatusAsync: function() {
        return maybeBailOnGitStatusAsync;
    },
    validateGitStatusAsync: function() {
        return validateGitStatusAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _env = require("./env");
const _interactive = require("./interactive");
const _prompts = require("./prompts");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
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
async function maybeBailOnGitStatusAsync() {
    if (_env.env.EXPO_NO_GIT_STATUS) {
        _log.warn('Git status is dirty but the command will continue because EXPO_NO_GIT_STATUS is enabled...');
        return false;
    }
    const isGitStatusClean = await validateGitStatusAsync();
    // Give people a chance to bail out if git working tree is dirty
    if (!isGitStatusClean) {
        if (!(0, _interactive.isInteractive)()) {
            _log.warn(`Git status is dirty but the command will continue because the terminal is not interactive.`);
            return false;
        }
        _log.log();
        const answer = await (0, _prompts.confirmAsync)({
            message: `Continue with uncommitted changes?`
        });
        if (!answer) {
            return true;
        }
        _log.log();
    }
    return false;
}
async function validateGitStatusAsync() {
    let workingTreeStatus = 'unknown';
    try {
        const result = await (0, _spawnasync().default)('git', [
            'status',
            '--porcelain'
        ]);
        workingTreeStatus = result.stdout === '' ? 'clean' : 'dirty';
    } catch  {
    // Maybe git is not installed?
    // Maybe this project is not using git?
    }
    if (workingTreeStatus === 'clean') {
        return true;
    } else if (workingTreeStatus === 'dirty') {
        logWarning('Git branch has uncommitted file changes', `It's recommended to commit all changes before proceeding in case you want to revert generated changes.`);
    } else {
        logWarning('No git repo found in current directory', `Use git to track file changes before running commands that modify project files.`);
    }
    return false;
}
function logWarning(warning, hint) {
    _log.warn(_chalk().default.bold`! ` + warning);
    _log.log(_chalk().default.gray`\u203A ` + _chalk().default.gray(hint));
}

//# sourceMappingURL=git.js.map