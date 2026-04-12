"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "startBundlerAsync", {
    enumerable: true,
    get: function() {
        return startBundlerAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _startInterface = require("../start/interface/startInterface");
const _DevServerManager = require("../start/server/DevServerManager");
const _env = require("../utils/env");
const _interactive = require("../utils/interactive");
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
async function startBundlerAsync(projectRoot, { port, headless, scheme }) {
    const options = {
        port,
        headless,
        devClient: true,
        minify: false,
        location: {
            scheme
        }
    };
    const devServerManager = await _DevServerManager.DevServerManager.startMetroAsync(projectRoot, options);
    // Present the Terminal UI.
    if (!headless && (0, _interactive.isInteractive)()) {
        // Only read the config if we are going to use the results.
        const { exp } = (0, _config().getConfig)(projectRoot, {
            // We don't need very many fields here, just use the lightest possible read.
            skipSDKVersionRequirement: true,
            skipPlugins: true
        });
        await (0, _startInterface.startInterfaceAsync)(devServerManager, {
            platforms: exp.platforms ?? []
        });
    } else {
        var _devServerManager_getDefaultDevServer;
        // Display the server location in CI...
        const url = (_devServerManager_getDefaultDevServer = devServerManager.getDefaultDevServer()) == null ? void 0 : _devServerManager_getDefaultDevServer.getDevServerUrl();
        if (url) {
            if (_env.env.__EXPO_E2E_TEST) {
                // Print the URL to stdout for tests
                console.info(`[__EXPO_E2E_TEST:server] ${JSON.stringify({
                    url
                })}`);
            }
            _log.log((0, _chalk().default)`Waiting on {underline ${url}}`);
        }
    }
    if (!options.headless) {
        await devServerManager.watchEnvironmentVariables();
        await devServerManager.bootstrapTypeScriptAsync();
    }
    return devServerManager;
}

//# sourceMappingURL=startBundler.js.map