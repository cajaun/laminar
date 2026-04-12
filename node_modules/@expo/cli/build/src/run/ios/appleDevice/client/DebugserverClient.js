/**
 * Copyright (c) 2021 Expo, Inc.
 * Copyright (c) 2018 Drifty Co.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DebugserverClient", {
    enumerable: true,
    get: function() {
        return DebugserverClient;
    }
});
function _debug() {
    const data = /*#__PURE__*/ _interop_require_default(require("debug"));
    _debug = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _ServiceClient = require("./ServiceClient");
const _GDBProtocol = require("../protocol/GDBProtocol");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const debug = (0, _debug().default)('expo:apple-device:client:debugserver');
class DebugserverClient extends _ServiceClient.ServiceClient {
    constructor(socket){
        super(socket, new _GDBProtocol.GDBProtocolClient(socket)), this.socket = socket;
    }
    async setMaxPacketSize(size) {
        return this.sendCommand('QSetMaxPacketSize:', [
            size.toString()
        ]);
    }
    async setWorkingDir(workingDir) {
        return this.sendCommand('QSetWorkingDir:', [
            workingDir
        ]);
    }
    async checkLaunchSuccess() {
        return this.sendCommand('qLaunchSuccess', []);
    }
    async attachByName(name) {
        const hexName = Buffer.from(name).toString('hex');
        return this.sendCommand(`vAttachName;${hexName}`, []);
    }
    async continue() {
        return this.sendCommand('c', []);
    }
    halt() {
        // ^C
        debug('Sending ^C to debugserver');
        return this.protocolClient.socket.write('\u0003');
    }
    async kill() {
        debug(`kill`);
        const msg = {
            cmd: 'k',
            args: []
        };
        return this.protocolClient.sendMessage(msg, (resp, resolve)=>{
            debug(`kill:response: ${resp}`);
            this.protocolClient.socket.write('+');
            const parts = resp.split(';');
            for (const part of parts){
                if (part.includes('description')) {
                    // description:{hex encoded message like: "Terminated with signal 9"}
                    resolve(Buffer.from(part.split(':')[1], 'hex').toString('ascii'));
                }
            }
        });
    }
    // TODO support app args
    // https://sourceware.org/gdb/onlinedocs/gdb/Packets.html#Packets
    // A arglen,argnum,arg,
    async launchApp(appPath, executableName) {
        const fullPath = _path().join(appPath, executableName);
        const hexAppPath = Buffer.from(fullPath).toString('hex');
        const appCommand = `A${hexAppPath.length},0,${hexAppPath}`;
        return this.sendCommand(appCommand, []);
    }
    async sendCommand(cmd, args) {
        const msg = {
            cmd,
            args
        };
        debug(`Sending command: ${cmd}, args: ${args}`);
        const resp = await this.protocolClient.sendMessage(msg);
        // we need to ACK as well
        this.protocolClient.socket.write('+');
        return resp;
    }
}

//# sourceMappingURL=DebugserverClient.js.map