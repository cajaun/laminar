"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "maybeCreateMCPServerAsync", {
    enumerable: true,
    get: function() {
        return maybeCreateMCPServerAsync;
    }
});
function _nodepath() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:path"));
    _nodepath = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _UserSettings = require("../../api/user/UserSettings");
const _log = require("../../log");
const _env = require("../../utils/env");
const _exit = require("../../utils/exit");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const importESM = require('@expo/cli/add-module');
const debug = require('debug')('expo:start:server:mcp');
async function maybeCreateMCPServerAsync({ projectRoot, devServerUrl }) {
    const mcpServer = _env.env.EXPO_UNSTABLE_MCP_SERVER;
    if (!mcpServer) {
        return null;
    }
    const mcpPackagePath = _resolvefrom().default.silent(projectRoot, 'expo-mcp');
    if (!mcpPackagePath) {
        _log.Log.error('Missing the `expo-mcp` package in the project. To enable the MCP integration, add the `expo-mcp` package to your project.');
        return null;
    }
    const mcpTunnelPackagePath = _resolvefrom().default.silent(_nodepath().default.dirname(mcpPackagePath), '@expo/mcp-tunnel');
    if (!mcpTunnelPackagePath) {
        _log.Log.error('Unable to resolve the `@expo/mcp-tunnel` package');
        return null;
    }
    const normalizedServer = /^([a-zA-Z][a-zA-Z\d+\-.]*):\/\//.test(mcpServer) ? mcpServer : `wss://${mcpServer}`;
    const mcpServerUrlObject = new URL(normalizedServer);
    const scheme = mcpServerUrlObject.protocol ?? 'wss:';
    const mcpServerUrl = `${scheme}//${mcpServerUrlObject.host}`;
    debug(`Creating MCP tunnel - server URL: ${mcpServerUrl}`);
    try {
        const { addMcpCapabilities } = await importESM(mcpPackagePath);
        const { TunnelMcpServerProxy } = await importESM(mcpTunnelPackagePath);
        const logger = {
            ..._log.Log,
            debug (...message) {
                debug(...message);
            },
            info (...message) {
                _log.Log.log(...message);
            }
        };
        const serverProxy = new TunnelMcpServerProxy(mcpServerUrl, {
            logger,
            wsHeaders: createAuthHeaders(),
            projectRoot,
            devServerUrl
        });
        addMcpCapabilities(serverProxy, projectRoot);
        const removeExitHook = (0, _exit.installExitHooks)(async ()=>{
            await serverProxy.close();
        });
        const server = serverProxy;
        server.closeAsync = async ()=>{
            removeExitHook();
            await serverProxy.close();
        };
        return server;
    } catch (error) {
        debug(`Error creating MCP tunnel: ${error}`);
    }
    return null;
}
function createAuthHeaders() {
    var _getSession;
    const token = (0, _UserSettings.getAccessToken)();
    if (token) {
        return {
            authorization: `Bearer ${token}`
        };
    }
    const sessionSecret = (_getSession = (0, _UserSettings.getSession)()) == null ? void 0 : _getSession.sessionSecret;
    if (sessionSecret) {
        return {
            'expo-session': sessionSecret
        };
    }
    return {};
}

//# sourceMappingURL=MCP.js.map