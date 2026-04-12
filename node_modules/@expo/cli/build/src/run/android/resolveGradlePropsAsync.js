"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveGradlePropsAsync", {
    enumerable: true,
    get: function() {
        return resolveGradlePropsAsync;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _adb = require("../../start/platforms/android/adb");
const _errors = require("../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Supported ABIs for Android. see https://developer.android.com/ndk/guides/abis
const VALID_ARCHITECTURES = [
    'armeabi-v7a',
    'arm64-v8a',
    'x86',
    'x86_64'
];
function assertVariant(variant) {
    if (variant && typeof variant !== 'string') {
        throw new _errors.CommandError('BAD_ARGS', '--variant must be a string');
    }
    return variant ?? 'debug';
}
async function resolveGradlePropsAsync(projectRoot, options, device) {
    const variant = assertVariant(options.variant);
    // NOTE(EvanBacon): Why would this be different? Can we get the different name?
    const appName = 'app';
    const apkDirectory = _path().default.join(projectRoot, 'android', appName, 'build', 'outputs', 'apk');
    // buildDeveloperTrust -> buildtype: trust, flavors: build, developer
    // developmentDebug -> buildType: debug, flavors: development
    // productionRelease -> buildType: release, flavors: production
    // This won't work for non-standard flavor names like "myFlavor" would be treated as "my", "flavor".
    const flavors = variant.split(/(?=[A-Z])/).map((v)=>v.toLowerCase());
    const buildType = flavors.pop() ?? 'debug';
    const apkVariantDirectory = _path().default.join(apkDirectory, ...flavors, buildType);
    const architectures = await getConnectedDeviceABIS(buildType, device, options.allArch);
    return {
        appName,
        buildType,
        flavors,
        apkVariantDirectory,
        architectures
    };
}
async function getConnectedDeviceABIS(buildType, device, allArch) {
    // Follow the same behavior as iOS, only enable this for debug builds
    if (allArch || buildType !== 'debug') {
        return '';
    }
    const abis = await (0, _adb.getDeviceABIsAsync)(device);
    const validAbis = abis.filter((abi)=>VALID_ARCHITECTURES.includes(abi));
    return validAbis.filter((abi, i, arr)=>arr.indexOf(abi) === i).join(',');
}

//# sourceMappingURL=resolveGradlePropsAsync.js.map