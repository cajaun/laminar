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
    EMULATOR_MAX_WAIT_TIMEOUT: function() {
        return EMULATOR_MAX_WAIT_TIMEOUT;
    },
    listAvdsAsync: function() {
        return listAvdsAsync;
    },
    startDeviceAsync: function() {
        return startDeviceAsync;
    },
    whichEmulator: function() {
        return whichEmulator;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
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
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
function _os() {
    const data = /*#__PURE__*/ _interop_require_default(require("os"));
    _os = function() {
        return data;
    };
    return data;
}
const _adb = require("./adb");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
const _exit = require("../../../utils/exit");
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
const EMULATOR_MAX_WAIT_TIMEOUT = 60 * 1000 * 3;
function whichEmulator() {
    // https://developer.android.com/studio/command-line/variables
    // TODO: Add ANDROID_SDK_ROOT support as well https://github.com/expo/expo/pull/16516#discussion_r820037917
    if (process.env.ANDROID_HOME) {
        return `${process.env.ANDROID_HOME}/emulator/emulator`;
    }
    return 'emulator';
}
async function listAvdsAsync() {
    try {
        const { stdout } = await (0, _spawnasync().default)(whichEmulator(), [
            '-list-avds'
        ]);
        return stdout.split(_os().default.EOL).filter(Boolean)/**
         * AVD IDs cannot contain spaces. This removes extra info lines from the output. e.g.
         * "INFO    | Storing crashdata in: /tmp/android-brent/emu-crash-34.1.18.db
         */ .filter((name)=>!name.trim().includes(' ')).map((name)=>({
                name,
                type: 'emulator',
                // unsure from this
                isBooted: false,
                isAuthorized: true
            }));
    } catch  {
        return [];
    }
}
async function startDeviceAsync(device, { timeout = EMULATOR_MAX_WAIT_TIMEOUT, interval = 1000 } = {}) {
    _log.log(`\u203A Opening emulator ${_chalk().default.bold(device.name)}`);
    // Start a process to open an emulator
    const emulatorProcess = (0, _child_process().spawn)(whichEmulator(), [
        `@${device.name}`
    ], {
        stdio: 'ignore',
        detached: true
    });
    emulatorProcess.unref();
    return new Promise((resolve, reject)=>{
        const waitTimer = setInterval(async ()=>{
            try {
                const bootedDevices = await (0, _adb.getAttachedDevicesAsync)();
                const connected = bootedDevices.find(({ name })=>name === device.name);
                if (connected) {
                    const isBooted = await (0, _adb.isBootAnimationCompleteAsync)(connected.pid);
                    if (isBooted) {
                        stopWaiting();
                        resolve(connected);
                    }
                }
            } catch (error) {
                stopWaiting();
                reject(error);
            }
        }, interval);
        // Reject command after timeout
        const maxTimer = setTimeout(()=>{
            const manualCommand = `${whichEmulator()} @${device.name}`;
            stopWaitingAndReject(`It took too long to start the Android emulator: ${device.name}. You can try starting the emulator manually from the terminal with: ${manualCommand}`);
        }, timeout);
        const stopWaiting = ()=>{
            clearTimeout(maxTimer);
            clearInterval(waitTimer);
            removeExitHook();
        };
        const stopWaitingAndReject = (message)=>{
            stopWaiting();
            reject(new Error(message));
        };
        const removeExitHook = (0, _exit.installExitHooks)((signal)=>{
            stopWaiting();
            emulatorProcess.kill(signal);
            reject(new _errors.AbortCommandError());
        });
        emulatorProcess.on('error', ({ message })=>stopWaitingAndReject(message));
        emulatorProcess.on('exit', ()=>{
            const manualCommand = `${whichEmulator()} @${device.name}`;
            stopWaitingAndReject(`The emulator (${device.name}) quit before it finished opening. You can try starting the emulator manually from the terminal with: ${manualCommand}`);
        });
    });
}

//# sourceMappingURL=emulator.js.map