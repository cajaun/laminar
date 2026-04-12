"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VscodeDebuggerSetBreakpointByUrlHandler", {
    enumerable: true,
    get: function() {
        return VscodeDebuggerSetBreakpointByUrlHandler;
    }
});
const _MessageHandler = require("../MessageHandler");
const _getDebuggerType = require("../getDebuggerType");
class VscodeDebuggerSetBreakpointByUrlHandler extends _MessageHandler.MessageHandler {
    isEnabled() {
        return (0, _getDebuggerType.getDebuggerType)(this.debugger.userAgent) === 'vscode';
    }
    handleDebuggerMessage(message) {
        if (message.method === 'Debugger.setBreakpointByUrl' && message.params.urlRegex) {
            // Explicitly force the breakpoint to be unbounded
            message.params.url = 'file://__invalid_url__';
            delete message.params.urlRegex;
        }
        return false;
    }
}

//# sourceMappingURL=VscodeDebuggerSetBreakpointByUrl.js.map