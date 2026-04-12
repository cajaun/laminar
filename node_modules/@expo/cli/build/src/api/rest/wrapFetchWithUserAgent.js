"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "wrapFetchWithUserAgent", {
    enumerable: true,
    get: function() {
        return wrapFetchWithUserAgent;
    }
});
function _nodeprocess() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:process"));
    _nodeprocess = function() {
        return data;
    };
    return data;
}
const _fetch = require("../../utils/fetch");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function wrapFetchWithUserAgent(fetch) {
    return (url, init = {})=>{
        const headers = new _fetch.Headers(init.headers);
        // Version is added in the build script
        headers.append('User-Agent', `expo-cli/${_nodeprocess().default.env.__EXPO_VERSION}`);
        init.headers = headers;
        return fetch(url, init);
    };
}

//# sourceMappingURL=wrapFetchWithUserAgent.js.map