"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createBroadcaster", {
    enumerable: true,
    get: function() {
        return createBroadcaster;
    }
});
const debug = require('debug')('expo:metro:dev-server:broadcaster');
function createBroadcaster(sockets) {
    return function broadcast(senderSocketId, message) {
        // Ignore if there are no connected sockets
        if (!sockets.size) return;
        for (const [socketId, socket] of sockets){
            if (socketId === senderSocketId) continue;
            try {
                socket.send(message);
            } catch (error) {
                debug(`Failed to broadcast message to socket "${socketId}"`, error);
            }
        }
    };
}

//# sourceMappingURL=createSocketBroadcaster.js.map