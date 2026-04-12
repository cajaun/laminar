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
    PlistProtocolReader: function() {
        return PlistProtocolReader;
    },
    ProtocolClient: function() {
        return ProtocolClient;
    },
    ProtocolClientError: function() {
        return ProtocolClientError;
    },
    ProtocolReader: function() {
        return ProtocolReader;
    },
    ProtocolReaderFactory: function() {
        return ProtocolReaderFactory;
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
const _errors = require("../../../../utils/errors");
const _plist1 = require("../../../../utils/plist");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const BPLIST_MAGIC = Buffer.from('bplist00');
const debug = (0, _debug().default)('expo:apple-device:protocol');
class ProtocolClientError extends _errors.CommandError {
    constructor(msg, error, protocolMessage){
        super(msg), this.error = error, this.protocolMessage = protocolMessage;
    }
}
class ProtocolReaderFactory {
    constructor(ProtocolReader){
        this.ProtocolReader = ProtocolReader;
    }
    create(callback) {
        return new this.ProtocolReader(callback);
    }
}
class ProtocolReader {
    constructor(headerSize, callback){
        this.headerSize = headerSize;
        this.callback = callback;
        this.buffer = Buffer.alloc(0);
        this.onData = this.onData.bind(this);
    }
    onData(data) {
        try {
            // if there's data, add it on to existing buffer
            this.buffer = data ? Buffer.concat([
                this.buffer,
                data
            ]) : this.buffer;
            // we haven't gotten the body length from the header yet
            if (!this.bodyLength) {
                if (this.buffer.length < this.headerSize) {
                    // partial header, wait for rest
                    return;
                }
                this.bodyLength = this.parseHeader(this.buffer);
                // move on to body
                this.buffer = this.buffer.slice(this.headerSize);
                if (!this.buffer.length) {
                    // only got header, wait for body
                    return;
                }
            }
            if (this.buffer.length < this.bodyLength) {
                // wait for rest of body
                return;
            }
            if (this.bodyLength === -1) {
                this.callback(this.parseBody(this.buffer));
                this.buffer = Buffer.alloc(0);
            } else {
                this.body = this.buffer.slice(0, this.bodyLength);
                this.bodyLength -= this.body.length;
                if (!this.bodyLength) {
                    this.callback(this.parseBody(this.body));
                }
                this.buffer = this.buffer.slice(this.body.length);
                // There are multiple messages here, call parse again
                if (this.buffer.length) {
                    this.onData();
                }
            }
        } catch (err) {
            this.callback(null, err);
        }
    }
}
class PlistProtocolReader extends ProtocolReader {
    parseBody(body) {
        if (BPLIST_MAGIC.compare(body, 0, 8) === 0) {
            return (0, _plist1.parsePlistBuffer)(body);
        } else {
            return _plist().default.parse(body.toString('utf8'));
        }
    }
}
class ProtocolClient {
    constructor(socket, readerFactory, writer){
        this.socket = socket;
        this.readerFactory = readerFactory;
        this.writer = writer;
    }
    sendMessage(msg, callback) {
        const onError = (error)=>{
            debug('Unexpected protocol socket error encountered: %s', error);
            throw new ProtocolClientError(`Unexpected protocol error encountered: ${error.message}`, error, msg);
        };
        return new Promise((resolve, reject)=>{
            const reader = this.readerFactory.create(async (response, error)=>{
                if (error) {
                    reject(error);
                    return;
                }
                if (callback) {
                    callback(response, (value)=>{
                        this.socket.removeListener('data', reader.onData);
                        this.socket.removeListener('error', onError);
                        resolve(value);
                    }, reject);
                } else {
                    this.socket.removeListener('data', reader.onData);
                    this.socket.removeListener('error', onError);
                    resolve(response);
                }
            });
            this.socket.on('data', reader.onData);
            this.socket.on('error', onError);
            this.writer.write(this.socket, msg);
        });
    }
}

//# sourceMappingURL=AbstractProtocol.js.map