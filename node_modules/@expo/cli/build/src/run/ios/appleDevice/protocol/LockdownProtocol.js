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
    LOCKDOWN_HEADER_SIZE: function() {
        return LOCKDOWN_HEADER_SIZE;
    },
    LockdownProtocolClient: function() {
        return LockdownProtocolClient;
    },
    LockdownProtocolReader: function() {
        return LockdownProtocolReader;
    },
    LockdownProtocolWriter: function() {
        return LockdownProtocolWriter;
    },
    isLockdownErrorResponse: function() {
        return isLockdownErrorResponse;
    },
    isLockdownResponse: function() {
        return isLockdownResponse;
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
const _errors = require("../../../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = (0, _debug().default)('expo:apple-device:protocol:lockdown');
const LOCKDOWN_HEADER_SIZE = 4;
function isDefined(val) {
    return typeof val !== 'undefined';
}
function isLockdownResponse(resp) {
    return isDefined(resp.Status);
}
function isLockdownErrorResponse(resp) {
    return isDefined(resp.Error);
}
class LockdownProtocolClient extends _AbstractProtocol.ProtocolClient {
    constructor(socket){
        super(socket, new _AbstractProtocol.ProtocolReaderFactory(LockdownProtocolReader), new LockdownProtocolWriter());
    }
}
class LockdownProtocolReader extends _AbstractProtocol.PlistProtocolReader {
    constructor(callback){
        super(LOCKDOWN_HEADER_SIZE, callback);
    }
    parseHeader(data) {
        return data.readUInt32BE(0);
    }
    parseBody(data) {
        const resp = super.parseBody(data);
        debug(`Response: ${JSON.stringify(resp)}`);
        if (isLockdownErrorResponse(resp)) {
            if (resp.Error === 'DeviceLocked') {
                throw new _errors.CommandError('APPLE_DEVICE_LOCKED', 'Device is currently locked.');
            }
            if (resp.Error === 'InvalidService') {
                let errorMessage = `${resp.Error}: ${resp.Service} (request: ${resp.Request})`;
                if (resp.Service === 'com.apple.debugserver') {
                    errorMessage += '\nTry reconnecting your device. You can also debug service logs with `export DEBUG=expo:xdl:ios:*`';
                }
                throw new _errors.CommandError('APPLE_DEVICE_LOCKDOWN', errorMessage);
            }
            throw new _errors.CommandError('APPLE_DEVICE_LOCKDOWN', resp.Error);
        }
        return resp;
    }
}
class LockdownProtocolWriter {
    write(socket, plistData) {
        debug(`socket write: ${JSON.stringify(plistData)}`);
        const plistMessage = _plist().default.build(plistData);
        const header = Buffer.alloc(LOCKDOWN_HEADER_SIZE);
        header.writeUInt32BE(plistMessage.length, 0);
        socket.write(header);
        socket.write(plistMessage);
    }
}

//# sourceMappingURL=LockdownProtocol.js.map