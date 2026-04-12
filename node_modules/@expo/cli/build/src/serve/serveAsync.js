"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "serveAsync", {
    enumerable: true,
    get: function() {
        return serveAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _connect() {
    const data = /*#__PURE__*/ _interop_require_default(require("connect"));
    _connect = function() {
        return data;
    };
    return data;
}
function _http() {
    const data = require("expo-server/adapter/http");
    _http = function() {
        return data;
    };
    return data;
}
function _http1() {
    const data = /*#__PURE__*/ _interop_require_default(require("http"));
    _http1 = function() {
        return data;
    };
    return data;
}
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
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _dir = require("../utils/dir");
const _errors = require("../utils/errors");
const _findUp = require("../utils/findUp");
const _nodeEnv = require("../utils/nodeEnv");
const _port = require("../utils/port");
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
const debug = require('debug')('expo:serve');
async function serveAsync(inputDir, options) {
    const projectRoot = (0, _findUp.findUpProjectRootOrAssert)(inputDir);
    (0, _nodeEnv.setNodeEnv)('production');
    require('@expo/env').load(projectRoot);
    const port = await (0, _port.resolvePortAsync)(projectRoot, {
        defaultPort: options.port,
        fallbackPort: 8081
    });
    if (port == null) {
        throw new _errors.CommandError('Could not start server. Port is not available.');
    }
    options.port = port;
    const serverDist = options.isDefaultDirectory ? _path().default.join(inputDir, 'dist') : inputDir;
    //  TODO: `.expo/server/ios`, `.expo/server/android`, etc.
    if (!await (0, _dir.directoryExistsAsync)(serverDist)) {
        throw new _errors.CommandError(`The server directory ${serverDist} does not exist. Run \`npx expo export\` first.`);
    }
    const isStatic = await isStaticExportAsync(serverDist);
    _log.log(_chalk().default.dim(`Starting ${isStatic ? 'static ' : ''}server in ${serverDist}`));
    if (isStatic) {
        await startStaticServerAsync(serverDist, options);
    } else {
        await startDynamicServerAsync(serverDist, options);
    }
    _log.log(`Server running at http://localhost:${options.port}`);
// Detect the type of server we need to setup:
}
async function startStaticServerAsync(dist, options) {
    const server = _http1().default.createServer((req, res)=>{
        var _req_url;
        // Remove query strings and decode URI
        const filePath = decodeURI(((_req_url = req.url) == null ? void 0 : _req_url.split('?')[0]) ?? '');
        (0, _send().default)(req, filePath, {
            root: dist,
            index: 'index.html',
            extensions: [
                'html'
            ]
        }).on('error', (err)=>{
            if (err.status === 404) {
                res.statusCode = 404;
                res.end('Not Found');
                return;
            }
            res.statusCode = err.status || 500;
            res.end('Internal Server Error');
        }).pipe(res);
    });
    server.listen(options.port);
}
async function startDynamicServerAsync(dist, options) {
    const middleware = (0, _connect().default)();
    const staticDirectory = _path().default.join(dist, 'client');
    const serverDirectory = _path().default.join(dist, 'server');
    const serverHandler = (0, _http().createRequestHandler)({
        build: serverDirectory
    });
    // DOM component CORS support
    middleware.use((req, res, next)=>{
        // TODO: Only when origin is `file://` (iOS), and Android equivalent.
        // Required for DOM components security in release builds.
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, expo-platform');
        // Handle OPTIONS preflight requests
        if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
        }
        next();
    });
    middleware.use((req, res, next)=>{
        if (!(req == null ? void 0 : req.url) || req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }
        const pathname = canParseURL(req.url) ? new URL(req.url).pathname : req.url;
        if (!pathname) {
            return next();
        }
        debug(`Maybe serve static:`, pathname);
        const stream = (0, _send().default)(req, pathname, {
            root: staticDirectory,
            extensions: [
                'html'
            ]
        });
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
    });
    middleware.use(serverHandler);
    middleware.listen(options.port);
}
function canParseURL(url) {
    try {
        // eslint-disable-next-line no-new
        new URL(url);
        return true;
    } catch  {
        return false;
    }
}
async function isStaticExportAsync(dist) {
    const routesFile = _path().default.join(dist, `server/_expo/routes.json`);
    return !await (0, _dir.fileExistsAsync)(routesFile);
}

//# sourceMappingURL=serveAsync.js.map