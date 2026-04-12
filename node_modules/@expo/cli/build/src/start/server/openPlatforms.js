"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "openPlatformsAsync", {
    enumerable: true,
    get: function() {
        return openPlatformsAsync;
    }
});
const _errors = require("../../utils/errors");
async function openPlatformsAsync(devServerManager, options) {
    const results = await Promise.allSettled([
        options.android ? devServerManager.getDefaultDevServer().openPlatformAsync('emulator') : null,
        options.ios ? devServerManager.getDefaultDevServer().openPlatformAsync('simulator') : null,
        options.web ? devServerManager.ensureWebDevServerRunningAsync().then(()=>{
            var _devServerManager_getWebDevServer;
            return (_devServerManager_getWebDevServer = devServerManager.getWebDevServer()) == null ? void 0 : _devServerManager_getWebDevServer.openPlatformAsync('desktop');
        }) : null
    ]);
    const errors = results.map((result)=>result.status === 'rejected' ? result.reason : null).filter(Boolean);
    if (errors.length) {
        // ctrl+c
        const isEscapedError = errors.some((error)=>error.code === 'ABORTED');
        if (isEscapedError) {
            throw new _errors.AbortCommandError();
        }
        throw errors[0];
    }
    return !!options.android || !!options.ios;
}

//# sourceMappingURL=openPlatforms.js.map