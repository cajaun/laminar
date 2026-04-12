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
    GDBProtocolClient: function() {
        return GDBProtocolClient;
    },
    GDBProtocolReader: function() {
        return GDBProtocolReader;
    },
    GDBProtocolWriter: function() {
        return GDBProtocolWriter;
    },
    validateChecksum: function() {
        return validateChecksum;
    }
});
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
const debug = (0, _debug().default)('expo:apple-device:protocol:gdb');
const ACK_SUCCESS = '+'.charCodeAt(0);
class GDBProtocolClient extends _AbstractProtocol.ProtocolClient {
    constructor(socket){
        super(socket, new _AbstractProtocol.ProtocolReaderFactory(GDBProtocolReader), new GDBProtocolWriter());
    }
}
class GDBProtocolReader extends _AbstractProtocol.ProtocolReader {
    constructor(callback){
        super(1 /* "Header" is '+' or '-' */ , callback);
    }
    onData(data) {
        // the GDB protocol does not support body length in its header so we cannot rely on
        // the parent implementation to determine when a payload is complete
        try {
            // if there's data, add it to the existing buffer
            this.buffer = data ? Buffer.concat([
                this.buffer,
                data
            ]) : this.buffer;
            // do we have enough bytes to proceed
            if (this.buffer.length < this.headerSize) {
                return; // incomplete header, wait for more
            }
            // first, check the header
            if (this.parseHeader(this.buffer) === -1) {
                // we have a valid header so check the body. GDB packets will always be a leading '$', data bytes,
                // a trailing '#', and a two digit checksum. minimum valid body is the empty response '$#00'
                // https://developer.apple.com/library/archive/documentation/DeveloperTools/gdb/gdb/gdb_33.html
                const packetData = this.buffer.toString().match('\\$.*#[0-9a-f]{2}');
                if (packetData == null) {
                    return; // incomplete body, wait for more
                }
                // extract the body and update the buffer
                const body = Buffer.from(packetData[0]);
                this.buffer = this.buffer.slice(this.headerSize + body.length);
                // parse the payload and recurse if there is more data to process
                this.callback(this.parseBody(body));
                if (this.buffer.length) {
                    this.onData();
                }
            }
        } catch (err) {
            this.callback(null, err);
        }
    }
    parseHeader(data) {
        if (data[0] !== ACK_SUCCESS) {
            throw new _errors.CommandError('APPLE_DEVICE_GDB', 'Unsuccessful debugserver response');
        } // TODO: retry?
        return -1;
    }
    parseBody(buffer) {
        debug(`Response body: ${buffer.toString()}`);
        // check for checksum
        const checksum = buffer.slice(-3).toString();
        if (checksum.match(/#[0-9a-f]{2}/)) {
            // remove '$' prefix and checksum
            const msg = buffer.slice(1, -3).toString();
            if (validateChecksum(checksum, msg)) {
                return msg;
            } else if (msg.startsWith('E')) {
                if (msg.match(/the device was not, or could not be, unlocked/)) {
                    throw new _errors.CommandError('APPLE_DEVICE_LOCKED', 'Device is currently locked.');
                }
                // Error message from debugserver -- Drop the `E`
                return msg.slice(1);
            } else {
                throw new _errors.CommandError('APPLE_DEVICE_GDB', `Invalid checksum received from debugserver. (checksum: ${checksum}, msg: ${msg})`);
            }
        } else {
            throw new _errors.CommandError('APPLE_DEVICE_GDB', "Didn't receive checksum");
        }
    }
}
class GDBProtocolWriter {
    write(socket, msg) {
        const { cmd, args } = msg;
        debug(`Socket write: ${cmd}, args: ${args}`);
        // hex encode and concat all args
        const encodedArgs = args.map((arg)=>Buffer.from(arg).toString('hex')).join().toUpperCase();
        const checksumStr = calculateChecksum(cmd + encodedArgs);
        const formattedCmd = `$${cmd}${encodedArgs}#${checksumStr}`;
        socket.write(formattedCmd);
    }
}
// hex value of (sum of cmd chars mod 256)
function calculateChecksum(cmdStr) {
    let checksum = 0;
    for(let i = 0; i < cmdStr.length; i++){
        checksum += cmdStr.charCodeAt(i);
    }
    let result = (checksum % 256).toString(16);
    // pad if necessary
    if (result.length === 1) {
        result = `0${result}`;
    }
    return result;
}
function validateChecksum(checksum, msg) {
    // remove '#' from checksum
    const checksumVal = checksum.startsWith('#') ? checksum.slice(1) : checksum;
    // remove '$' from msg and calculate its checksum
    const computedChecksum = calculateChecksum(msg);
    // debug(`Checksum: ${checksumVal}, computed checksum: ${computedChecksum}`);
    return checksumVal === computedChecksum;
}

//# sourceMappingURL=GDBProtocol.js.map