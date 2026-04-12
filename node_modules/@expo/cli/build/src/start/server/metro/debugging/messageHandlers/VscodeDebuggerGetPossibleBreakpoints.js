"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VscodeDebuggerGetPossibleBreakpointsHandler", {
    enumerable: true,
    get: function() {
        return VscodeDebuggerGetPossibleBreakpointsHandler;
    }
});
const _MessageHandler = require("../MessageHandler");
const _getDebuggerType = require("../getDebuggerType");
class VscodeDebuggerGetPossibleBreakpointsHandler extends _MessageHandler.MessageHandler {
    isEnabled() {
        return (0, _getDebuggerType.getDebuggerType)(this.debugger.userAgent) === 'vscode';
    }
    handleDebuggerMessage(message) {
        if (message.method === 'Debugger.getPossibleBreakpoints') {
            return this.sendToDebugger({
                id: message.id,
                result: {
                    locations: []
                }
            });
        }
        return false;
    }
}

//# sourceMappingURL=VscodeDebuggerGetPossibleBreakpoints.js.map