"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createDevToolsPluginWebsocketEndpoint", {
    enumerable: true,
    get: function() {
        return createDevToolsPluginWebsocketEndpoint;
    }
});
function _ws() {
    const data = require("ws");
    _ws = function() {
        return data;
    };
    return data;
}
function createDevToolsPluginWebsocketEndpoint() {
    const wss = new (_ws()).WebSocketServer({
        noServer: true
    });
    wss.on('connection', (ws, request)=>{
        ws.on('message', (message, isBinary)=>{
            // Broadcast the received message to all other connected clients
            wss.clients.forEach((client)=>{
                if (client !== ws && client.readyState === _ws().WebSocket.OPEN) {
                    client.send(message, {
                        binary: isBinary
                    });
                }
            });
        });
    });
    return {
        '/expo-dev-plugins/broadcast': wss
    };
}

//# sourceMappingURL=DevToolsPluginWebsocketEndpoint.js.map