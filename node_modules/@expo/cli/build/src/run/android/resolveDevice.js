"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveDeviceAsync", {
    enumerable: true,
    get: function() {
        return resolveDeviceAsync;
    }
});
const _AndroidDeviceManager = require("../../start/platforms/android/AndroidDeviceManager");
const _hints = require("../hints");
const debug = require('debug')('expo:android:resolveDevice');
async function resolveDeviceAsync(device) {
    if (!device) {
        const manager = await _AndroidDeviceManager.AndroidDeviceManager.resolveAsync();
        debug(`Resolved default device (name: ${manager.device.name}, pid: ${manager.device.pid})`);
        return manager;
    }
    debug(`Resolving device from argument: ${device}`);
    const manager = device === true ? await _AndroidDeviceManager.AndroidDeviceManager.resolveAsync({
        shouldPrompt: true
    }) : await _AndroidDeviceManager.AndroidDeviceManager.resolveFromNameAsync(device);
    (0, _hints.logDeviceArgument)(manager.device.name);
    return manager;
}

//# sourceMappingURL=resolveDevice.js.map