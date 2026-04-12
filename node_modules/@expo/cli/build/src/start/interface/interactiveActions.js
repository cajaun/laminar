"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DevServerManagerActions", {
    enumerable: true,
    get: function() {
        return DevServerManagerActions;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _commandsTable = require("./commandsTable");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _env = require("../../utils/env");
const _link = require("../../utils/link");
const _open = require("../../utils/open");
const _prompts = require("../../utils/prompts");
const _JsInspector = require("../server/middleware/inspector/JsInspector");
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
const debug = require('debug')('expo:start:interface:interactiveActions');
class DevServerManagerActions {
    constructor(devServerManager, options){
        this.devServerManager = devServerManager;
        this.options = options;
    }
    printDevServerInfo(options) {
        var _this_options_platforms;
        // If native dev server is running, print its URL.
        if (this.devServerManager.getNativeDevServerPort()) {
            const devServer = this.devServerManager.getDefaultDevServer();
            try {
                const nativeRuntimeUrl = devServer.getNativeRuntimeUrl();
                const interstitialPageUrl = devServer.getRedirectUrl();
                (0, _commandsTable.printQRCode)(interstitialPageUrl ?? nativeRuntimeUrl);
                if (interstitialPageUrl) {
                    _log.log((0, _commandsTable.printItem)((0, _chalk().default)`Choose an app to open your project at {underline ${interstitialPageUrl}}`));
                }
                if (_env.env.__EXPO_E2E_TEST) {
                    // Print the URL to stdout for tests
                    console.info(`[__EXPO_E2E_TEST:server] ${JSON.stringify({
                        url: devServer.getDevServerUrl()
                    })}`);
                }
                _log.log((0, _commandsTable.printItem)((0, _chalk().default)`Metro waiting on {underline ${nativeRuntimeUrl}}`));
                if (options.devClient === false) {
                    // TODO: if development build, change this message!
                    _log.log((0, _commandsTable.printItem)('Scan the QR code above with Expo Go (Android) or the Camera app (iOS)'));
                } else {
                    _log.log((0, _commandsTable.printItem)('Scan the QR code above to open the project in a development build. ' + (0, _link.learnMore)('https://expo.fyi/start')));
                }
            } catch (error) {
                console.log('err', error);
                // @ts-ignore: If there is no development build scheme, then skip the QR code.
                if (error.code !== 'NO_DEV_CLIENT_SCHEME') {
                    throw error;
                } else {
                    const serverUrl = devServer.getDevServerUrl();
                    _log.log((0, _commandsTable.printItem)((0, _chalk().default)`Metro waiting on {underline ${serverUrl}}`));
                    _log.log((0, _commandsTable.printItem)(`Linking is disabled because the client scheme cannot be resolved.`));
                }
            }
        }
        if ((_this_options_platforms = this.options.platforms) == null ? void 0 : _this_options_platforms.includes('web')) {
            const webDevServer = this.devServerManager.getWebDevServer();
            const webUrl = webDevServer == null ? void 0 : webDevServer.getDevServerUrl({
                hostType: 'localhost'
            });
            if (webUrl) {
                _log.log();
                _log.log((0, _commandsTable.printItem)((0, _chalk().default)`Web is waiting on {underline ${webUrl}}`));
            }
        }
        (0, _commandsTable.printUsage)(options, {
            verbose: false
        });
        (0, _commandsTable.printHelp)();
        _log.log();
    }
    async openJsInspectorAsync() {
        try {
            const metroServerOrigin = this.devServerManager.getDefaultDevServer().getJsInspectorBaseUrl();
            const apps = await (0, _JsInspector.queryAllInspectorAppsAsync)(metroServerOrigin);
            if (!apps.length) {
                return _log.warn((0, _chalk().default)`{bold Debug:} No compatible apps connected, React Native DevTools can only be used with Hermes. ${(0, _link.learnMore)('https://docs.expo.dev/guides/using-hermes/')}`);
            }
            const app = await (0, _JsInspector.promptInspectorAppAsync)(apps);
            if (!app) {
                return _log.error((0, _chalk().default)`{bold Debug:} No inspectable device selected`);
            }
            if (!await (0, _JsInspector.openJsInspector)(metroServerOrigin, app)) {
                _log.warn((0, _chalk().default)`{bold Debug:} Failed to open the React Native DevTools, see debug logs for more info.`);
            }
        } catch (error) {
            // Handle aborting prompt
            if (error.code === 'ABORTED') return;
            _log.error('Failed to open the React Native DevTools.');
            _log.exception(error);
        }
    }
    reloadApp() {
        _log.log(`${_commandsTable.BLT} Reloading apps`);
        // Send reload requests over the dev servers
        this.devServerManager.broadcastMessage('reload');
    }
    async openMoreToolsAsync() {
        // Options match: Chrome > View > Developer
        try {
            const defaultMenuItems = [
                {
                    title: 'Inspect elements',
                    value: 'toggleElementInspector'
                },
                {
                    title: 'Toggle performance monitor',
                    value: 'togglePerformanceMonitor'
                },
                {
                    title: 'Toggle developer menu',
                    value: 'toggleDevMenu'
                },
                {
                    title: 'Reload app',
                    value: 'reload'
                }
            ];
            const pluginMenuItems = (await this.devServerManager.devtoolsPluginManager.queryPluginsAsync()).map((plugin)=>({
                    title: (0, _chalk().default)`Open {bold ${plugin.packageName}}`,
                    value: `devtoolsPlugin:${plugin.packageName}`,
                    action: async ()=>{
                        const url = new URL(plugin.webpageEndpoint, this.devServerManager.getDefaultDevServer().getUrlCreator().constructUrl({
                            scheme: 'http'
                        }));
                        await (0, _open.openBrowserAsync)(url.toString());
                    }
                }));
            const menuItems = [
                ...defaultMenuItems,
                ...pluginMenuItems
            ];
            const value = await (0, _prompts.selectAsync)((0, _chalk().default)`Dev tools {dim (native only)}`, menuItems);
            const menuItem = menuItems.find((item)=>item.value === value);
            if (menuItem == null ? void 0 : menuItem.action) {
                menuItem.action();
            } else if (menuItem == null ? void 0 : menuItem.value) {
                this.devServerManager.broadcastMessage('sendDevCommand', {
                    name: menuItem.value
                });
            }
        } catch (error) {
            debug(error);
        // do nothing
        } finally{
            (0, _commandsTable.printHelp)();
        }
    }
    toggleDevMenu() {
        _log.log(`${_commandsTable.BLT} Toggling dev menu`);
        this.devServerManager.broadcastMessage('devMenu');
    }
}

//# sourceMappingURL=interactiveActions.js.map