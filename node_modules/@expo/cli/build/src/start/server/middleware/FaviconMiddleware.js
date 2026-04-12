"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FaviconMiddleware", {
    enumerable: true,
    get: function() {
        return FaviconMiddleware;
    }
});
const _ExpoMiddleware = require("./ExpoMiddleware");
const _favicon = require("../../../export/favicon");
const debug = require('debug')('expo:start:server:middleware:favicon');
class FaviconMiddleware extends _ExpoMiddleware.ExpoMiddleware {
    constructor(projectRoot){
        super(projectRoot, [
            '/favicon.ico'
        ]), this.projectRoot = projectRoot;
    }
    async handleRequestAsync(req, res, next) {
        if (![
            'GET',
            'HEAD'
        ].includes(req.method || '')) {
            return next();
        }
        let faviconImageData;
        try {
            const data = await (0, _favicon.getFaviconFromExpoConfigAsync)(this.projectRoot, {
                force: true
            });
            if (!data) {
                debug('No favicon defined in the Expo Config, skipping generation.');
                return next();
            }
            faviconImageData = data.source;
            debug('✅ Generated favicon successfully.');
        } catch (error) {
            // Pass through on ENOENT errors
            debug('Failed to generate favicon from Expo config:', error);
            if (error.code === 'ENOENT') {
                return next();
            }
            return next(error);
        }
        // Respond with the generated favicon file
        res.setHeader('Content-Type', 'image/x-icon');
        res.end(faviconImageData);
    }
}

//# sourceMappingURL=FaviconMiddleware.js.map