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
Object.defineProperty(exports, "ClientManager", {
    enumerable: true,
    get: function() {
        return ClientManager;
    }
});
function _stream() {
    const data = require("stream");
    _stream = function() {
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
const _AFCClient = require("./client/AFCClient");
const _DebugserverClient = require("./client/DebugserverClient");
const _InstallationProxyClient = require("./client/InstallationProxyClient");
const _LockdowndClient = require("./client/LockdowndClient");
const _MobileImageMounterClient = require("./client/MobileImageMounterClient");
const _UsbmuxdClient = require("./client/UsbmuxdClient");
const _errors = require("../../../utils/errors");
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
class ClientManager {
    constructor(pairRecord, device, lockdowndClient){
        this.pairRecord = pairRecord;
        this.device = device;
        this.lockdowndClient = lockdowndClient;
        this.connections = [
            lockdowndClient.socket
        ];
    }
    static async create(udid) {
        const usbmuxClient = new _UsbmuxdClient.UsbmuxdClient(_UsbmuxdClient.UsbmuxdClient.connectUsbmuxdSocket());
        const device = await usbmuxClient.getDevice(udid);
        const pairRecord = await usbmuxClient.readPairRecord(device.Properties.SerialNumber);
        const lockdownSocket = await usbmuxClient.connect(device, 62078);
        const lockdownClient = new _LockdowndClient.LockdowndClient(lockdownSocket);
        await lockdownClient.doHandshake(pairRecord);
        return new ClientManager(pairRecord, device, lockdownClient);
    }
    async getUsbmuxdClient() {
        const usbmuxClient = new _UsbmuxdClient.UsbmuxdClient(_UsbmuxdClient.UsbmuxdClient.connectUsbmuxdSocket());
        this.connections.push(usbmuxClient.socket);
        return usbmuxClient;
    }
    async getLockdowndClient() {
        const usbmuxClient = new _UsbmuxdClient.UsbmuxdClient(_UsbmuxdClient.UsbmuxdClient.connectUsbmuxdSocket());
        const lockdownSocket = await usbmuxClient.connect(this.device, 62078);
        const lockdownClient = new _LockdowndClient.LockdowndClient(lockdownSocket);
        this.connections.push(lockdownClient.socket);
        return lockdownClient;
    }
    async getLockdowndClientWithHandshake() {
        const lockdownClient = await this.getLockdowndClient();
        await lockdownClient.doHandshake(this.pairRecord);
        return lockdownClient;
    }
    async getAFCClient() {
        return this.getServiceClient('com.apple.afc', _AFCClient.AFCClient);
    }
    async getInstallationProxyClient() {
        return this.getServiceClient('com.apple.mobile.installation_proxy', _InstallationProxyClient.InstallationProxyClient);
    }
    async getMobileImageMounterClient() {
        return this.getServiceClient('com.apple.mobile.mobile_image_mounter', _MobileImageMounterClient.MobileImageMounterClient);
    }
    async getDebugserverClient() {
        try {
            // iOS 14 added support for a secure debug service so try to connect to that first
            return await this.getServiceClient('com.apple.debugserver.DVTSecureSocketProxy', _DebugserverClient.DebugserverClient);
        } catch  {
            // otherwise, fall back to the previous implementation
            return this.getServiceClient('com.apple.debugserver', _DebugserverClient.DebugserverClient, true);
        }
    }
    async getServiceClient(name, ServiceType, disableSSL = false) {
        const { port: servicePort, enableServiceSSL } = await this.lockdowndClient.startService(name);
        const usbmuxClient = new _UsbmuxdClient.UsbmuxdClient(_UsbmuxdClient.UsbmuxdClient.connectUsbmuxdSocket());
        let usbmuxdSocket = await usbmuxClient.connect(this.device, servicePort);
        if (enableServiceSSL) {
            const tlsOptions = {
                rejectUnauthorized: false,
                secureContext: _tls().createSecureContext({
                    // Avoid using `secureProtocol` fixing the socket to a single TLS version.
                    // Newer Node versions might not support older TLS versions.
                    // By using the default `minVersion` and `maxVersion` options,
                    // The socket will automatically use the appropriate TLS version.
                    // See: https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions
                    cert: this.pairRecord.RootCertificate,
                    key: this.pairRecord.RootPrivateKey
                })
            };
            // Some services seem to not support TLS/SSL after the initial handshake
            // More info: https://github.com/libimobiledevice/libimobiledevice/issues/793
            if (disableSSL) {
                // According to https://nodejs.org/api/tls.html#tls_tls_connect_options_callback we can
                // pass any Duplex in to tls.connect instead of a Socket. So we'll use our proxy to keep
                // the TLS wrapper and underlying usbmuxd socket separate.
                const proxy = new UsbmuxdProxy(usbmuxdSocket);
                tlsOptions.socket = proxy;
                await new Promise((resolve, reject)=>{
                    const timeoutId = setTimeout(()=>{
                        reject(new _errors.CommandError('APPLE_DEVICE', 'The TLS handshake failed to complete after 5s.'));
                    }, 5000);
                    _tls().connect(tlsOptions, function() {
                        clearTimeout(timeoutId);
                        // After the handshake, we don't need TLS or the proxy anymore,
                        // since we'll just pass in the naked usbmuxd socket to the service client
                        this.destroy();
                        resolve();
                    });
                });
            } else {
                tlsOptions.socket = usbmuxdSocket;
                usbmuxdSocket = _tls().connect(tlsOptions);
            }
        }
        const client = new ServiceType(usbmuxdSocket);
        this.connections.push(client.socket);
        return client;
    }
    end() {
        for (const socket of this.connections){
            // may already be closed
            try {
                socket.end();
            } catch  {}
        }
    }
}
class UsbmuxdProxy extends _stream().Duplex {
    constructor(usbmuxdSock){
        super(), this.usbmuxdSock = usbmuxdSock;
        this.usbmuxdSock.on('data', (data)=>{
            this.push(data);
        });
    }
    _write(chunk, encoding, callback) {
        this.usbmuxdSock.write(chunk);
        callback();
    }
    _read(size) {
    // Stub so we don't error, since we push everything we get from usbmuxd as it comes in.
    // TODO: better way to do this?
    }
    _destroy() {
        this.usbmuxdSock.removeAllListeners();
    }
}

//# sourceMappingURL=ClientManager.js.map