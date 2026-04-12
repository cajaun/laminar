"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveDestinationsAsync", {
    enumerable: true,
    get: function() {
        return resolveDestinationsAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
const _log = require("../../../log");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:apple-destination');
function coerceDestinationPlatformToOsType(platform) {
    // The only two devices I have to test against...
    switch(platform){
        case 'iOS':
            return 'iOS';
        case 'xrOS':
        case 'visionOS':
            return 'xrOS';
        case 'macOS':
            return 'macOS';
        default:
            debug('Unknown destination platform (needs to be added to Expo CLI):', platform);
            return platform;
    }
}
// Runs `.filter(Boolean)` on the array with correct types.
function filterBoolean(array) {
    return array.filter(Boolean);
}
function warnDestinationObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return null;
    }
    if ('platform' in obj && 'id' in obj && 'name' in obj) {
        return obj;
    }
    _log.Log.warn('Unexpected xcode destination object:', obj);
    return null;
}
function parseXcodeDestinationString(str) {
    const parsedLines = filterBoolean(str.trim().split('\n').map((line)=>{
        line = line.trim();
        return line.startsWith('{') ? line : null;
    })).map((line)=>{
        var _line_match;
        const inner = (_line_match = line.match(/{(.*)}/)) == null ? void 0 : _line_match[1];
        if (!inner) return null;
        return Object.fromEntries(filterBoolean(inner.trim().split(', ').map((item)=>{
            var _item_trim_match;
            return (_item_trim_match = item.trim().match(/(?<key>[^:]+):(?<value>.+)/)) == null ? void 0 : _item_trim_match.groups;
        })).map((item)=>[
                item.key,
                item.value
            ]));
    });
    return filterBoolean(parsedLines.map(warnDestinationObject));
}
function coercePhysicalDevice(device) {
    // physical device
    return {
        /** @example `00008101-001964A22629003A` */ udid: device.id,
        /** @example `Evan's phone` */ name: device.name,
        /** @example `iPhone13,4` */ // model: 'UNKNOWN',
        /** @example `device` */ deviceType: 'device',
        osType: coerceDestinationPlatformToOsType(device.platform),
        osVersion: ''
    };
}
function coerceSimulatorDevice(device) {
    // simulator
    return {
        /** '00E55DC0-0364-49DF-9EC6-77BE587137D4' */ udid: device.id,
        /** 'com.apple.CoreSimulator.SimRuntime.iOS-15-1' */ runtime: '',
        /** If the device is "available" which generally means that the OS files haven't been deleted (this can happen when Xcode updates).  */ isAvailable: true,
        deviceTypeIdentifier: '',
        state: 'Shutdown',
        /** 'iPhone 13 Pro' */ name: device.name,
        /** Type of OS the device uses. */ osType: device.platform === 'visionOS Simulator' ? 'xrOS' : 'iOS',
        /** '15.1' */ osVersion: device.OS,
        /** 'iPhone 13 Pro (15.1)' */ windowName: `${device.name} (${device.OS})`
    };
}
function coerceDestinationObjectToKnownDeviceType(device) {
    if (device.arch) {
        // physical device
        return coercePhysicalDevice(device);
    } else if (device.OS) {
        // simulator
        return coerceSimulatorDevice(device);
    } else {
        // "Any device"
        return null;
    }
}
async function resolveDestinationsAsync(props) {
    // xcodebuild -workspace /Users/evanbacon/Documents/GitHub/lab/apr23/ios/apr23.xcworkspace -configuration Debug -scheme apr23 -showdestinations -json
    const { stdout } = await (0, _spawnasync().default)('xcodebuild', [
        props.xcodeProject.isWorkspace ? '-workspace' : '-project',
        props.xcodeProject.name,
        '-configuration',
        props.configuration,
        '-scheme',
        props.scheme,
        '-showdestinations',
        '-quiet'
    ]);
    //   console.log(JSON.stringify(stdout, null, 2));
    const destinationObjects = parseXcodeDestinationString(stdout);
    return filterBoolean(destinationObjects.map(coerceDestinationObjectToKnownDeviceType));
}

//# sourceMappingURL=appleDestinations.js.map