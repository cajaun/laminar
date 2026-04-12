"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createMessagesSocket", {
    enumerable: true,
    get: function() {
        return createMessagesSocket;
    }
});
function _nodeurl() {
    const data = require("node:url");
    _nodeurl = function() {
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
function createMessagesSocket(options) {
    const clients = (0, _createSocketMap.createSocketMap)();
    const broadcast = (0, _createSocketBroadcaster.createBroadcaster)(clients.map);
    const server = new (_ws()).WebSocketServer({
        noServer: true
    });
    server.on('connection', (socket, req)=>{
        const client = clients.registerSocket(socket);
        // Assign the query parameters to the socket, used for `getpeers` requests
        // NOTE(cedric): this looks like a legacy feature, might be able to drop it
        if (req.url) {
            Object.defineProperty(socket, '_upgradeQuery', {
                value: (0, _nodeurl().parse)(req.url).query
            });
        }
        // Register disconnect handlers
        socket.on('close', client.terminate);
        socket.on('error', client.terminate);
        // Register message handler
        socket.on('message', createClientMessageHandler(socket, client.id, clients, broadcast));
    });
    return {
        endpoint: '/message',
        server,
        broadcast: (method, params)=>{
            if (clients.map.size === 0) {
                return options.logger.warn(`No apps connected. Sending "${method}" to all React Native apps failed. Make sure your app is running in the simulator or on a phone connected via USB.`);
            }
            broadcast(null, (0, _socketMessages.serializeMessage)({
                method,
                params
            }));
        }
    };
}
function createClientMessageHandler(socket, clientId, clients, broadcast) {
    function handleServerRequest(message) {
        // Ignore messages without identifiers, unable to link responses
        if (!message.id) return;
        if (message.method === 'getid') {
            return socket.send((0, _socketMessages.serializeMessage)({
                id: message.id,
                result: clientId
            }));
        }
        if (message.method === 'getpeers') {
            const peers = {};
            clients.map.forEach((peerSocket, peerSocketId)=>{
                if (peerSocketId !== clientId) {
                    peers[peerSocketId] = '_upgradeQuery' in peerSocket ? peerSocket._upgradeQuery : {};
                }
            });
            return socket.send((0, _socketMessages.serializeMessage)({
                id: message.id,
                result: peers
            }));
        }
    }
    return (data, isBinary)=>{
        const message = (0, _socketMessages.parseRawMessage)(data, isBinary);
        if (!message) return;
        // Handle broadcast messages
        if (messageIsBroadcast(message)) {
            return broadcast(null, data.toString());
        }
        // Handle incoming requests from clients
        if (messageIsRequest(message)) {
            var _clients_findSocket;
            if (message.target === 'server') {
                return handleServerRequest(message);
            }
            return (_clients_findSocket = clients.findSocket(message.target)) == null ? void 0 : _clients_findSocket.send((0, _socketMessages.serializeMessage)({
                method: message.method,
                params: message.params,
                id: !message.id ? undefined : {
                    requestId: message.id,
                    clientId
                }
            }));
        }
        // Handle incoming responses
        if (messageIsResponse(message)) {
            var _clients_findSocket1;
            return (_clients_findSocket1 = clients.findSocket(message.id.clientId)) == null ? void 0 : _clients_findSocket1.send((0, _socketMessages.serializeMessage)({
                id: message.id.requestId,
                result: message.result,
                error: message.error
            }));
        }
    };
}
function messageIsBroadcast(message) {
    return 'method' in message && typeof message.method === 'string' && (!('id' in message) || message.id === undefined) && (!('target' in message) || message.target === undefined);
}
function messageIsRequest(message) {
    return 'method' in message && typeof message.method === 'string' && 'target' in message && typeof message.target === 'string';
}
function messageIsResponse(message) {
    return 'id' in message && typeof message.id === 'object' && typeof message.id.requestId !== 'undefined' && typeof message.id.clientId === 'string' && ('result' in message && !!message.result || 'error' in message && !!message.error);
}

//# sourceMappingURL=createMessageSocket.js.map