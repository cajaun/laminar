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
    downloadExpoGoAsync: function() {
        return downloadExpoGoAsync;
    },
    getExpoGoVersionEntryAsync: function() {
        return getExpoGoVersionEntryAsync;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _semver() {
    const data = require("semver");
    _semver = function() {
        return data;
    };
    return data;
}
const _downloadAppAsync = require("./downloadAppAsync");
const _errors = require("./errors");
const _ora = require("./ora");
const _profile = require("./profile");
const _progress = require("./progress");
const _getVersions = require("../api/getVersions");
const _UserSettings = require("../api/user/UserSettings");
const _log = require("../log");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:utils:downloadExpoGo');
const platformSettings = {
    ios: {
        versionsKey: 'iosClientUrl',
        getFilePath: (filename)=>_path().default.join((0, _UserSettings.getExpoHomeDirectory)(), 'ios-simulator-app-cache', `${filename}.app`),
        shouldExtractResults: true
    },
    android: {
        versionsKey: 'androidClientUrl',
        getFilePath: (filename)=>_path().default.join((0, _UserSettings.getExpoHomeDirectory)(), 'android-apk-cache', `${filename}.apk`),
        shouldExtractResults: false
    }
};
async function getExpoGoVersionEntryAsync(sdkVersion) {
    const { sdkVersions: versions } = await (0, _getVersions.getVersionsAsync)();
    let version;
    if (sdkVersion.toUpperCase() === 'UNVERSIONED') {
        // find the latest version
        const latestVersionKey = Object.keys(versions).reduce((a, b)=>{
            if ((0, _semver().gt)(b, a)) {
                return b;
            }
            return a;
        }, '0.0.0');
        _log.Log.warn(`Downloading the latest Expo Go client (${latestVersionKey}). This will not fully conform to UNVERSIONED.`);
        version = versions[latestVersionKey];
    } else {
        version = versions[sdkVersion];
    }
    if (!version) {
        throw new _errors.CommandError(`Unable to find a version of Expo Go for SDK ${sdkVersion}`);
    }
    return version;
}
async function downloadExpoGoAsync(platform, { url, sdkVersion }) {
    const { getFilePath, versionsKey, shouldExtractResults } = platformSettings[platform];
    const spinner = (0, _ora.ora)({
        text: 'Fetching Expo Go',
        color: 'white'
    }).start();
    let bar = null;
    try {
        if (!url) {
            const version = await getExpoGoVersionEntryAsync(sdkVersion);
            debug(`Installing Expo Go version for SDK ${sdkVersion} at URL: ${version[versionsKey]}`);
            url = version[versionsKey];
        }
    } catch (error) {
        spinner.fail();
        throw error;
    }
    const filename = _path().default.parse(url).name;
    try {
        const outputPath = getFilePath(filename);
        debug(`Downloading Expo Go from "${url}" to "${outputPath}".`);
        debug(`The requested copy of Expo Go might already be cached in: "${(0, _UserSettings.getExpoHomeDirectory)()}". You can disable the cache with EXPO_NO_CACHE=1`);
        await (0, _profile.profile)(_downloadAppAsync.downloadAppAsync)({
            url,
            // Save all encrypted cache data to `~/.expo/expo-go`
            cacheDirectory: 'expo-go',
            outputPath,
            extract: shouldExtractResults,
            onProgress ({ progress, total }) {
                if (progress && total) {
                    if (!bar) {
                        if (spinner.isSpinning) {
                            spinner.stop();
                        }
                        bar = (0, _progress.createProgressBar)('Downloading the Expo Go app [:bar] :percent :etas', {
                            width: 64,
                            total: 100,
                            // clear: true,
                            complete: '=',
                            incomplete: ' '
                        });
                    } else {
                        bar.update(progress, total);
                    }
                }
            }
        });
        return outputPath;
    } finally{
        spinner.stop();
        // @ts-expect-error
        bar == null ? void 0 : bar.terminate();
    }
}

//# sourceMappingURL=downloadExpoGoAsync.js.map