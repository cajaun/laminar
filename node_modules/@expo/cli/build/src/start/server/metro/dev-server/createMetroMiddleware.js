"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createMetroMiddleware", {
    enumerable: true,
    get: function() {
        return createMetroMiddleware;
    }
});
function _connect() {
    const data = /*#__PURE__*/ _interop_require_default(require("connect"));
    _connect = function() {
        return data;
    };
    return data;
}
const _compression = require("./compression");
const _createEventSocket = require("./createEventSocket");
const _createMessageSocket = require("./createMessageSocket");
const _log = require("../../../../log");
const _editor = require("../../../../utils/editor");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function createMetroMiddleware(metroConfig) {
    const messages = (0, _createMessageSocket.createMessagesSocket)({
        logger: _log.Log
    });
    const events = (0, _createEventSocket.createEventsSocket)(messages);
    const middleware = (0, _connect().default)().use(noCacheMiddleware).use(_compression.compression)// Support opening stack frames from clients directly in the editor
    .use('/open-stack-frame', rawBodyMiddleware).use('/open-stack-frame', metroOpenStackFrameMiddleware)// Support the symbolication endpoint of Metro
    // See: https://github.com/facebook/metro/blob/a792d85ffde3c21c3fbf64ac9404ab0afe5ff957/packages/metro/src/Server.js#L1266
    .use('/symbolicate', rawBodyMiddleware)// Support status check to detect if the packager needs to be started from the native side
    .use('/status', createMetroStatusMiddleware(metroConfig));
    return {
        middleware,
        messagesSocket: messages,
        eventsSocket: events,
        websocketEndpoints: {
            [messages.endpoint]: messages.server,
            [events.endpoint]: events.server
        }
    };
}
const noCacheMiddleware = (req, res, next)=>{
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};
const rawBodyMiddleware = (req, _res, next)=>{
    const reqWithBody = req;
    reqWithBody.setEncoding('utf8');
    reqWithBody.rawBody = '';
    reqWithBody.on('data', (chunk)=>reqWithBody.rawBody += chunk);
    reqWithBody.on('end', next);
};
const metroOpenStackFrameMiddleware = (req, res, next)=>{
    // Only accept POST requests
    if (req.method !== 'POST') return next();
    // Only handle requests with a raw body
    if (!('rawBody' in req) || !req.rawBody) {
        res.statusCode = 406;
        return res.end('Open stack frame requires the JSON stack frame as request body');
    }
    const frame = JSON.parse(req.rawBody);
    (0, _editor.openInEditorAsync)(frame.file, frame.lineNumber).finally(()=>res.end('OK'));
};
function createMetroStatusMiddleware(metroConfig) {
    return (_req, res)=>{
        res.setHeader('X-React-Native-Project-Root', encodeURI(metroConfig.projectRoot));
        res.end('packager-status:running');
    };
}

//# sourceMappingURL=createMetroMiddleware.js.map