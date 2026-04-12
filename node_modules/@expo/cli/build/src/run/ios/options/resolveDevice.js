// import { resolveDestinationsAsync } from './appleDestinations';
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
    isSimulatorDevice: function() {
        return isSimulatorDevice;
    },
    resolveDeviceAsync: function() {
        return resolveDeviceAsync;
    }
});
const _promptDevice = require("./promptDevice");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _AppleDeviceManager = require("../../../start/platforms/ios/AppleDeviceManager");
const _promptAppleDevice = require("../../../start/platforms/ios/promptAppleDevice");
const _simctl = /*#__PURE__*/ _interop_require_wildcard(require("../../../start/platforms/ios/simctl"));
const _array = require("../../../utils/array");
const _errors = require("../../../utils/errors");
const _profile = require("../../../utils/profile");
const _hints = require("../../hints");
const _AppleDevice = /*#__PURE__*/ _interop_require_wildcard(require("../appleDevice/AppleDevice"));
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
// type AnyDevice = SimControl.Device | AppleDevice.ConnectedDevice;
/** Get a list of devices (called destinations) that are connected to the host machine. Filter by `osType` if defined. */ async function getDevicesAsync({ osType }) {
    const devices = await (0, _promptAppleDevice.sortDefaultDeviceToBeginningAsync)((0, _array.uniqBy)((await Promise.all([
        _AppleDevice.getConnectedDevicesAsync(),
        await (0, _profile.profile)(_simctl.getDevicesAsync)()
    ])).flat(), (item)=>item.udid), osType);
    // Sort devices to top of front of the list
    const physical = [];
    const simulators = devices.filter((device)=>{
        if ('isAvailable' in device) {
            return true;
        } else {
            physical.push(device);
            return false;
        }
    });
    const isPhone = (a)=>a.osType === 'iOS';
    const sorted = [
        ...physical.sort((a, b)=>{
            const aPhone = isPhone(a);
            const bPhone = isPhone(b);
            if (aPhone && !bPhone) return -1;
            if (!aPhone && bPhone) return 1;
            return 0;
        }),
        ...simulators
    ];
    // If osType is defined, then filter out ineligible simulators.
    // Only do this inside of the device selection so users who pass the entire device udid can attempt to select any simulator (even if it's invalid).
    return osType ? filterDevicesForOsType(sorted, osType) : sorted;
}
/** @returns a list of devices, filtered by the provided `osType`. */ function filterDevicesForOsType(devices, osType) {
    return devices.filter((device)=>{
        if (osType === 'iOS') {
            // Compatible devices for iOS builds
            return [
                'iOS',
                'macOS',
                'xrOS'
            ].includes(device.osType);
        }
        return device.osType === osType;
    });
}
async function resolveDeviceAsync(device, buildProps) {
    await _AppleDeviceManager.AppleDeviceManager.assertSystemRequirementsAsync();
    if (!device) {
        /** Finds the first possible device and returns in a booted state. */ const manager = await _AppleDeviceManager.AppleDeviceManager.resolveAsync({
            device: {
                osType: buildProps.osType
            }
        });
        _log.debug(`Resolved default device (name: ${manager.device.name}, udid: ${manager.device.udid}, osType: ${buildProps.osType})`);
        return manager.device;
    }
    const devices = await getDevicesAsync(buildProps);
    const resolved = device === true ? // @ts-expect-error
    await (0, _promptDevice.promptDeviceAsync)(devices) : findDeviceFromSearchValue(devices, device.toLowerCase());
    return ensureBootedAsync(resolved);
}
function isSimulatorDevice(device) {
    var _device_deviceType_startsWith, _device_deviceType;
    return !('deviceType' in device) || !!((_device_deviceType = device.deviceType) == null ? void 0 : (_device_deviceType_startsWith = _device_deviceType.startsWith) == null ? void 0 : _device_deviceType_startsWith.call(_device_deviceType, 'com.apple.CoreSimulator.SimDeviceType.'));
}
/** @returns device matching the `searchValue` against name or UDID. */ function findDeviceFromSearchValue(devices, searchValue) {
    const device = devices.find((device)=>device.udid.toLowerCase() === searchValue || device.name.toLowerCase() === searchValue);
    if (!device) {
        throw new _errors.CommandError('BAD_ARGS', `No device UDID or name matching "${searchValue}"`);
    }
    return device;
}
/** Ensures the device is booted if it's a simulator. */ async function ensureBootedAsync(device) {
    // --device with no props after
    (0, _hints.logDeviceArgument)(device.udid);
    if (isSimulatorDevice(device)) {
        return (0, _AppleDeviceManager.ensureSimulatorOpenAsync)({
            udid: device.udid
        });
    }
    return device;
}

//# sourceMappingURL=resolveDevice.js.map