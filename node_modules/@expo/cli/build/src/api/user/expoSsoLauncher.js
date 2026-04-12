"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getSessionUsingBrowserAuthFlowAsync", {
    enumerable: true,
    get: function() {
        return getSessionUsingBrowserAuthFlowAsync;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _betteropn() {
    const data = /*#__PURE__*/ _interop_require_default(require("better-opn"));
    _betteropn = function() {
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
function _querystring() {
    const data = /*#__PURE__*/ _interop_require_default(require("querystring"));
    _querystring = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
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
const successBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Expo SSO Login</title>
  <meta charset="utf-8">
  <style type="text/css">
    html {
      margin: 0;
      padding: 0
    }

    body {
      background-color: #fff;
      font-family: Tahoma,Verdana;
      font-size: 16px;
      color: #000;
      max-width: 100%;
      box-sizing: border-box;
      padding: .5rem;
      margin: 1em;
      overflow-wrap: break-word
    }
  </style>
</head>
<body>
  SSO login complete. You may now close this tab and return to the command prompt.
</body>
</html>`;
async function getSessionUsingBrowserAuthFlowAsync({ expoWebsiteUrl }) {
    const scheme = 'http';
    const hostname = 'localhost';
    const path = '/auth/callback';
    const buildExpoSsoLoginUrl = (port)=>{
        const data = {
            app_redirect_uri: `${scheme}://${hostname}:${port}${path}`
        };
        const params = _querystring().default.stringify(data);
        return `${expoWebsiteUrl}/sso-login?${params}`;
    };
    // Start server and begin auth flow
    const executeAuthFlow = ()=>{
        return new Promise(async (resolve, reject)=>{
            const connections = new Set();
            const server = _http().default.createServer((request, response)=>{
                try {
                    var _request_url;
                    if (!(request.method === 'GET' && ((_request_url = request.url) == null ? void 0 : _request_url.includes(path)))) {
                        throw new Error('Unexpected SSO login response.');
                    }
                    const url = new URL(request.url, `http:${request.headers.host}`);
                    const sessionSecret = url.searchParams.get('session_secret');
                    if (!sessionSecret) {
                        throw new Error('Request missing session_secret search parameter.');
                    }
                    resolve(sessionSecret);
                    response.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    response.write(successBody);
                    response.end();
                } catch (error) {
                    reject(error);
                } finally{
                    server.close();
                    // Ensure that the server shuts down
                    for (const connection of connections){
                        connection.destroy();
                    }
                }
            });
            server.listen(0, hostname, ()=>{
                _log.log('Waiting for browser login...');
                const address = server.address();
                (0, _assert().default)(address !== null && typeof address === 'object', 'Server address and port should be set after listening has begun');
                const port = address.port;
                const authorizeUrl = buildExpoSsoLoginUrl(port);
                (0, _betteropn().default)(authorizeUrl);
            });
            server.on('connection', (connection)=>{
                connections.add(connection);
                connection.on('close', ()=>{
                    connections.delete(connection);
                });
            });
        });
    };
    return await executeAuthFlow();
}

//# sourceMappingURL=expoSsoLauncher.js.map