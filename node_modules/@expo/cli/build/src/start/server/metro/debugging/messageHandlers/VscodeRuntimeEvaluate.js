"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VscodeRuntimeEvaluateHandler", {
    enumerable: true,
    get: function() {
        return VscodeRuntimeEvaluateHandler;
    }
});
const _MessageHandler = require("../MessageHandler");
const _getDebuggerType = require("../getDebuggerType");
class VscodeRuntimeEvaluateHandler extends _MessageHandler.MessageHandler {
    isEnabled() {
        return (0, _getDebuggerType.getDebuggerType)(this.debugger.userAgent) === 'vscode';
    }
    handleDebuggerMessage(message) {
        if (message.method === 'Runtime.evaluate' && isVscodeNodeAttachEnvironmentInjection(message)) {
            return this.sendToDebugger({
                id: message.id,
                result: {
                    result: {
                        type: 'string',
                        value: `Hermes doesn't support environment variables through process.env`
                    }
                }
            });
        }
        if (message.method === 'Runtime.evaluate' && isVscodeNodeTelemetry(message)) {
            return this.sendToDebugger({
                id: message.id,
                result: {
                    result: {
                        type: 'object',
                        value: {
                            processId: this.page.id,
                            nodeVersion: process.version,
                            architecture: process.arch
                        }
                    }
                }
            });
        }
        return false;
    }
}
/** @see https://github.com/microsoft/vscode-js-debug/blob/1d104b5184736677ab5cc280c70bbd227403850c/src/targets/node/nodeAttacherBase.ts#L22-L54 */ function isVscodeNodeAttachEnvironmentInjection(message) {
    var _message_params, _message_params1, _message_params2;
    return ((_message_params = message.params) == null ? void 0 : _message_params.expression.includes(`typeof process==='undefined'`)) && ((_message_params1 = message.params) == null ? void 0 : _message_params1.expression.includes(`'process not defined'`)) && ((_message_params2 = message.params) == null ? void 0 : _message_params2.expression.includes(`process.env["NODE_OPTIONS"]`));
}
/** @see https://github.com/microsoft/vscode-js-debug/blob/1d104b5184736677ab5cc280c70bbd227403850c/src/targets/node/nodeLauncherBase.ts#L523-L531 */ function isVscodeNodeTelemetry(message) {
    var _message_params, _message_params1, _message_params2, _message_params3, _message_params4;
    return ((_message_params = message.params) == null ? void 0 : _message_params.expression.includes(`typeof process === 'undefined'`)) && ((_message_params1 = message.params) == null ? void 0 : _message_params1.expression.includes(`'process not defined'`)) && ((_message_params2 = message.params) == null ? void 0 : _message_params2.expression.includes(`process.pid`)) && ((_message_params3 = message.params) == null ? void 0 : _message_params3.expression.includes(`process.version`)) && ((_message_params4 = message.params) == null ? void 0 : _message_params4.expression.includes(`process.arch`));
}

//# sourceMappingURL=VscodeRuntimeEvaluate.js.map