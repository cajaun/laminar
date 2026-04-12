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
    DevToolsPluginEndpoint: function() {
        return _DevToolsPluginManager.DevToolsPluginEndpoint;
    },
    DevToolsPluginMiddleware: function() {
        return DevToolsPluginMiddleware;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
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
const _ExpoMiddleware = require("./ExpoMiddleware");
const _DevToolsPluginManager = require("../DevToolsPluginManager");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class DevToolsPluginMiddleware extends _ExpoMiddleware.ExpoMiddleware {
    constructor(projectRoot, pluginManager){
        super(projectRoot, [
            _DevToolsPluginManager.DevToolsPluginEndpoint
        ]), this.pluginManager = pluginManager;
    }
    shouldHandleRequest(req) {
        var _req_url;
        if (!((_req_url = req.url) == null ? void 0 : _req_url.startsWith(_DevToolsPluginManager.DevToolsPluginEndpoint))) {
            return false;
        }
        return true;
    }
    async handleRequestAsync(req, res) {
        (0, _assert().default)(req.headers.host, 'Request headers must include host');
        const { pathname } = new URL(req.url ?? '/', `http://${req.headers.host}`);
        const pluginName = this.queryPossiblePluginName(pathname.substring(_DevToolsPluginManager.DevToolsPluginEndpoint.length + 1));
        const webpageRoot = await this.pluginManager.queryPluginWebpageRootAsync(pluginName);
        if (!webpageRoot) {
            res.statusCode = 404;
            res.end();
            return;
        }
        const pathInPluginRoot = pathname.substring(_DevToolsPluginManager.DevToolsPluginEndpoint.length + pluginName.length + 1) || '/';
        (0, _send().default)(req, pathInPluginRoot, {
            root: webpageRoot
        }).pipe(res);
    }
    queryPossiblePluginName(pathname) {
        const parts = pathname.split('/');
        if (parts[0][0] === '@' && parts.length > 1) {
            // Scoped package name
            return `${parts[0]}/${parts[1]}`;
        }
        return parts[0];
    }
}

//# sourceMappingURL=DevToolsPluginMiddleware.js.map