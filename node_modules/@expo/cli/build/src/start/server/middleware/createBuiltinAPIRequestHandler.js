"use strict";
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
    createBuiltinAPIRequestHandler: function() {
        return createBuiltinAPIRequestHandler;
    },
    createRequestHandler: function() {
        return createRequestHandler;
    },
    winterNext: function() {
        return winterNext;
    }
});
function _http() {
    const data = require("expo-server/adapter/http");
    _http = function() {
        return data;
    };
    return data;
}
function createBuiltinAPIRequestHandler(matchRequest, handlers) {
    return createRequestHandler((req)=>{
        if (!matchRequest(req)) {
            winterNext();
        }
        const handler = handlers[req.method];
        if (!handler) {
            notAllowed();
        }
        return handler(req);
    });
}
function createRequestHandler(handleRequest) {
    return async (req, res, next)=>{
        if (!(req == null ? void 0 : req.url) || !req.method) {
            return next();
        }
        // These headers (added by other middleware) break the browser preview of RSC.
        res.removeHeader('X-Content-Type-Options');
        res.removeHeader('Cache-Control');
        res.removeHeader('Expires');
        res.removeHeader('Surrogate-Control');
        try {
            const request = (0, _http().convertRequest)(req, res);
            const response = await handleRequest(request);
            return await (0, _http().respond)(res, response);
        } catch (error) {
            if (error instanceof Error) {
                return await (0, _http().respond)(res, new Response('Internal Server Error: ' + error.message, {
                    status: 500,
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }));
            } else if (error instanceof Response) {
                return await (0, _http().respond)(res, error);
            }
            // http doesn't support async functions, so we have to pass along the
            // error manually using next().
            // @ts-expect-error
            next(error);
        }
    };
}
function notAllowed() {
    throw new Response('Method Not Allowed', {
        status: 405,
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}
function winterNext() {
    // eslint-disable-next-line no-throw-literal
    throw undefined;
}

//# sourceMappingURL=createBuiltinAPIRequestHandler.js.map