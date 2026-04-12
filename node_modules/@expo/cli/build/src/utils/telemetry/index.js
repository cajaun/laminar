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
    getTelemetry: function() {
        return getTelemetry;
    },
    record: function() {
        return record;
    },
    recordCommand: function() {
        return recordCommand;
    }
});
function _nodeprocess() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:process"));
    _nodeprocess = function() {
        return data;
    };
    return data;
}
const _events = require("./events");
const _user = require("../../api/user/user");
const _env = require("../env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/** The singleton telemetry manager to use */ let telemetry = null;
function getTelemetry() {
    if (_env.env.EXPO_NO_TELEMETRY || _env.env.EXPO_OFFLINE) return null;
    if (!telemetry) {
        // Lazy load the telemetry client, only when enabled
        const { Telemetry } = require('./Telemetry');
        telemetry = new Telemetry();
        // Flush any pending events on exit
        _nodeprocess().default.once('SIGINT', ()=>telemetry == null ? void 0 : telemetry.flushOnExit());
        _nodeprocess().default.once('SIGTERM', ()=>telemetry == null ? void 0 : telemetry.flushOnExit());
        _nodeprocess().default.once('beforeExit', ()=>telemetry == null ? void 0 : telemetry.flushOnExit());
        // Initialize the telemetry
        (0, _user.getUserAsync)().then((actor)=>telemetry == null ? void 0 : telemetry.initialize({
                userId: (actor == null ? void 0 : actor.id) ?? null
            })).catch(()=>telemetry == null ? void 0 : telemetry.initialize({
                userId: null
            }));
    }
    return telemetry;
}
function record(records) {
    var _getTelemetry;
    return (_getTelemetry = getTelemetry()) == null ? void 0 : _getTelemetry.record(records);
}
function recordCommand(command) {
    if (isLongRunningCommand(command)) {
        var _getTelemetry;
        (_getTelemetry = getTelemetry()) == null ? void 0 : _getTelemetry.setStrategy('instant');
    }
    return record((0, _events.commandEvent)(command));
}
/** Determine if the command is a long-running command, based on the command name */ function isLongRunningCommand(command) {
    return command === 'start' || command.startsWith('run') || command.startsWith('export');
}

//# sourceMappingURL=index.js.map