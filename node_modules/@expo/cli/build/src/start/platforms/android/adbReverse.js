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
    hasAdbReverseAsync: function() {
        return hasAdbReverseAsync;
    },
    startAdbReverseAsync: function() {
        return startAdbReverseAsync;
    },
    stopAdbReverseAsync: function() {
        return stopAdbReverseAsync;
    }
});
const _AndroidSdk = require("./AndroidSdk");
const _adb = require("./adb");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _exit = require("../../../utils/exit");
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
const debug = require('debug')('expo:start:platforms:android:adbReverse');
let removeExitHook = null;
function hasAdbReverseAsync() {
    try {
        return !!(0, _AndroidSdk.assertSdkRoot)();
    } catch (error) {
        debug('Failed to resolve the Android SDK path, skipping ADB: %s', error.message);
        return false;
    }
}
async function startAdbReverseAsync(ports) {
    // Install cleanup automatically...
    removeExitHook = (0, _exit.installExitHooks)(()=>{
        stopAdbReverseAsync(ports);
    });
    const devices = await (0, _adb.getAttachedDevicesAsync)();
    for (const device of devices){
        for (const port of ports){
            if (!await adbReverseAsync(device, port)) {
                debug(`Failed to start reverse port ${port} on device "${device.name}"`);
                return false;
            }
        }
    }
    return true;
}
async function stopAdbReverseAsync(ports) {
    removeExitHook == null ? void 0 : removeExitHook();
    const devices = await (0, _adb.getAttachedDevicesAsync)();
    for (const device of devices){
        for (const port of ports){
            await adbReverseRemoveAsync(device, port);
        }
    }
}
async function adbReverseAsync(device, port) {
    if (!device.isAuthorized) {
        (0, _adb.logUnauthorized)(device);
        return false;
    }
    try {
        await (0, _adb.getServer)().runAsync((0, _adb.adbArgs)(device.pid, 'reverse', `tcp:${port}`, `tcp:${port}`));
        return true;
    } catch (error) {
        _log.warn(`[ADB] Couldn't reverse port ${port}: ${error.message}`);
        return false;
    }
}
async function adbReverseRemoveAsync(device, port) {
    if (!device.isAuthorized) {
        return false;
    }
    try {
        await (0, _adb.getServer)().runAsync((0, _adb.adbArgs)(device.pid, 'reverse', '--remove', `tcp:${port}`));
        return true;
    } catch (error) {
        // Don't send this to warn because we call this preemptively sometimes
        debug(`Could not unforward port ${port}: ${error.message}`);
        return false;
    }
}

//# sourceMappingURL=adbReverse.js.map