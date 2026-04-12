"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FileSystemResponseCache", {
    enumerable: true,
    get: function() {
        return FileSystemResponseCache;
    }
});
function _nodecrypto() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:crypto"));
    _nodecrypto = function() {
        return data;
    };
    return data;
}
function _nodefs() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:fs"));
    _nodefs = function() {
        return data;
    };
    return data;
}
function _nodepath() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:path"));
    _nodepath = function() {
        return data;
    };
    return data;
}
function _nodestream() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("node:stream"));
    _nodestream = function() {
        return data;
    };
    return data;
}
const _dir = require("../../../utils/dir");
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
class FileSystemResponseCache {
    constructor(options){
        this.cacheDirectory = options.cacheDirectory;
        this.timeToLive = options.ttl;
    }
    getFilePaths(cacheKey) {
        // Create a hash of the cache key to use as filename
        const hash = _nodecrypto().default.createHash('sha256').update(cacheKey).digest('hex');
        return {
            info: _nodepath().default.join(this.cacheDirectory, `${hash}-info.json`),
            body: _nodepath().default.join(this.cacheDirectory, `${hash}-body.bin`)
        };
    }
    /** Retrieve the cache response, if any */ async get(cacheKey) {
        const paths = this.getFilePaths(cacheKey);
        if (!await (0, _dir.fileExistsAsync)(paths.info)) {
            return undefined;
        }
        // Read and parse the info file
        const infoBuffer = await _nodefs().default.promises.readFile(paths.info);
        try {
            const responseInfo = JSON.parse(infoBuffer.toString());
            // Check if the response has expired
            if (responseInfo.expiration && responseInfo.expiration < Date.now()) {
                await this.remove(cacheKey);
                return undefined;
            }
            // Remove cache-specific data from the response info
            const { empty, expiration, bodyPath, ...cleanInfo } = responseInfo;
            // Create response body stream
            let responseBody;
            if (empty) {
                responseBody = _nodestream().Readable.toWeb(_nodestream().Readable.from(Buffer.alloc(0)));
            } else {
                const bodyBuffer = await _nodefs().default.promises.readFile(paths.body);
                responseBody = _nodestream().Readable.toWeb(_nodestream().Readable.from(bodyBuffer));
            }
            return {
                body: responseBody,
                info: cleanInfo
            };
        } catch  {
            // If file doesn't exist or other errors, return undefined
            return undefined;
        }
    }
    /** Store the response for caching */ async set(cacheKey, response) {
        await _nodefs().default.promises.mkdir(this.cacheDirectory, {
            recursive: true
        });
        const paths = this.getFilePaths(cacheKey);
        // Create a copy of the response info, to add cache-specific data
        const responseInfo = {
            ...response.info
        };
        // Add expiration time if the "time to live" is set
        if (typeof this.timeToLive === 'number') {
            responseInfo.expiration = Date.now() + this.timeToLive;
        }
        try {
            // Clone the response body stream since we need to read it twice
            const [forSize, forWrite] = response.body.tee();
            // Check if the body is empty by reading the first stream
            const reader = forSize.getReader();
            const { value } = await reader.read();
            reader.releaseLock();
            if (!value || value.length === 0) {
                responseInfo.empty = true;
            } else {
                // Create write stream and pipe response body to file
                const writeStream = _nodefs().default.createWriteStream(paths.body);
                const nodeStream = _nodestream().Readable.fromWeb(forWrite);
                nodeStream.pipe(writeStream);
                // Wait for the stream to finish
                await _nodestream().default.promises.finished(writeStream);
                responseInfo.bodyPath = paths.body;
            }
            // Write info to file
            await _nodefs().default.promises.writeFile(paths.info, JSON.stringify(responseInfo));
            return await this.get(cacheKey);
        } catch (error) {
            // Clean up any partially written files
            await this.remove(cacheKey);
            throw error;
        }
    }
    /** Remove the response from caching */ async remove(cacheKey) {
        const paths = this.getFilePaths(cacheKey);
        await removeAllAsync(paths.info, paths.body);
    }
}
function removeAllAsync(...paths) {
    return Promise.all(paths.map((path)=>_nodefs().default.promises.rm(path, {
            recursive: true,
            force: true
        }).catch(()=>{})));
}

//# sourceMappingURL=FileSystemResponseCache.js.map