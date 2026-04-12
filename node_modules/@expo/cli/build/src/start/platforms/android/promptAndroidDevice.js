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
    formatDeviceChoice: function() {
        return formatDeviceChoice;
    },
    promptForDeviceAsync: function() {
        return promptForDeviceAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _adb = require("./adb");
const _errors = require("../../../utils/errors");
const _prompts = require("../../../utils/prompts");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function promptForDeviceAsync(devices) {
    // TODO: provide an option to add or download more simulators
    const { value } = await (0, _prompts.promptAsync)({
        type: 'autocomplete',
        name: 'value',
        limit: 11,
        message: 'Select a device/emulator',
        choices: devices.map((item)=>formatDeviceChoice(item)),
        suggest: (0, _prompts.createSelectionFilter)()
    });
    const device = devices.find(({ name })=>name === value);
    if ((device == null ? void 0 : device.isAuthorized) === false) {
        (0, _adb.logUnauthorized)(device);
        throw new _errors.AbortCommandError();
    }
    return device;
}
function formatDeviceChoice(device) {
    const symbol = getDeviceChoiceSymbol(device);
    const name = getDeviceChoiceName(device);
    const type = _chalk().default.dim(device.isAuthorized ? device.type : 'unauthorized');
    return {
        value: device.name,
        title: `${symbol}${name} (${type})`
    };
}
/** Get the styled symbol of the device, based on ADB connection type (usb vs network) */ function getDeviceChoiceSymbol(device) {
    if (device.type === 'device' && device.connectionType === 'Network') {
        return '🌐 ';
    }
    if (device.type === 'device') {
        return '🔌 ';
    }
    return '';
}
/** Get the styled name of the device, based on device state */ function getDeviceChoiceName(device) {
    // Use no style changes for a disconnected device that is available to be opened.
    if (!device.isBooted) {
        return device.name;
    }
    // A device that is connected and ready to be used should be bolded to match iOS.
    if (device.isAuthorized) {
        return _chalk().default.bold(device.name);
    }
    // Devices that are unauthorized and connected cannot be used, but they are connected so gray them out.
    return _chalk().default.bold(_chalk().default.gray(device.name));
}

//# sourceMappingURL=promptAndroidDevice.js.map