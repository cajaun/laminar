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
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    USBMUXD_HEADER_SIZE: function() {
        return USBMUXD_HEADER_SIZE;
    },
    UsbmuxProtocolClient: function() {
        return UsbmuxProtocolClient;
    },
    UsbmuxProtocolReader: function() {
        return UsbmuxProtocolReader;
    },
    UsbmuxProtocolWriter: function() {
        return UsbmuxProtocolWriter;
    }
});
function _plist() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/plist"));
    _plist = function() {
        return data;
    };
    return data;
}
function _debug() {
    const data = /*#__PURE__*/ _interop_require_default(require("debug"));
    _debug = function() {
        return data;
    };
    return data;
}
const _AbstractProtocol = require("./AbstractProtocol");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = (0, _debug().default)('expo:apple-device:protocol:usbmux');
const USBMUXD_HEADER_SIZE = 16;
class UsbmuxProtocolClient extends _AbstractProtocol.ProtocolClient {
    constructor(socket){
        super(socket, new _AbstractProtocol.ProtocolReaderFactory(UsbmuxProtocolReader), new UsbmuxProtocolWriter());
    }
}
class UsbmuxProtocolReader extends _AbstractProtocol.PlistProtocolReader {
    constructor(callback){
        super(USBMUXD_HEADER_SIZE, callback);
    }
    parseHeader(data) {
        return data.readUInt32LE(0) - USBMUXD_HEADER_SIZE;
    }
    parseBody(data) {
        const resp = super.parseBody(data);
        debug(`Response: ${JSON.stringify(resp)}`);
        return resp;
    }
}
class UsbmuxProtocolWriter {
    write(socket, msg) {
        // TODO Usbmux message type
        debug(`socket write: ${JSON.stringify(msg)}`);
        const { messageType, extraFields } = msg;
        const plistMessage = _plist().default.build({
            BundleID: 'dev.expo.native-run',
            ClientVersionString: 'usbmux.js',
            MessageType: messageType,
            ProgName: 'native-run',
            kLibUSBMuxVersion: 3,
            ...extraFields
        });
        const dataSize = plistMessage ? plistMessage.length : 0;
        const protocolVersion = 1;
        const messageCode = 8;
        const header = Buffer.alloc(USBMUXD_HEADER_SIZE);
        header.writeUInt32LE(USBMUXD_HEADER_SIZE + dataSize, 0);
        header.writeUInt32LE(protocolVersion, 4);
        header.writeUInt32LE(messageCode, 8);
        header.writeUInt32LE(this.useTag++, 12); // TODO
        socket.write(header);
        socket.write(plistMessage);
    }
    constructor(){
        this.useTag = 0;
    }
}

//# sourceMappingURL=UsbmuxProtocol.js.map