"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "wrapFetchWithProgress", {
    enumerable: true,
    get: function() {
        return wrapFetchWithProgress;
    }
});
function _undici() {
    const data = require("undici");
    _undici = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
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
const debug = require('debug')('expo:api:fetch:progress');
function wrapFetchWithProgress(fetch) {
    return function fetchWithProgress(url, init) {
        return fetch(url, init).then((response)=>{
            const onProgress = init == null ? void 0 : init.onProgress;
            // Abort if no `onProgress` is provided, the request failed, or there is no response body
            if (!onProgress || !response.ok || !response.body) {
                return response;
            }
            // Calculate total progress size
            const contentLength = response.headers.get('Content-Length');
            const progressTotal = Number(contentLength);
            debug(`Download size: %d`, progressTotal);
            // Abort if the `Content-Length` header is missing or invalid
            if (!progressTotal || isNaN(progressTotal) || progressTotal < 0) {
                _log.warn('Progress callback not supported for network request because "Content-Length" header missing or invalid in response from URL:', url.toString());
                return response;
            }
            debug(`Starting progress animation for: %s`, url);
            // Initialize the progression variables
            let progressCurrent = 0;
            const progressUpdate = ()=>{
                const progress = progressCurrent / progressTotal || 0;
                onProgress({
                    progress,
                    total: progressTotal,
                    loaded: progressCurrent
                });
            };
            // Create a new body-wrapping stream that handles the progression methods
            const bodyReader = response.body.getReader();
            const bodyWithProgress = new ReadableStream({
                start (controller) {
                    function next() {
                        bodyReader.read().then(({ done, value })=>{
                            // Close the controller once stream is done
                            if (done) return controller.close();
                            // Update the progression
                            progressCurrent += Buffer.byteLength(value);
                            progressUpdate();
                            // Continue the stream, and read the next chunk
                            controller.enqueue(value);
                            next();
                        });
                    }
                    progressUpdate();
                    next();
                }
            });
            // Return the new response with the wrapped body stream
            return new (_undici()).Response(bodyWithProgress, response);
        });
    };
}

//# sourceMappingURL=wrapFetchWithProgress.js.map