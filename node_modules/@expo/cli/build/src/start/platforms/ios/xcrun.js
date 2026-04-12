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
    isSpawnResultError: function() {
        return isSpawnResultError;
    },
    xcrunAsync: function() {
        return xcrunAsync;
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
const _errors = require("../../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:platforms:ios:xcrun');
function isSpawnResultError(obj) {
    return obj && 'message' in obj && obj.status !== undefined && obj.stdout !== undefined && obj.stderr !== undefined;
}
async function xcrunAsync(args, options) {
    debug('Running: xcrun ' + args.join(' '));
    try {
        return await (0, _spawnasync().default)('xcrun', args.filter(Boolean), options);
    } catch (e) {
        throwXcrunError(e);
    }
}
function throwXcrunError(e) {
    var _e_stderr;
    if (isLicenseOutOfDate(e.stdout) || isLicenseOutOfDate(e.stderr)) {
        throw new _errors.CommandError('XCODE_LICENSE_NOT_ACCEPTED', 'Xcode license is not accepted. Run `sudo xcodebuild -license`.');
    } else if ((_e_stderr = e.stderr) == null ? void 0 : _e_stderr.includes('not a developer tool or in PATH')) {
        throw new _errors.CommandError('SIMCTL_NOT_AVAILABLE', `You may need to run ${_chalk().default.bold('sudo xcode-select -s /Applications/Xcode.app')} and try again.`);
    }
    // Attempt to craft a better error message...
    if (Array.isArray(e.output)) {
        e.message += '\n' + e.output.join('\n').trim();
    } else if (e.stderr) {
        e.message += '\n' + e.stderr;
    }
    throw e;
}
function isLicenseOutOfDate(text) {
    if (!text) {
        return false;
    }
    const lower = text.toLowerCase();
    return lower.includes('xcode') && lower.includes('license');
}

//# sourceMappingURL=xcrun.js.map