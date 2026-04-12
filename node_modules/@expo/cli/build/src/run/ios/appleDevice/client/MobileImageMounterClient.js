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
Object.defineProperty(exports, "MobileImageMounterClient", {
    enumerable: true,
    get: function() {
        return MobileImageMounterClient;
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
const debug = (0, _debug().default)('expo:apple-device:client:mobile_image_mounter');
function isMIMUploadCompleteResponse(resp) {
    return resp.Status === 'Complete';
}
function isMIMUploadReceiveBytesResponse(resp) {
    return resp.Status === 'ReceiveBytesAck';
}
class MobileImageMounterClient extends _ServiceClient.ServiceClient {
    constructor(socket){
        super(socket, new _LockdownProtocol.LockdownProtocolClient(socket));
    }
    async mountImage(imagePath, imageSig) {
        debug(`mountImage: ${imagePath}`);
        const resp = await this.protocolClient.sendMessage({
            Command: 'MountImage',
            ImagePath: imagePath,
            ImageSignature: imageSig,
            ImageType: 'Developer'
        });
        if (!(0, _LockdownProtocol.isLockdownResponse)(resp) || resp.Status !== 'Complete') {
            throw new _ServiceClient.ResponseError(`There was an error mounting ${imagePath} on device`, resp);
        }
    }
    async uploadImage(imagePath, imageSig) {
        debug(`uploadImage: ${imagePath}`);
        const imageSize = _fs().statSync(imagePath).size;
        return this.protocolClient.sendMessage({
            Command: 'ReceiveBytes',
            ImageSize: imageSize,
            ImageSignature: imageSig,
            ImageType: 'Developer'
        }, (resp, resolve, reject)=>{
            if (isMIMUploadReceiveBytesResponse(resp)) {
                const imageStream = _fs().createReadStream(imagePath);
                imageStream.pipe(this.protocolClient.socket, {
                    end: false
                });
                imageStream.on('error', (err)=>reject(err));
            } else if (isMIMUploadCompleteResponse(resp)) {
                resolve();
            } else {
                reject(new _ServiceClient.ResponseError(`There was an error uploading image ${imagePath} to the device`, resp));
            }
        });
    }
    async lookupImage() {
        debug('lookupImage');
        return this.protocolClient.sendMessage({
            Command: 'LookupImage',
            ImageType: 'Developer'
        });
    }
}

//# sourceMappingURL=MobileImageMounterClient.js.map