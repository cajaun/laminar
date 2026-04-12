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
Object.defineProperty(exports, "LockdowndClient", {
    enumerable: true,
    get: function() {
        return LockdowndClient;
    }
});
function _debug() {
    const data = /*#__PURE__*/ _interop_require_default(require("debug"));
    _debug = function() {
        return data;
    };
    return data;
}
function _tls() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("tls"));
    _tls = function() {
        return data;
    };
    return data;
}
const _ServiceClient = require("./ServiceClient");
const _LockdownProtocol = require("../protocol/LockdownProtocol");
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
const debug = (0, _debug().default)('expo:apple-device:client:lockdownd');
function isLockdowndServiceResponse(resp) {
    return resp.Request === 'StartService' && resp.Service !== undefined && resp.Port !== undefined;
}
function isLockdowndSessionResponse(resp) {
    return resp.Request === 'StartSession';
}
function isLockdowndAllValuesResponse(resp) {
    return resp.Request === 'GetValue' && resp.Value !== undefined;
}
function isLockdowndValueResponse(resp) {
    return resp.Request === 'GetValue' && resp.Key !== undefined && typeof resp.Value === 'string';
}
function isLockdowndQueryTypeResponse(resp) {
    return resp.Request === 'QueryType' && resp.Type !== undefined;
}
class LockdowndClient extends _ServiceClient.ServiceClient {
    constructor(socket){
        super(socket, new _LockdownProtocol.LockdownProtocolClient(socket)), this.socket = socket;
    }
    async startService(name) {
        debug(`startService: ${name}`);
        const resp = await this.protocolClient.sendMessage({
            Request: 'StartService',
            Service: name
        });
        if (isLockdowndServiceResponse(resp)) {
            return {
                port: resp.Port,
                enableServiceSSL: !!resp.EnableServiceSSL
            };
        } else {
            throw new _ServiceClient.ResponseError(`Error starting service ${name}`, resp);
        }
    }
    async startSession(pairRecord) {
        debug(`startSession: ${pairRecord}`);
        const resp = await this.protocolClient.sendMessage({
            Request: 'StartSession',
            HostID: pairRecord.HostID,
            SystemBUID: pairRecord.SystemBUID
        });
        if (isLockdowndSessionResponse(resp)) {
            if (resp.EnableSessionSSL) {
                this.protocolClient.socket = new (_tls()).TLSSocket(this.protocolClient.socket, {
                    secureContext: _tls().createSecureContext({
                        // Avoid using `secureProtocol` fixing the socket to a single TLS version.
                        // Newer Node versions might not support older TLS versions.
                        // By using the default `minVersion` and `maxVersion` options,
                        // The socket will automatically use the appropriate TLS version.
                        // See: https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions
                        cert: pairRecord.RootCertificate,
                        key: pairRecord.RootPrivateKey
                    })
                });
                debug(`Socket upgraded to TLS connection`);
            }
        // TODO: save sessionID for StopSession?
        } else {
            throw new _ServiceClient.ResponseError('Error starting session', resp);
        }
    }
    async getAllValues() {
        debug(`getAllValues`);
        const resp = await this.protocolClient.sendMessage({
            Request: 'GetValue'
        });
        if (isLockdowndAllValuesResponse(resp)) {
            return resp.Value;
        } else {
            throw new _ServiceClient.ResponseError('Error getting lockdown value', resp);
        }
    }
    async getValue(val) {
        debug(`getValue: ${val}`);
        const resp = await this.protocolClient.sendMessage({
            Request: 'GetValue',
            Key: val
        });
        if (isLockdowndValueResponse(resp)) {
            return resp.Value;
        } else {
            throw new _ServiceClient.ResponseError('Error getting lockdown value', resp);
        }
    }
    async queryType() {
        debug('queryType');
        const resp = await this.protocolClient.sendMessage({
            Request: 'QueryType'
        });
        if (isLockdowndQueryTypeResponse(resp)) {
            return resp.Type;
        } else {
            throw new _ServiceClient.ResponseError('Error getting lockdown query type', resp);
        }
    }
    async doHandshake(pairRecord) {
        debug('doHandshake');
        // if (await this.lockdownQueryType() !== 'com.apple.mobile.lockdown') {
        //   throw new CommandError('Invalid type received from lockdown handshake');
        // }
        // await this.getLockdownValue('ProductVersion');
        // TODO: validate pair and pair
        await this.startSession(pairRecord);
    }
}

//# sourceMappingURL=LockdowndClient.js.map