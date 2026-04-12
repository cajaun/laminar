"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ContextModuleSourceMapsMiddleware", {
    enumerable: true,
    get: function() {
        return ContextModuleSourceMapsMiddleware;
    }
});
const debug = require('debug')('expo:start:server:middleware:metro-context-modules');
class ContextModuleSourceMapsMiddleware {
    getHandler() {
        return (req, res, next)=>{
            if (!(req == null ? void 0 : req.url) || req.method !== 'GET' && req.method !== 'HEAD') {
                return next();
            }
            if (req.url.match(/%3Fctx=[\d\w\W]+\.map\?/)) {
                debug('Skipping sourcemap request for context module %s', req.url);
                // Return a noop response for the sourcemap
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end('{}');
                return;
            }
            next();
        };
    }
}

//# sourceMappingURL=ContextModuleSourceMapsMiddleware.js.map