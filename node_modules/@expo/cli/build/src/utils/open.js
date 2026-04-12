"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "openBrowserAsync", {
    enumerable: true,
    get: function() {
        return openBrowserAsync;
    }
});
function _betteropn() {
    const data = /*#__PURE__*/ _interop_require_default(require("better-opn"));
    _betteropn = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function openBrowserAsync(target, options) {
    if (process.platform !== 'win32') {
        return await (0, _betteropn().default)(target, options);
    }
    const oldSystemRoot = process.env.SYSTEMROOT;
    try {
        process.env.SYSTEMROOT = process.env.SYSTEMROOT ?? process.env.SystemRoot;
        return await (0, _betteropn().default)(target, options);
    } finally{
        process.env.SYSTEMROOT = oldSystemRoot;
    }
}

//# sourceMappingURL=open.js.map