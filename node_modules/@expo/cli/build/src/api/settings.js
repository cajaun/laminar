// This file represents temporary globals for the CLI when using the API.
// Settings should be as minimal as possible since they are globals.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "disableNetwork", {
    enumerable: true,
    get: function() {
        return disableNetwork;
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
const _env = require("../utils/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function disableNetwork() {
    if (_env.env.EXPO_OFFLINE) return;
    process.env.EXPO_OFFLINE = '1';
    _log.Log.log(_chalk().default.gray('Networking has been disabled'));
}

//# sourceMappingURL=settings.js.map