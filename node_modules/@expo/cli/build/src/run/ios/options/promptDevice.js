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
    promptDeviceAsync: function() {
        return promptDeviceAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _prompts = /*#__PURE__*/ _interop_require_default(require("../../../utils/prompts"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function isConnectedDevice(item) {
    return 'deviceType' in item;
}
function isSimControlDevice(item) {
    return 'state' in item;
}
function formatDeviceChoice(item) {
    const isConnected = isConnectedDevice(item) && item.deviceType === 'device';
    const isActive = isSimControlDevice(item) && item.state === 'Booted';
    const symbol = item.osType === 'macOS' ? '🖥️  ' : isConnected ? item.connectionType === 'Network' ? '🌐 ' : '🔌 ' : '';
    const format = isActive ? _chalk().default.bold : (text)=>text;
    return {
        title: `${symbol}${format(item.name)}${item.osVersion ? _chalk().default.dim(` (${item.osVersion})`) : ''}`,
        value: item.udid
    };
}
async function promptDeviceAsync(devices) {
    // --device with no props after
    const { value } = await (0, _prompts.default)({
        type: 'autocomplete',
        name: 'value',
        limit: 11,
        message: 'Select a device',
        choices: devices.map((item)=>formatDeviceChoice(item)),
        suggest: (input, choices)=>{
            const regex = new RegExp(input, 'i');
            return choices.filter((choice)=>regex.test(choice.title));
        }
    });
    return devices.find((device)=>device.udid === value);
}

//# sourceMappingURL=promptDevice.js.map