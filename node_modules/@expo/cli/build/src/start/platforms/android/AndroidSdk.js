"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "assertSdkRoot", {
    enumerable: true,
    get: function() {
        return assertSdkRoot;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * The default Android SDK locations per platform.
 * @see https://developer.android.com/studio/run/emulator-commandline#filedir
 * @see https://developer.android.com/studio/intro/studio-config#optimize-studio-windows
 */ const ANDROID_DEFAULT_LOCATION = {
    darwin: _path().default.join(_os().default.homedir(), 'Library', 'Android', 'sdk'),
    linux: _path().default.join(_os().default.homedir(), 'Android', 'sdk'),
    win32: _path().default.join(_os().default.homedir(), 'AppData', 'Local', 'Android', 'Sdk')
};
function assertSdkRoot() {
    if (process.env.ANDROID_HOME) {
        (0, _assert().default)(_fs().default.existsSync(process.env.ANDROID_HOME), `Failed to resolve the Android SDK path. ANDROID_HOME is set to a non-existing path: ${process.env.ANDROID_HOME}`);
        return process.env.ANDROID_HOME;
    }
    if (process.env.ANDROID_SDK_ROOT) {
        (0, _assert().default)(_fs().default.existsSync(process.env.ANDROID_SDK_ROOT), `Failed to resolve the Android SDK path. Deprecated ANDROID_SDK_ROOT is set to a non-existing path: ${process.env.ANDROID_SDK_ROOT}. Use ANDROID_HOME instead.`);
        return process.env.ANDROID_SDK_ROOT;
    }
    const defaultLocation = ANDROID_DEFAULT_LOCATION[process.platform];
    if (defaultLocation) {
        (0, _assert().default)(_fs().default.existsSync(defaultLocation), `Failed to resolve the Android SDK path. Default install location not found: ${defaultLocation}. Use ANDROID_HOME to set the Android SDK location.`);
        return defaultLocation;
    }
    return null;
}

//# sourceMappingURL=AndroidSdk.js.map