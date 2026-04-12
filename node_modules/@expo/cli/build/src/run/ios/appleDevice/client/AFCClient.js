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
Object.defineProperty(exports, "AFCClient", {
    enumerable: true,
    get: function() {
        return AFCClient;
    }
});
function _debug() {
    const data = /*#__PURE__*/ _interop_require_default(require("debug"));
    _debug = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("fs"));
    _fs = function() {
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
function _util() {
    const data = require("util");
    _util = function() {
        return data;
    };
    return data;
}
const _ServiceClient = require("./ServiceClient");
const _errors = require("../../../../utils/errors");
const _AFCProtocol = require("../protocol/AFCProtocol");
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
const debug = (0, _debug().default)('expo:apple-device:client:afc');
const MAX_OPEN_FILES = 240;
class AFCClient extends _ServiceClient.ServiceClient {
    constructor(socket){
        super(socket, new _AFCProtocol.AFCProtocolClient(socket)), this.socket = socket;
    }
    async getFileInfo(path) {
        debug(`getFileInfo: ${path}`);
        const response = await this.protocolClient.sendMessage({
            operation: _AFCProtocol.AFC_OPS.GET_FILE_INFO,
            data: toCString(path)
        });
        debug(`getFileInfo:response: %O`, response);
        const strings = [];
        let currentString = '';
        const tokens = response.data;
        tokens.forEach((token)=>{
            if (token === 0) {
                strings.push(currentString);
                currentString = '';
            } else {
                currentString += String.fromCharCode(token);
            }
        });
        return strings;
    }
    async writeFile(fd, data) {
        debug(`writeFile: ${Array.prototype.toString.call(fd)} data size: ${data.length}`);
        const response = await this.protocolClient.sendMessage({
            operation: _AFCProtocol.AFC_OPS.FILE_WRITE,
            data: fd,
            payload: data
        });
        debug(`writeFile:response:`, response);
        return response;
    }
    async openFile(path) {
        debug(`openFile: ${path}`);
        // mode + path + null terminator
        const data = Buffer.alloc(8 + path.length + 1);
        // write mode
        data.writeUInt32LE(_AFCProtocol.AFC_FILE_OPEN_FLAGS.WRONLY, 0);
        // then path to file
        toCString(path).copy(data, 8);
        const response = await this.protocolClient.sendMessage({
            operation: _AFCProtocol.AFC_OPS.FILE_OPEN,
            data
        });
        // debug(`openFile:response:`, response);
        if (response.operation === _AFCProtocol.AFC_OPS.FILE_OPEN_RES) {
            return response.data;
        }
        throw new _errors.CommandError('APPLE_DEVICE_AFC', `There was an unknown error opening file ${path}, response: ${Array.prototype.toString.call(response.data)}`);
    }
    async closeFile(fd) {
        debug(`closeFile fd: ${Array.prototype.toString.call(fd)}`);
        const response = await this.protocolClient.sendMessage({
            operation: _AFCProtocol.AFC_OPS.FILE_CLOSE,
            data: fd
        });
        debug(`closeFile:response:`, response);
        return response;
    }
    async uploadFile(srcPath, destPath) {
        debug(`uploadFile: ${srcPath}, ${destPath}`);
        // read local file and get fd of destination
        const [srcFile, destFile] = await Promise.all([
            await (0, _util().promisify)(_fs().readFile)(srcPath),
            await this.openFile(destPath)
        ]);
        try {
            await this.writeFile(destFile, srcFile);
            await this.closeFile(destFile);
        } catch (err) {
            await this.closeFile(destFile);
            throw err;
        }
    }
    async makeDirectory(path) {
        debug(`makeDirectory: ${path}`);
        const response = await this.protocolClient.sendMessage({
            operation: _AFCProtocol.AFC_OPS.MAKE_DIR,
            data: toCString(path)
        });
        debug(`makeDirectory:response:`, response);
        return response;
    }
    async uploadDirectory(srcPath, destPath) {
        debug(`uploadDirectory: ${srcPath}`);
        await this.makeDirectory(destPath);
        // AFC doesn't seem to give out more than 240 file handles,
        // so we delay any requests that would push us over until more open up
        let numOpenFiles = 0;
        const pendingFileUploads = [];
        const _this = this;
        return uploadDir(srcPath);
        async function uploadDir(dirPath) {
            const promises = [];
            for (const file of _fs().readdirSync(dirPath)){
                const filePath = _path().join(dirPath, file);
                const remotePath = _path().join(destPath, _path().relative(srcPath, filePath));
                if (_fs().lstatSync(filePath).isDirectory()) {
                    promises.push(_this.makeDirectory(remotePath).then(()=>uploadDir(filePath)));
                } else {
                    // Create promise to add to promises array
                    // this way it can be resolved once a pending upload has finished
                    let resolve;
                    let reject;
                    const promise = new Promise((res, rej)=>{
                        resolve = res;
                        reject = rej;
                    });
                    promises.push(promise);
                    // wrap upload in a function in case we need to save it for later
                    const uploadFile = (tries = 0)=>{
                        numOpenFiles++;
                        _this.uploadFile(filePath, remotePath).then(()=>{
                            resolve();
                            numOpenFiles--;
                            const fn = pendingFileUploads.pop();
                            if (fn) {
                                fn();
                            }
                        }).catch((err)=>{
                            // Couldn't get fd for whatever reason, try again
                            // # of retries is arbitrary and can be adjusted
                            if (err.status === _AFCProtocol.AFC_STATUS.NO_RESOURCES && tries < 10) {
                                debug(`Received NO_RESOURCES from AFC, retrying ${filePath} upload. ${tries}`);
                                uploadFile(tries++);
                            } else {
                                numOpenFiles--;
                                reject(err);
                            }
                        });
                    };
                    if (numOpenFiles < MAX_OPEN_FILES) {
                        uploadFile();
                    } else {
                        debug(`numOpenFiles >= ${MAX_OPEN_FILES}, adding to pending queue. Length: ${pendingFileUploads.length}`);
                        pendingFileUploads.push(uploadFile);
                    }
                }
            }
            await Promise.all(promises);
        }
    }
}
function toCString(s) {
    const buf = Buffer.alloc(s.length + 1);
    const len = buf.write(s);
    buf.writeUInt8(0, len);
    return buf;
}

//# sourceMappingURL=AFCClient.js.map