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
    TELEMETRY_ENDPOINT: function() {
        return TELEMETRY_ENDPOINT;
    },
    TELEMETRY_TARGET: function() {
        return TELEMETRY_TARGET;
    }
});
const _env = require("../../env");
const TELEMETRY_ENDPOINT = 'https://cdp.expo.dev/v1/batch';
const TELEMETRY_TARGET = _env.env.EXPO_STAGING || _env.env.EXPO_LOCAL ? '24TKICqYKilXM480mA7ktgVDdea' : '24TKR7CQAaGgIrLTgu3Fp4OdOkI'; // expo unified

//# sourceMappingURL=constants.js.map