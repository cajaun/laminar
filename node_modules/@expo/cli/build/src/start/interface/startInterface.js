"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "startInterfaceAsync", {
    enumerable: true,
    get: function() {
        return startInterfaceAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _KeyPressHandler = require("./KeyPressHandler");
const _commandsTable = require("./commandsTable");
const _interactiveActions = require("./interactiveActions");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _editor = require("../../utils/editor");
const _errors = require("../../utils/errors");
const _ora = require("../../utils/ora");
const _progress = require("../../utils/progress");
const _prompts = require("../../utils/prompts");
const _WebSupportProjectPrerequisite = require("../doctor/web/WebSupportProjectPrerequisite");
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
const debug = require('debug')('expo:start:interface:startInterface');
const CTRL_C = '\u0003';
const CTRL_D = '\u0004';
const CTRL_L = '\u000C';
const PLATFORM_SETTINGS = {
    android: {
        name: 'Android',
        key: 'android',
        launchTarget: 'emulator'
    },
    ios: {
        name: 'iOS',
        key: 'ios',
        launchTarget: 'simulator'
    }
};
async function startInterfaceAsync(devServerManager, options) {
    var _devServerManager_getDefaultDevServer;
    const actions = new _interactiveActions.DevServerManagerActions(devServerManager, options);
    const isWebSocketsEnabled = (_devServerManager_getDefaultDevServer = devServerManager.getDefaultDevServer()) == null ? void 0 : _devServerManager_getDefaultDevServer.isTargetingNative();
    const usageOptions = {
        isWebSocketsEnabled,
        devClient: devServerManager.options.devClient,
        ...options
    };
    actions.printDevServerInfo(usageOptions);
    const onPressAsync = async (key)=>{
        // Auxillary commands all escape.
        switch(key){
            case CTRL_C:
            case CTRL_D:
                {
                    // Prevent terminal UI from accepting commands while the process is closing.
                    // Without this, fast typers will close the server then start typing their
                    // next command and have a bunch of unrelated things pop up.
                    (0, _prompts.pauseInteractions)();
                    const spinners = (0, _ora.getAllSpinners)();
                    spinners.forEach((spinner)=>{
                        spinner.fail();
                    });
                    const currentProgress = (0, _progress.getProgressBar)();
                    if (currentProgress) {
                        currentProgress.terminate();
                        (0, _progress.setProgressBar)(null);
                    }
                    const spinner = (0, _ora.ora)({
                        text: 'Stopping server',
                        color: 'white'
                    }).start();
                    try {
                        await devServerManager.stopAsync();
                        if (options.mcpServer) {
                            await options.mcpServer.closeAsync();
                        }
                        spinner.stopAndPersist({
                            text: 'Stopped server',
                            symbol: `\u203A`
                        });
                        // @ts-ignore: Argument of type '"SIGINT"' is not assignable to parameter of type '"disconnect"'.
                        process.emit('SIGINT');
                        // TODO: Is this the right place to do this?
                        process.exit();
                    } catch (error) {
                        spinner.fail('Failed to stop server');
                        throw error;
                    }
                    break;
                }
            case CTRL_L:
                return _log.clear();
            case '?':
                return (0, _commandsTable.printUsage)(usageOptions, {
                    verbose: true
                });
        }
        // Optionally enabled
        if (isWebSocketsEnabled) {
            switch(key){
                case 'm':
                    return actions.toggleDevMenu();
                case 'M':
                    return actions.openMoreToolsAsync();
            }
        }
        const { platforms = [
            'ios',
            'android',
            'web'
        ] } = options;
        if ([
            'i',
            'a'
        ].includes(key.toLowerCase())) {
            const platform = key.toLowerCase() === 'i' ? 'ios' : 'android';
            const shouldPrompt = [
                'I',
                'A'
            ].includes(key);
            if (shouldPrompt) {
                _log.clear();
            }
            const server = devServerManager.getDefaultDevServer();
            const settings = PLATFORM_SETTINGS[platform];
            _log.log(`${_commandsTable.BLT} Opening on ${settings.name}...`);
            if (server.isTargetingNative() && !platforms.includes(settings.key)) {
                _log.warn((0, _chalk().default)`${settings.name} is disabled, enable it by adding {bold ${settings.key}} to the platforms array in your app.json or app.config.js`);
            } else {
                try {
                    await server.openPlatformAsync(settings.launchTarget, {
                        shouldPrompt
                    });
                    (0, _commandsTable.printHelp)();
                } catch (error) {
                    if (!(error instanceof _errors.AbortCommandError)) {
                        _log.exception(error);
                    }
                }
            }
            // Break out early.
            return;
        }
        switch(key){
            case 's':
                {
                    _log.clear();
                    if (await devServerManager.toggleRuntimeMode()) {
                        usageOptions.devClient = devServerManager.options.devClient;
                        return actions.printDevServerInfo(usageOptions);
                    }
                    break;
                }
            case 'w':
                {
                    try {
                        await devServerManager.ensureProjectPrerequisiteAsync(_WebSupportProjectPrerequisite.WebSupportProjectPrerequisite);
                        if (!platforms.includes('web')) {
                            var _options_platforms;
                            platforms.push('web');
                            (_options_platforms = options.platforms) == null ? void 0 : _options_platforms.push('web');
                        }
                    } catch (e) {
                        _log.warn(e.message);
                        break;
                    }
                    const isDisabled = !platforms.includes('web');
                    if (isDisabled) {
                        debug('Web is disabled');
                        break;
                    }
                    // Ensure the Webpack dev server is running first
                    if (!devServerManager.getWebDevServer()) {
                        debug('Starting up webpack dev server');
                        await devServerManager.ensureWebDevServerRunningAsync();
                        // When this is the first time webpack is started, reprint the connection info.
                        actions.printDevServerInfo(usageOptions);
                    }
                    _log.log(`${_commandsTable.BLT} Open in the web browser...`);
                    try {
                        var _devServerManager_getWebDevServer;
                        await ((_devServerManager_getWebDevServer = devServerManager.getWebDevServer()) == null ? void 0 : _devServerManager_getWebDevServer.openPlatformAsync('desktop'));
                        (0, _commandsTable.printHelp)();
                    } catch (error) {
                        if (!(error instanceof _errors.AbortCommandError)) {
                            _log.exception(error);
                        }
                    }
                    break;
                }
            case 'c':
                _log.clear();
                return actions.printDevServerInfo(usageOptions);
            case 'j':
                return actions.openJsInspectorAsync();
            case 'r':
                return actions.reloadApp();
            case 'o':
                _log.log(`${_commandsTable.BLT} Opening the editor...`);
                return (0, _editor.openInEditorAsync)(devServerManager.projectRoot);
        }
    };
    const keyPressHandler = new _KeyPressHandler.KeyPressHandler(onPressAsync);
    const listener = keyPressHandler.createInteractionListener();
    (0, _prompts.addInteractionListener)(listener);
    // Start observing...
    keyPressHandler.startInterceptingKeyStrokes();
}

//# sourceMappingURL=startInterface.js.map