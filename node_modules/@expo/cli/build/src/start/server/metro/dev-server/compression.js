"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "compression", {
    enumerable: true,
    get: function() {
        return compression;
    }
});
const createCompressionMiddleware = require('compression');
const compressionMiddleware = createCompressionMiddleware();
const compression = (req, res, next)=>{
    // We need to make compression decision based on request,
    // because resposnse is not ready when the middleware is executed.
    if (!req.url) {
        return next();
    }
    const pathname = getPathname(req.url);
    // Detection based on Metro Server implementation
    // All pathnames ending with .bundle or .map are handled as bundles and source maps respectively.
    // https://github.com/facebook/metro/blob/83fd895c567207efb6568cb8850bf05a238d83d2/packages/metro/src/Server.js#L649
    if (isBundle(pathname) || isSourceMap(pathname)) {
        return compressionMiddleware(req, res, next);
    }
    // For all other pathnames, we skip compression.
    return next();
};
function getPathname(url) {
    let pathname;
    try {
        pathname = new URL(url, 'https://expo.dev').pathname;
    } catch  {
        pathname = '';
    }
    return pathname;
}
function isBundle(pathname) {
    return pathname.endsWith('.bundle');
}
function isSourceMap(pathname) {
    return pathname.endsWith('.map');
}

//# sourceMappingURL=compression.js.map