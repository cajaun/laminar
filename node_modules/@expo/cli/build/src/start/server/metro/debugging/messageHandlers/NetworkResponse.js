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
    NETWORK_RESPONSE_STORAGE: function() {
        return NETWORK_RESPONSE_STORAGE;
    },
    NetworkResponseHandler: function() {
        return NetworkResponseHandler;
    }
});
const _MessageHandler = require("../MessageHandler");
const NETWORK_RESPONSE_STORAGE = new Map();
class NetworkResponseHandler extends _MessageHandler.MessageHandler {
    handleDeviceMessage(message) {
        if (message.method === 'Expo(Network.receivedResponseBody)') {
            const { requestId, ...requestInfo } = message.params;
            this.storage.set(requestId, requestInfo);
            return true;
        }
        return false;
    }
    handleDebuggerMessage(message) {
        if (message.method === 'Network.getResponseBody' && this.storage.has(message.params.requestId)) {
            return this.sendToDebugger({
                id: message.id,
                result: this.storage.get(message.params.requestId)
            });
        }
        return false;
    }
    constructor(...args){
        super(...args), /** All known responses, mapped by request id */ this.storage = NETWORK_RESPONSE_STORAGE;
    }
}

//# sourceMappingURL=NetworkResponse.js.map