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
    parseRawMessage: function() {
        return parseRawMessage;
    },
    serializeMessage: function() {
        return serializeMessage;
    }
});
const debug = require('debug')('expo:metro:dev-server:messages');
/** The current websocket-based communication between Metro, CLI, and client devices */ const PROTOCOL_VERSION = 2;
function parseRawMessage(data, isBinary) {
    if (isBinary) return null;
    try {
        const { version, ...message } = JSON.parse(data.toString()) ?? {};
        if (version === PROTOCOL_VERSION) {
            return message;
        }
        debug(`Received message protocol version did not match supported "${PROTOCOL_VERSION}", received: ${message.version}`);
    } catch (error) {
        debug(`Failed to parse message: ${error}`);
    }
    return null;
}
function serializeMessage(message) {
    return JSON.stringify({
        ...message,
        version: PROTOCOL_VERSION
    });
}

//# sourceMappingURL=socketMessages.js.map