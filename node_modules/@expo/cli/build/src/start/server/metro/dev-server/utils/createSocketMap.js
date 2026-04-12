"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createSocketMap", {
    enumerable: true,
    get: function() {
        return createSocketMap;
    }
});
const debug = require('debug')('expo:metro:dev-server:socketmap');
function createSocketMap() {
    const map = new Map();
    const createId = createSocketIdFactory();
    const registerSocket = (socket)=>{
        const id = createId();
        map.set(id, socket);
        return {
            id,
            terminate: ()=>{
                map.delete(id);
                socket.removeAllListeners();
                socket.terminate();
            }
        };
    };
    const findSocket = (id)=>{
        const socket = map.get(id);
        if (!socket) debug(`No connected socket found with ID: ${id}`);
        return socket ?? null;
    };
    return {
        map,
        registerSocket,
        findSocket
    };
}
function createSocketIdFactory() {
    let nextId = 0;
    return ()=>`socket#${nextId++}`;
}

//# sourceMappingURL=createSocketMap.js.map