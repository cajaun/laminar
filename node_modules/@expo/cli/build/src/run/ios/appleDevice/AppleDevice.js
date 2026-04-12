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
    getConnectedDevicesAsync: function() {
        return getConnectedDevicesAsync;
    },
    runOnDevice: function() {
        return runOnDevice;
    }
});
function _debug() {
    const data = /*#__PURE__*/ _interop_require_default(require("debug"));
    _debug = function() {
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _ClientManager = require("./ClientManager");
const _LockdowndClient = require("./client/LockdowndClient");
const _UsbmuxdClient = require("./client/UsbmuxdClient");
const _AFCProtocol = require("./protocol/AFCProtocol");
const _log = require("../../../log");
const _XcodeDeveloperDiskImagePrerequisite = require("../../../start/doctor/apple/XcodeDeveloperDiskImagePrerequisite");
const _devicectl = /*#__PURE__*/ _interop_require_wildcard(require("../../../start/platforms/ios/devicectl"));
const _array = require("../../../utils/array");
const _delay = require("../../../utils/delay");
const _errors = require("../../../utils/errors");
const _exit = require("../../../utils/exit");
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
const debug = (0, _debug().default)('expo:apple-device');
async function getConnectedDevicesUsingNativeToolsAsync() {
    return (await _devicectl.getConnectedAppleDevicesAsync())// Filter out unpaired and unavailable devices.
    // TODO: We could improve this logic in the future to attempt pairing if specified.
    .filter((device)=>device.connectionProperties.pairingState === 'paired' && device.connectionProperties.tunnelState !== 'unavailable').map((device)=>{
        return {
            name: device.deviceProperties.name,
            model: device.hardwareProperties.productType,
            osVersion: device.deviceProperties.osVersionNumber,
            udid: device.hardwareProperties.udid,
            deviceType: 'device',
            connectionType: device.connectionProperties.transportType === 'localNetwork' ? 'Network' : 'USB',
            osType: coercePlatformToOsType(device.hardwareProperties.platform)
        };
    });
}
function coercePlatformToOsType(platform) {
    // The only two devices I have to test against...
    switch(platform){
        case 'iOS':
            return 'iOS';
        case 'xrOS':
            return 'xrOS';
        default:
            debug('Unknown devicectl platform (needs to be added to Expo CLI):', platform);
            return platform;
    }
}
function coerceUsbmuxdPlatformToOsType(platform) {
    // The only connectable device I have to test against...
    switch(platform){
        case 'iPhone':
        case 'iPad':
        case 'iPhone OS':
            return 'iOS';
        default:
            debug('Unknown usbmuxd platform (needs to be added to Expo CLI):', platform);
            return platform;
    }
}
async function getConnectedDevicesAsync() {
    const devices = await Promise.all([
        // Prioritize native tools since they can provide more accurate information.
        // NOTE: xcrun is substantially slower than custom tooling. +1.5s vs 9ms.
        (0, _profile.profile)(getConnectedDevicesUsingNativeToolsAsync)(),
        (0, _profile.profile)(getConnectedDevicesUsingCustomToolingAsync)()
    ]);
    return (0, _array.uniqBy)(devices.flat(), (device)=>device.udid);
}
/**
 * This supports devices that are running OS versions older than iOS 17.
 *
 * @returns a list of connected Apple devices.
 */ async function getConnectedDevicesUsingCustomToolingAsync() {
    const client = new _UsbmuxdClient.UsbmuxdClient(_UsbmuxdClient.UsbmuxdClient.connectUsbmuxdSocket());
    const devices = await client.getDevices();
    client.socket.end();
    return Promise.all(devices.map(async (device)=>{
        const socket = await new _UsbmuxdClient.UsbmuxdClient(_UsbmuxdClient.UsbmuxdClient.connectUsbmuxdSocket()).connect(device, 62078);
        const deviceValues = await new _LockdowndClient.LockdowndClient(socket).getAllValues();
        socket.end();
        // TODO(EvanBacon): Add support for osType (ipad, watchos, etc)
        return {
            // TODO(EvanBacon): Better name
            name: deviceValues.DeviceName ?? deviceValues.ProductType ?? 'unknown iOS device',
            model: deviceValues.ProductType,
            osVersion: deviceValues.ProductVersion,
            deviceType: 'device',
            connectionType: device.Properties.ConnectionType,
            udid: device.Properties.SerialNumber,
            osType: coerceUsbmuxdPlatformToOsType(deviceValues.DeviceClass)
        };
    }));
}
async function runOnDevice({ udid, appPath, bundleId, waitForApp, deltaPath, onProgress }) {
    debug('Running on device:', {
        udid,
        appPath,
        bundleId,
        waitForApp,
        deltaPath
    });
    const clientManager = await _ClientManager.ClientManager.create(udid);
    try {
        await mountDeveloperDiskImage(clientManager);
        const packageName = _path().default.basename(appPath);
        const destPackagePath = _path().default.join('PublicStaging', packageName);
        await uploadApp(clientManager, {
            appBinaryPath: appPath,
            destinationPath: destPackagePath
        });
        const installer = await clientManager.getInstallationProxyClient();
        await installer.installApp(destPackagePath, bundleId, {
            // https://github.com/ios-control/ios-deploy/blob/0f2ffb1e564aa67a2dfca7cdf13de47ce489d835/src/ios-deploy/ios-deploy.m#L2491-L2508
            ApplicationsType: 'Any',
            CFBundleIdentifier: bundleId,
            CloseOnInvalidate: '1',
            InvalidateOnDetach: '1',
            IsUserInitiated: '1',
            // Disable checking for wifi devices, this is nominally faster.
            PreferWifi: '0',
            // Only info I could find on these:
            // https://github.com/wwxxyx/Quectel_BG96/blob/310876f90fc1093a59e45e381160eddcc31697d0/Apple_Homekit/homekit_certification_tools/ATS%206/ATS%206/ATS.app/Contents/Frameworks/CaptureKit.framework/Versions/A/Resources/MobileDevice/MobileInstallation.h#L112-L121
            PackageType: 'Developer',
            ShadowParentKey: deltaPath
        }, onProgress);
        const { // TODO(EvanBacon): This can be undefined when querying App Clips.
        [bundleId]: appInfo } = await installer.lookupApp([
            bundleId
        ]);
        if (appInfo) {
            // launch fails with EBusy or ENotFound if you try to launch immediately after install
            await (0, _delay.delayAsync)(200);
            const debugServerClient = await launchApp(clientManager, {
                bundleId,
                appInfo,
                detach: !waitForApp
            });
            if (waitForApp && debugServerClient) {
                (0, _exit.installExitHooks)(async ()=>{
                    // causes continue() to return
                    debugServerClient.halt();
                    // give continue() time to return response
                    await (0, _delay.delayAsync)(64);
                });
                debug(`Waiting for app to close...\n`);
                const result = await debugServerClient.continue();
                // TODO: I have no idea what this packet means yet (successful close?)
                // if not a close (ie, most likely due to halt from onBeforeExit), then kill the app
                if (result !== 'W00') {
                    await debugServerClient.kill();
                }
            }
        } else {
            _log.Log.warn(`App "${bundleId}" installed but couldn't be launched. Open on device manually.`);
        }
    } finally{
        clientManager.end();
    }
}
/** Mount the developer disk image for Xcode. */ async function mountDeveloperDiskImage(clientManager) {
    const imageMounter = await clientManager.getMobileImageMounterClient();
    // Check if already mounted. If not, mount.
    if (!(await imageMounter.lookupImage()).ImageSignature) {
        // verify DeveloperDiskImage exists (TODO: how does this work on Windows/Linux?)
        // TODO: if windows/linux, download?
        const version = await (await clientManager.getLockdowndClient()).getValue('ProductVersion');
        const developerDiskImagePath = await _XcodeDeveloperDiskImagePrerequisite.XcodeDeveloperDiskImagePrerequisite.instance.assertAsync({
            version
        });
        const developerDiskImageSig = _fs().default.readFileSync(`${developerDiskImagePath}.signature`);
        await imageMounter.uploadImage(developerDiskImagePath, developerDiskImageSig);
        await imageMounter.mountImage(developerDiskImagePath, developerDiskImageSig);
    }
}
async function uploadApp(clientManager, { appBinaryPath, destinationPath }) {
    const afcClient = await clientManager.getAFCClient();
    try {
        await afcClient.getFileInfo('PublicStaging');
    } catch (err) {
        if (err instanceof _AFCProtocol.AFCError && err.status === _AFCProtocol.AFC_STATUS.OBJECT_NOT_FOUND) {
            await afcClient.makeDirectory('PublicStaging');
        } else {
            throw err;
        }
    }
    await afcClient.uploadDirectory(appBinaryPath, destinationPath);
}
async function launchAppWithUsbmux(clientManager, { appInfo, detach }) {
    let tries = 0;
    while(tries < 3){
        const debugServerClient = await clientManager.getDebugserverClient();
        await debugServerClient.setMaxPacketSize(1024);
        await debugServerClient.setWorkingDir(appInfo.Container);
        await debugServerClient.launchApp(appInfo.Path, appInfo.CFBundleExecutable);
        const result = await debugServerClient.checkLaunchSuccess();
        if (result === 'OK') {
            if (detach) {
                // https://github.com/libimobiledevice/libimobiledevice/blob/25059d4c7d75e03aab516af2929d7c6e6d4c17de/tools/idevicedebug.c#L455-L464
                const res = await debugServerClient.sendCommand('D', []);
                debug('Disconnect from debug server request:', res);
                if (res !== 'OK') {
                    console.warn('Something went wrong while attempting to disconnect from iOS debug server, you may need to reopen the app manually.');
                }
            }
            return debugServerClient;
        } else if (result === 'EBusy' || result === 'ENotFound') {
            debug('Device busy or app not found, trying to launch again in .5s...');
            tries++;
            debugServerClient.socket.end();
            await (0, _delay.delayAsync)(500);
        } else {
            throw new _errors.CommandError(`There was an error launching app: ${result}`);
        }
    }
    throw new _errors.CommandError('Unable to launch app, number of tries exceeded');
}
/**
 * iOS 17 introduces a new protocol called RemoteXPC.
 * This is not yet implemented, so we fallback to devicectl.
 *
 * @see https://github.com/doronz88/pymobiledevice3/blob/master/misc/RemoteXPC.md#process-remoted
 */ async function launchApp(clientManager, { bundleId, appInfo, detach }) {
    try {
        return await launchAppWithUsbmux(clientManager, {
            appInfo,
            detach
        });
    } catch (error) {
        debug('Failed to launch app with Usbmuxd, falling back to xcrun...', error);
        // Get the device UDID and close the connection, to allow `xcrun devicectl` to connect
        const deviceId = clientManager.device.Properties.SerialNumber;
        clientManager.end();
        // Fallback to devicectl for iOS 17 support
        return await (0, _devicectl.launchAppWithDeviceCtl)(deviceId, bundleId);
    }
}

//# sourceMappingURL=AppleDevice.js.map