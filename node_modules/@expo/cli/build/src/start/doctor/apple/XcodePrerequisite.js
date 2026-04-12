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
    XcodePrerequisite: function() {
        return XcodePrerequisite;
    },
    getXcodeVersionAsync: function() {
        return getXcodeVersionAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
function _semver() {
    const data = /*#__PURE__*/ _interop_require_default(require("semver"));
    _semver = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
const _profile = require("../../../utils/profile");
const _prompts = require("../../../utils/prompts");
const _Prerequisite = require("../Prerequisite");
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
const debug = require('debug')('expo:doctor:apple:xcode');
// Based on the Apple announcement (last updated: Aug 2023).
// https://developer.apple.com/news/upcoming-requirements/?id=04252023a
const MIN_XCODE_VERSION = '14.1';
const APP_STORE_ID = '497799835';
const SUGGESTED_XCODE_VERSION = `${MIN_XCODE_VERSION}.0`;
const promptToOpenAppStoreAsync = async (message)=>{
    // This prompt serves no purpose accept informing the user what to do next, we could just open the App Store but it could be confusing if they don't know what's going on.
    const confirm = await (0, _prompts.confirmAsync)({
        initial: true,
        message
    });
    if (confirm) {
        _log.log(`Going to the App Store, re-run Expo CLI when Xcode has finished installing.`);
        openAppStore(APP_STORE_ID);
    }
};
let _xcodeVersionPromise = null;
const getXcodeVersionAsync = async ({ silent, force } = {})=>{
    const logError = silent ? debug : _log.warn;
    const getVersion = async ()=>{
        try {
            var _stdout_match;
            const { stdout } = await (0, _spawnasync().default)('xcodebuild', [
                '-version'
            ]);
            const last = (_stdout_match = stdout.match(/^Xcode (\d+\.\d+)/)) == null ? void 0 : _stdout_match[1];
            // Convert to a semver string
            if (last) {
                const version = `${last}.0`;
                if (!_semver().default.valid(version)) {
                    // Not sure why this would happen, if it does we should add a more confident error message.
                    return {
                        error: `Xcode version is in an unknown format: ${version}`,
                        value: false
                    };
                }
                return {
                    value: version
                };
            }
            // not sure what's going on
            return {
                error: 'Unable to check Xcode version. Command ran successfully but no version number was found.',
                value: null
            };
        } catch  {
        // not installed
        }
        return {
            value: null
        };
    };
    if (force) {
        _xcodeVersionPromise = null;
    }
    _xcodeVersionPromise = _xcodeVersionPromise ?? getVersion();
    const result = await _xcodeVersionPromise;
    if (result.error) {
        logError(result.error);
    }
    return result.value;
};
/**
 * Open a link to the App Store. Just link in mobile apps, **never** redirect without prompting first.
 *
 * @param appId
 */ function openAppStore(appId) {
    const link = getAppStoreLink(appId);
    (0, _child_process().execSync)(`open ${link}`, {
        stdio: 'ignore'
    });
}
function getAppStoreLink(appId) {
    if (process.platform === 'darwin') {
        // TODO: Is there ever a case where the macappstore isn't available on mac?
        return `macappstore://itunes.apple.com/app/id${appId}`;
    }
    return `https://apps.apple.com/us/app/id${appId}`;
}
function spawnForString(cmd) {
    try {
        return (0, _child_process().execSync)(cmd, {
            stdio: 'pipe'
        }).toString().trim();
    } catch  {}
    return null;
}
/** @returns a string like `/Applications/Xcode.app/Contents/Developer` when Xcode has a correctly selected path. */ function getXcodeSelectPathAsync() {
    return spawnForString('/usr/bin/xcode-select --print-path');
}
function getXcodeInstalled() {
    return spawnForString('ls /Applications/Xcode.app/Contents/Developer');
}
class XcodePrerequisite extends _Prerequisite.Prerequisite {
    static #_ = this.instance = new XcodePrerequisite();
    /**
   * Ensure Xcode is installed and recent enough to be used with Expo.
   */ async assertImplementation() {
        const version = await (0, _profile.profile)(getXcodeVersionAsync)({
            force: process.env.NODE_ENV === 'test'
        });
        debug(`Xcode version: ${version}`);
        if (!version) {
            // A couple different issues could have occurred, let's check them after we're past the point of no return
            // since we no longer need to be fast about validation.
            // Ensure Xcode.app can be found before we prompt to sudo select it.
            if (getXcodeInstalled()) {
                const selectPath = (0, _profile.profile)(getXcodeSelectPathAsync)();
                debug(`Xcode select path: ${selectPath}`);
                if (!selectPath) {
                    _log.error([
                        '',
                        _chalk().default.bold('Xcode has not been fully setup for Apple development yet.'),
                        'Download at: https://developer.apple.com/xcode/',
                        'or in the App Store.',
                        '',
                        'After downloading Xcode, run the following two commands in your terminal:',
                        _chalk().default.cyan('  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer'),
                        _chalk().default.cyan('  sudo xcodebuild -runFirstLaunch'),
                        '',
                        'Then you can re-run Expo CLI. Alternatively, you can build apps in the cloud with EAS CLI, or preview using the Expo Go app on a physical device.',
                        ''
                    ].join('\n'));
                    throw new _errors.AbortCommandError();
                } else {
                    debug(`Unexpected Xcode setup (version: ${version}, select: ${selectPath})`);
                }
            }
            // Almost certainly Xcode isn't installed.
            await promptToOpenAppStoreAsync(`Xcode must be fully installed before you can continue. If this message is still occurring after installing Xcode, you may need to finish the installation of the developer tools by running: \`sudo xcode-select -s /Applications/Xcode.app/Contents/Developer\`. Continue to the App Store?`);
            throw new _errors.AbortCommandError();
        }
        if (_semver().default.lt(version, SUGGESTED_XCODE_VERSION)) {
            // Xcode version is too old.
            await promptToOpenAppStoreAsync(`Xcode (${version}) needs to be updated to at least version ${MIN_XCODE_VERSION}. Continue to the App Store?`);
            throw new _errors.AbortCommandError();
        }
    }
}

//# sourceMappingURL=XcodePrerequisite.js.map