"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createHandlersFactory", {
    enumerable: true,
    get: function() {
        return createHandlersFactory;
    }
});
const _NetworkResponse = require("./messageHandlers/NetworkResponse");
const _VscodeDebuggerGetPossibleBreakpoints = require("./messageHandlers/VscodeDebuggerGetPossibleBreakpoints");
const _VscodeDebuggerSetBreakpointByUrl = require("./messageHandlers/VscodeDebuggerSetBreakpointByUrl");
const _VscodeRuntimeCallFunctionOn = require("./messageHandlers/VscodeRuntimeCallFunctionOn");
const _VscodeRuntimeEvaluate = require("./messageHandlers/VscodeRuntimeEvaluate");
const _VscodeRuntimeGetProperties = require("./messageHandlers/VscodeRuntimeGetProperties");
const _pageIsSupported = require("./pageIsSupported");
const debug = require('debug')('expo:metro:debugging:messageHandlers');
function createHandlersFactory() {
    return (connection)=>{
        debug('Initializing for connection: ', connection.page.title);
        if (!(0, _pageIsSupported.pageIsSupported)(connection.page)) {
            debug('Aborted, unsupported page capabiltiies:', connection.page.capabilities);
            return null;
        }
        const handlers = [
            // Generic handlers
            new _NetworkResponse.NetworkResponseHandler(connection),
            // Vscode-specific handlers
            new _VscodeDebuggerGetPossibleBreakpoints.VscodeDebuggerGetPossibleBreakpointsHandler(connection),
            new _VscodeDebuggerSetBreakpointByUrl.VscodeDebuggerSetBreakpointByUrlHandler(connection),
            new _VscodeRuntimeGetProperties.VscodeRuntimeGetPropertiesHandler(connection),
            new _VscodeRuntimeCallFunctionOn.VscodeRuntimeCallFunctionOnHandler(connection),
            new _VscodeRuntimeEvaluate.VscodeRuntimeEvaluateHandler(connection)
        ].filter((middleware)=>middleware.isEnabled());
        if (!handlers.length) {
            debug('Aborted, all handlers are disabled');
            return null;
        }
        debug('Initialized with handlers: ', handlers.map((middleware)=>middleware.constructor.name).join(', '));
        return {
            handleDeviceMessage: (message)=>withMessageDebug('device', message, handlers.some((middleware)=>middleware.handleDeviceMessage == null ? void 0 : middleware.handleDeviceMessage.call(middleware, message))),
            handleDebuggerMessage: (message)=>withMessageDebug('debugger', message, handlers.some((middleware)=>middleware.handleDebuggerMessage == null ? void 0 : middleware.handleDebuggerMessage.call(middleware, message)))
        };
    };
}
function withMessageDebug(type, message, result) {
    const status = result ? 'handled' : 'ignored';
    const prefix = type === 'device' ? '(debugger) <- (device)' : '(debugger) -> (device)';
    try {
        debug(`%s = %s:`, prefix, status, JSON.stringify(message));
    } catch  {
        debug(`%s = %s:`, prefix, status, 'message not serializable');
    }
    return result || undefined;
}

//# sourceMappingURL=createHandlersFactory.js.map