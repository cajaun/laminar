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
    choosePortAsync: function() {
        return choosePortAsync;
    },
    ensurePortAvailabilityAsync: function() {
        return ensurePortAvailabilityAsync;
    },
    getFreePortAsync: function() {
        return getFreePortAsync;
    },
    resolvePortAsync: function() {
        return resolvePortAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _freeportasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("freeport-async"));
    _freeportasync = function() {
        return data;
    };
    return data;
}
const _env = require("./env");
const _errors = require("./errors");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
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
async function getFreePortAsync(rangeStart) {
    const port = await (0, _freeportasync().default)(rangeStart, {
        hostnames: [
            null,
            'localhost'
        ]
    });
    if (!port) {
        throw new _errors.CommandError('NO_PORT_FOUND', 'No available port found');
    }
    return port;
}
async function ensurePortAvailabilityAsync(projectRoot, { port }) {
    const freePort = await (0, _freeportasync().default)(port, {
        hostnames: [
            null
        ]
    });
    // Check if port has become busy during the build.
    if (freePort === port) {
        return true;
    }
    const isBusy = await isBusyPortRunningSameProcessAsync(projectRoot, {
        port
    });
    if (!isBusy) {
        throw new _errors.CommandError(`Port "${port}" became busy running another process while the app was compiling. Re-run command to use a new port.`);
    }
    // Log that the dev server will not be started and that the logs will appear in another window.
    _log.log('› The dev server for this app is already running in another window. Logs will appear there.');
    return false;
}
function isRestrictedPort(port) {
    if (process.platform !== 'win32' && port < 1024) {
        const isRoot = process.getuid && process.getuid() === 0;
        return !isRoot;
    }
    return false;
}
async function isBusyPortRunningSameProcessAsync(projectRoot, { port }) {
    const { getRunningProcess } = require('./getRunningProcess');
    const runningProcess = isRestrictedPort(port) ? null : getRunningProcess(port);
    if (runningProcess) {
        if (runningProcess.directory === projectRoot) {
            return true;
        } else {
            return false;
        }
    }
    return null;
}
async function choosePortAsync(projectRoot, { defaultPort, host, reuseExistingPort }) {
    try {
        const port = await (0, _freeportasync().default)(defaultPort, {
            hostnames: [
                host ?? null
            ]
        });
        if (port === defaultPort || defaultPort === 0) {
            return port;
        }
        const isRestricted = isRestrictedPort(port);
        let message = isRestricted ? `Admin permissions are required to run a server on a port below 1024` : `Port ${_chalk().default.bold(defaultPort)} is`;
        const { getRunningProcess } = require('./getRunningProcess');
        const runningProcess = isRestricted ? null : getRunningProcess(defaultPort);
        if (runningProcess) {
            const pidTag = _chalk().default.gray(`(pid ${runningProcess.pid})`);
            if (runningProcess.directory === projectRoot) {
                message += ` running this app in another window`;
                if (reuseExistingPort) {
                    return null;
                }
            } else {
                message += ` running ${_chalk().default.cyan(runningProcess.command)} in another window`;
            }
            message += '\n' + _chalk().default.gray(`  ${runningProcess.directory} ${pidTag}`);
        } else {
            message += ' being used by another process';
        }
        _log.log(`\u203A ${message}`);
        const { confirmAsync } = require('./prompts');
        const change = await confirmAsync({
            message: `Use port ${port} instead?`,
            initial: true
        });
        return change ? port : null;
    } catch (error) {
        if (error.code === 'ABORTED') {
            throw error;
        } else if (error.code === 'NON_INTERACTIVE') {
            _log.warn(_chalk().default.yellow(error.message));
            return null;
        }
        throw error;
    }
}
async function resolvePortAsync(projectRoot, { /** Should opt to reuse a port that is running the same project in another window. */ reuseExistingPort, /** Preferred port. */ defaultPort, /** Backup port for when the default isn't available. */ fallbackPort } = {}) {
    let port;
    if (typeof defaultPort === 'string') {
        port = parseInt(defaultPort, 10);
    } else if (typeof defaultPort === 'number') {
        port = defaultPort;
    } else {
        port = _env.env.RCT_METRO_PORT || fallbackPort || 8081;
    }
    // Only check the port when the bundler is running.
    const resolvedPort = await choosePortAsync(projectRoot, {
        defaultPort: port,
        reuseExistingPort
    });
    if (resolvedPort == null) {
        _log.log('\u203A Skipping dev server');
    // Skip bundling if the port is null
    } else {
        // Use the new or resolved port
        process.env.RCT_METRO_PORT = String(resolvedPort);
    }
    return resolvedPort;
}

//# sourceMappingURL=port.js.map