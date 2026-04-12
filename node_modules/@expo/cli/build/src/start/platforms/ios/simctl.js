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
    bootAsync: function() {
        return bootAsync;
    },
    bootDeviceAsync: function() {
        return bootDeviceAsync;
    },
    getBootedSimulatorsAsync: function() {
        return getBootedSimulatorsAsync;
    },
    getContainerPathAsync: function() {
        return getContainerPathAsync;
    },
    getDevicesAsync: function() {
        return getDevicesAsync;
    },
    getInfoPlistValueAsync: function() {
        return getInfoPlistValueAsync;
    },
    installAsync: function() {
        return installAsync;
    },
    isDeviceBootedAsync: function() {
        return isDeviceBootedAsync;
    },
    isOSType: function() {
        return isOSType;
    },
    openAppIdAsync: function() {
        return openAppIdAsync;
    },
    openUrlAsync: function() {
        return openUrlAsync;
    },
    simctlAsync: function() {
        return simctlAsync;
    },
    uninstallAsync: function() {
        return uninstallAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _bplistcreator() {
    const data = /*#__PURE__*/ _interop_require_default(require("bplist-creator"));
    _bplistcreator = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _xcrun = require("./xcrun");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
const _fn = require("../../../utils/fn");
const _plist = require("../../../utils/plist");
const _profile = require("../../../utils/profile");
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
const debug = require('debug')('expo:simctl');
function isOSType(value) {
    if (!value || typeof value !== 'string') return false;
    const knownTypes = [
        'iOS',
        'tvOS',
        'watchOS',
        'macOS'
    ];
    if (!knownTypes.includes(value)) {
        _log.warn(`Unknown OS type: ${value}. Expected one of: ${knownTypes.join(', ')}`);
    }
    return true;
}
async function getContainerPathAsync(device, { appId }) {
    try {
        const { stdout } = await simctlAsync([
            'get_app_container',
            resolveId(device),
            appId
        ]);
        return stdout.trim();
    } catch (error) {
        var _error_stderr;
        if ((_error_stderr = error.stderr) == null ? void 0 : _error_stderr.match(/No such file or directory/)) {
            return null;
        }
        throw error;
    }
}
async function getInfoPlistValueAsync(device, { appId, key, containerPath }) {
    const ensuredContainerPath = containerPath ?? await getContainerPathAsync(device, {
        appId
    });
    if (ensuredContainerPath) {
        try {
            const { output } = await (0, _spawnasync().default)('defaults', [
                'read',
                `${ensuredContainerPath}/Info`,
                key
            ], {
                stdio: 'pipe'
            });
            return output.join('\n').trim();
        } catch  {
            return null;
        }
    }
    return null;
}
/** Rewrite the simulator permissions to allow opening deep links without needing to prompt the user first. */ async function updateSimulatorLinkingPermissionsAsync(device, { url, appId }) {
    if (!device.udid || !appId) {
        debug('Skipping deep link permissions as missing properties could not be found:', {
            url,
            appId,
            udid: device.udid
        });
        return;
    }
    debug('Rewriting simulator permissions to support deep linking:', {
        url,
        appId,
        udid: device.udid
    });
    let scheme;
    try {
        // Attempt to extract the scheme from the URL.
        scheme = new URL(url).protocol.slice(0, -1);
    } catch (error) {
        debug(`Could not parse the URL scheme: ${error.message}`);
        return;
    }
    // Get the hard-coded path to the simulator's scheme approval plist file.
    const plistPath = _path().default.join(_os().default.homedir(), `Library/Developer/CoreSimulator/Devices`, device.udid, `data/Library/Preferences/com.apple.launchservices.schemeapproval.plist`);
    const plistData = _fs().default.existsSync(plistPath) ? await (0, _plist.parsePlistAsync)(plistPath) : // Can be tested by launching a new simulator or by deleting the file and relaunching the simulator.
    {};
    debug('Allowed links:', plistData);
    const key = `com.apple.CoreSimulator.CoreSimulatorBridge-->${scheme}`;
    // Replace any existing value for the scheme with the new appId.
    plistData[key] = appId;
    debug('Allowing deep link:', {
        key,
        appId
    });
    try {
        const data = (0, _bplistcreator().default)(plistData);
        // Write the updated plist back to disk
        await _fs().default.promises.writeFile(plistPath, data);
    } catch (error) {
        _log.warn(`Could not update simulator linking permissions: ${error.message}`);
    }
}
const updateSimulatorLinkingPermissionsAsyncMemo = (0, _fn.memoize)(updateSimulatorLinkingPermissionsAsync);
async function openUrlAsync(device, options) {
    if (options.appId) {
        await (0, _profile.profile)(updateSimulatorLinkingPermissionsAsyncMemo, 'updateSimulatorLinkingPermissionsAsync')({
            udid: device.udid
        }, options);
    }
    try {
        // Skip logging since this is likely to fail.
        await simctlAsync([
            'openurl',
            resolveId(device),
            options.url
        ]);
    } catch (error) {
        var _error_stderr;
        if (!((_error_stderr = error.stderr) == null ? void 0 : _error_stderr.match(/Unable to lookup in current state: Shut/))) {
            throw error;
        }
        // If the device was in a weird in-between state ("Shutting Down" or "Shutdown"), then attempt to reboot it and try again.
        // This can happen when quitting the Simulator app, and immediately pressing `i` to reopen the project.
        // First boot the simulator
        await bootDeviceAsync({
            udid: resolveId(device)
        });
        // Finally, try again...
        return await openUrlAsync(device, options);
    }
}
async function openAppIdAsync(device, options) {
    const results = await openAppIdInternalAsync(device, options);
    // Similar to 194, this is a conformance issue which indicates that the given device has no app that can handle our launch request.
    if (results.status === 4) {
        throw new _errors.CommandError('APP_NOT_INSTALLED', results.stderr);
    }
    return results;
}
async function openAppIdInternalAsync(device, options) {
    try {
        return await simctlAsync([
            'launch',
            resolveId(device),
            options.appId
        ]);
    } catch (error) {
        if ('status' in error) {
            return error;
        }
        throw error;
    }
}
async function bootAsync(device) {
    await bootDeviceAsync(device);
    return isDeviceBootedAsync(device);
}
async function getBootedSimulatorsAsync() {
    const simulatorDeviceInfo = await getRuntimesAsync('devices');
    return Object.values(simulatorDeviceInfo.devices).flatMap((runtime)=>runtime.filter((device)=>device.state === 'Booted'));
}
async function isDeviceBootedAsync(device) {
    // Simulators can be booted even if the app isn't running :(
    const devices = await getBootedSimulatorsAsync();
    if (device.udid) {
        return devices.find((bootedDevice)=>bootedDevice.udid === device.udid) ?? null;
    }
    return devices[0] ?? null;
}
async function bootDeviceAsync(device) {
    try {
        // Skip logging since this is likely to fail.
        await simctlAsync([
            'boot',
            device.udid
        ]);
    } catch (error) {
        var _error_stderr;
        if (!((_error_stderr = error.stderr) == null ? void 0 : _error_stderr.match(/Unable to boot device in current state: Booted/))) {
            throw error;
        }
    }
}
async function installAsync(device, options) {
    return simctlAsync([
        'install',
        resolveId(device),
        options.filePath
    ]);
}
async function uninstallAsync(device, options) {
    return simctlAsync([
        'uninstall',
        resolveId(device),
        options.appId
    ]);
}
function parseSimControlJSONResults(input) {
    try {
        return JSON.parse(input);
    } catch (error) {
        // Nov 15, 2020: Observed this can happen when opening the simulator and the simulator prompts the user to update the xcode command line tools.
        // Unexpected token I in JSON at position 0
        if (error.message.includes('Unexpected token')) {
            _log.error(`Apple's simctl returned malformed JSON:\n${input}`);
        }
        throw error;
    }
}
/** Get all runtime devices given a certain type. */ async function getRuntimesAsync(type, query) {
    const result = await simctlAsync([
        'list',
        type,
        '--json',
        query
    ]);
    const info = parseSimControlJSONResults(result.stdout);
    for (const runtime of Object.keys(info.devices)){
        // Given a string like 'com.apple.CoreSimulator.SimRuntime.tvOS-13-4'
        const runtimeSuffix = runtime.split('com.apple.CoreSimulator.SimRuntime.').pop();
        // Create an array [tvOS, 13, 4]
        const [osType, ...osVersionComponents] = runtimeSuffix.split('-');
        // Join the end components [13, 4] -> '13.4'
        const osVersion = osVersionComponents.join('.');
        const sims = info.devices[runtime];
        for (const device of sims){
            device.runtime = runtime;
            device.osVersion = osVersion;
            device.windowName = `${device.name} (${osVersion})`;
            device.osType = osType;
        }
    }
    return info;
}
async function getDevicesAsync() {
    const simulatorDeviceInfo = await getRuntimesAsync('devices');
    return Object.values(simulatorDeviceInfo.devices).flat();
}
async function simctlAsync(args, options) {
    try {
        return await (0, _xcrun.xcrunAsync)([
            'simctl',
            ...args
        ], options);
    } catch (error) {
        if ((0, _xcrun.isSpawnResultError)(error)) {
        // TODO: Add more tips.
        // if (error.status === 115) {
        // }
        }
        throw error;
    }
}
function resolveId(device) {
    return device.udid ?? 'booted';
}

//# sourceMappingURL=simctl.js.map