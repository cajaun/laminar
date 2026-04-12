"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ServeStaticMiddleware", {
    enumerable: true,
    get: function() {
        return ServeStaticMiddleware;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _send() {
    const data = /*#__PURE__*/ _interop_require_default(require("send"));
    _send = function() {
        return data;
    };
    return data;
}
function _url() {
    const data = require("url");
    _url = function() {
        return data;
    };
    return data;
}
const _resolvePlatform = require("./resolvePlatform");
const _env = require("../../../utils/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:server:middleware:serveStatic');
class ServeStaticMiddleware {
    constructor(projectRoot){
        this.projectRoot = projectRoot;
    }
    getHandler() {
        const publicPath = _path().default.join(this.projectRoot, _env.env.EXPO_PUBLIC_FOLDER);
        debug(`Serving static files from:`, publicPath);
        const opts = {
            root: publicPath
        };
        return (req, res, next)=>{
            if (!(req == null ? void 0 : req.url) || req.method !== 'GET' && req.method !== 'HEAD') {
                return next();
            }
            const platform = (0, _resolvePlatform.parsePlatformHeader)(req);
            // Currently this is web-only
            if (platform && platform !== 'web') {
                return next();
            }
            const pathname = (0, _url().parse)(req.url).pathname;
            if (!pathname) {
                return next();
            }
            debug(`Maybe serve static:`, pathname);
            const stream = (0, _send().default)(req, pathname, opts);
            // add file listener for fallthrough
            let forwardError = false;
            stream.on('file', function onFile() {
                // once file is determined, always forward error
                forwardError = true;
            });
            // forward errors
            stream.on('error', function error(err) {
                if (forwardError || !(err.statusCode < 500)) {
                    next(err);
                    return;
                }
                next();
            });
            // pipe
            stream.pipe(res);
        };
    }
}

//# sourceMappingURL=ServeStaticMiddleware.js.map