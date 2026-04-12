// Copyright © 2023 650 Industries.
// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// Forks https://github.com/facebook/metro/blob/b80d9a0f638ee9fb82ff69cd3c8d9f4309ca1da2/packages/metro/src/index.flow.js#L57
// and adds the ability to access the bundler instance.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "runServer", {
    enumerable: true,
    get: function() {
        return runServer;
    }
});
function _metro() {
    const data = require("@expo/metro/metro");
    _metro = function() {
        return data;
    };
    return data;
}
function _HmrServer() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro/HmrServer"));
    _HmrServer = function() {
        return data;
    };
    return data;
}
function _createWebsocketServer() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/metro/metro/lib/createWebsocketServer"));
    _createWebsocketServer = function() {
        return data;
    };
    return data;
}
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _http() {
    const data = /*#__PURE__*/ _interop_require_default(require("http"));
    _http = function() {
        return data;
    };
    return data;
}
function _https() {
    const data = /*#__PURE__*/ _interop_require_default(require("https"));
    _https = function() {
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
const _log = require("../../../log");
const _getRunningProcess = require("../../../utils/getRunningProcess");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const runServer = async (metroBundler, config, { hasReducedPerformance = false, host, onError, onReady, secureServerOptions, waitForBundler = false, websocketEndpoints = {}, watch }, { mockServer })=>{
    // await earlyPortCheck(host, config.server.port);
    // if (secure != null || secureCert != null || secureKey != null) {
    //   // eslint-disable-next-line no-console
    //   console.warn(
    //     chalk.inverse.yellow.bold(' DEPRECATED '),
    //     'The `secure`, `secureCert`, and `secureKey` options are now deprecated. ' +
    //       'Use the `secureServerOptions` object instead to pass options to ' +
    //       "Metro's https development server.",
    //   );
    // }
    const { middleware, end, metroServer } = await (0, _metro().createConnectMiddleware)(config, {
        hasReducedPerformance,
        waitForBundler,
        watch
    });
    if (!mockServer) {
        (0, _assert().default)(typeof middleware.use === 'function');
    }
    const serverApp = middleware;
    let httpServer;
    if (secureServerOptions != null) {
        httpServer = _https().default.createServer(secureServerOptions, serverApp);
    } else {
        httpServer = _http().default.createServer(serverApp);
    }
    httpServer.on('error', (error)=>{
        if ('code' in error && error.code === 'EADDRINUSE') {
            // If `Error: listen EADDRINUSE: address already in use :::8081` then print additional info
            // about the process before throwing.
            const info = (0, _getRunningProcess.getRunningProcess)(config.server.port);
            if (info) {
                _log.Log.error(`Port ${config.server.port} is busy running ${info.command} in: ${info.directory}`);
            }
        }
        if (onError) {
            onError(error);
        }
        end();
    });
    // Disable any kind of automatic timeout behavior for incoming
    // requests in case it takes the packager more than the default
    // timeout of 120 seconds to respond to a request.
    httpServer.timeout = 0;
    httpServer.on('close', ()=>{
        end();
    });
    // Extend the close method to ensure all websocket servers are closed, and connections are terminated
    const originalClose = httpServer.close.bind(httpServer);
    httpServer.close = function closeHttpServer(callback) {
        originalClose(callback);
        // Close all websocket servers, including possible client connections (see: https://github.com/websockets/ws/issues/2137#issuecomment-1507469375)
        for (const endpoint of Object.values(websocketEndpoints)){
            endpoint.close();
            endpoint.clients.forEach((client)=>client.terminate());
        }
        // Forcibly close active connections
        this.closeAllConnections();
        return this;
    };
    if (mockServer) {
        return {
            server: httpServer,
            hmrServer: null,
            metro: metroServer
        };
    }
    return new Promise((resolve, reject)=>{
        httpServer.on('error', (error)=>{
            reject(error);
        });
        httpServer.listen(config.server.port, host, ()=>{
            if (onReady) {
                onReady(httpServer);
            }
            const hmrServer = new (_HmrServer()).default(metroServer.getBundler(), metroServer.getCreateModuleId(), config);
            Object.assign(websocketEndpoints, {
                '/hot': (0, _createWebsocketServer().default)({
                    websocketServer: hmrServer
                })
            });
            httpServer.on('upgrade', (request, socket, head)=>{
                const { pathname } = (0, _url().parse)(request.url);
                if (pathname != null && websocketEndpoints[pathname]) {
                    websocketEndpoints[pathname].handleUpgrade(request, socket, head, (ws)=>{
                        websocketEndpoints[pathname].emit('connection', ws, request);
                    });
                } else {
                    socket.destroy();
                }
            });
            resolve({
                server: httpServer,
                hmrServer,
                metro: metroServer
            });
        });
    });
};

//# sourceMappingURL=runServer-fork.js.map