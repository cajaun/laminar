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
    logDeviceArgument: function() {
        return logDeviceArgument;
    },
    logPlatformRunCommand: function() {
        return logPlatformRunCommand;
    },
    logProjectLogsLocation: function() {
        return logProjectLogsLocation;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _log = require("../log");
const _interactive = require("../utils/interactive");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function logDeviceArgument(id) {
    _log.Log.log(_chalk().default.dim`› Using --device ${id}`);
}
function logPlatformRunCommand(platform, argv = []) {
    _log.Log.log(_chalk().default.dim(`› Using expo run:${platform} ${argv.join(' ')}`));
}
function logProjectLogsLocation() {
    _log.Log.log((0, _chalk().default)`\n› Logs for your project will appear below.${(0, _interactive.isInteractive)() ? _chalk().default.dim(` Press Ctrl+C to exit.`) : ''}`);
}

//# sourceMappingURL=hints.js.map