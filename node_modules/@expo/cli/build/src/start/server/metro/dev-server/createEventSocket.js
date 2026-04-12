"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createEventsSocket", {
    enumerable: true,
    get: function() {
        return createEventsSocket;
    }
});
function _prettyformat() {
    const data = require("pretty-format");
    _prettyformat = function() {
        return data;
    };
    return data;
}
function _ws() {
    const data = require("ws");
    _ws = function() {
        return data;
    };
    return data;
}
const _createSocketBroadcaster = require("./utils/createSocketBroadcaster");
const _createSocketMap = require("./utils/createSocketMap");
const _socketMessages = require("./utils/socketMessages");
const debug = require('debug')('expo:metro:devserver:eventsSocket');
function createEventsSocket(options) {
    const clients = (0, _createSocketMap.createSocketMap)();
    const broadcast = (0, _createSocketBroadcaster.createBroadcaster)(clients.map);
    const server = new (_ws()).WebSocketServer({
        noServer: true,
        verifyClient ({ origin }) {
            // This exposes the full JS logs and enables issuing commands like reload
            // so let's make sure only locally running stuff can connect to it
            // origin is only checked if it is set, e.g. when the request is made from a (CORS) browser
            // any 'back-end' connection isn't CORS at all, and has full control over the origin header,
            // so there is no point in checking it security wise
            return !origin || origin.startsWith('http://localhost:') || origin.startsWith('file:');
        }
    });
    server.on('connection', (socket)=>{
        const client = clients.registerSocket(socket);
        // Register disconnect handlers
        socket.on('close', client.terminate);
        socket.on('error', client.terminate);
        // Register message handler
        socket.on('message', (data, isBinary)=>{
            const message = (0, _socketMessages.parseRawMessage)(data, isBinary);
            if (!message) return;
            if (message.type === 'command') {
                options.broadcast(message.command, message.params);
            } else {
                debug(`Received unknown message type: ${message.type}`);
            }
        });
    });
    return {
        endpoint: '/events',
        server: new (_ws()).WebSocketServer({
            noServer: true
        }),
        reportMetroEvent: (event)=>{
            // Avoid serializing data if there are no clients
            if (!clients.map.size) {
                return;
            }
            return broadcast(null, serializeMetroEvent(event));
        }
    };
}
function serializeMetroEvent(message) {
    // Some types reported by Metro are not serializable
    if (message && message.error && message.error instanceof Error) {
        return (0, _socketMessages.serializeMessage)({
            ...message,
            error: (0, _prettyformat().format)(message.error, {
                escapeString: true,
                highlight: true,
                maxDepth: 3,
                min: true
            })
        });
    }
    if (message && message.type === 'client_log') {
        return (0, _socketMessages.serializeMessage)({
            ...message,
            data: message.data.map((item)=>typeof item === 'string' ? item : (0, _prettyformat().format)(item, {
                    escapeString: true,
                    highlight: true,
                    maxDepth: 3,
                    min: true,
                    plugins: [
                        _prettyformat().plugins.ReactElement
                    ]
                }))
        });
    }
    return (0, _socketMessages.serializeMessage)(message);
}

//# sourceMappingURL=createEventSocket.js.map