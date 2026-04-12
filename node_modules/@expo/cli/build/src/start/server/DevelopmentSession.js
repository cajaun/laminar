"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DevelopmentSession", {
    enumerable: true,
    get: function() {
        return DevelopmentSession;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
const _updateDevelopmentSession = require("../../api/updateDevelopmentSession");
const _UserSettings = require("../../api/user/UserSettings");
const _env = require("../../utils/env");
const _devices = /*#__PURE__*/ _interop_require_wildcard(require("../project/devices"));
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
const debug = require('debug')('expo:start:server:developmentSession');
class DevelopmentSession {
    constructor(/** Project root directory. */ projectRoot, /** Development Server URL. */ url){
        this.projectRoot = projectRoot;
        this.url = url;
        this.hasActiveSession = false;
    }
    /**
   * Notify the Expo servers that a project is running, this enables the Expo Go app
   * and Dev Clients to offer a "recently in development" section for quick access.
   *
   * @param projectRoot Project root folder, used for retrieving device installation IDs.
   * @param props.exp Partial Expo config with values that will be used in the Expo Go app.
   * @param props.runtime which runtime the app should be opened in. `native` for dev clients, `web` for web browsers.
   */ async startAsync({ exp = (0, _config().getConfig)(this.projectRoot).exp, runtime }) {
        try {
            if (_env.env.CI || _env.env.EXPO_OFFLINE) {
                debug(_env.env.CI ? 'This project will not be suggested in Expo Go or Dev Clients because Expo CLI is running in CI.' : 'This project will not be suggested in Expo Go or Dev Clients because Expo CLI is running in offline-mode.');
                return;
            }
            const deviceIds = await this.getDeviceInstallationIdsAsync();
            if (!(0, _UserSettings.hasCredentials)() && !(deviceIds == null ? void 0 : deviceIds.length)) {
                debug('Development session will not ping because the user is not authenticated and there are no devices.');
                return;
            }
            if (this.url) {
                debug(`Development session ping (runtime: ${runtime}, url: ${this.url})`);
                await (0, _updateDevelopmentSession.updateDevelopmentSessionAsync)({
                    url: this.url,
                    runtime,
                    exp,
                    deviceIds
                });
                this.hasActiveSession = true;
            }
        } catch (error) {
            debug(`Error updating development session API: ${error}`);
        }
    }
    /** Get all recent devices for the project. */ async getDeviceInstallationIdsAsync() {
        const { devices } = await _devices.getDevicesInfoAsync(this.projectRoot);
        return devices.map(({ installationId })=>installationId);
    }
    /** Try to close any pending development sessions, but always resolve */ async closeAsync() {
        if (_env.env.CI || _env.env.EXPO_OFFLINE || !this.hasActiveSession) {
            return false;
        }
        // Clear out the development session, even if the call fails.
        // This blocks subsequent calls to `stopAsync`
        this.hasActiveSession = false;
        try {
            const deviceIds = await this.getDeviceInstallationIdsAsync();
            if (!(0, _UserSettings.hasCredentials)() && !(deviceIds == null ? void 0 : deviceIds.length)) {
                return false;
            }
            if (this.url) {
                await (0, _updateDevelopmentSession.closeDevelopmentSessionAsync)({
                    url: this.url,
                    deviceIds
                });
            }
            return true;
        } catch (error) {
            debug(`Error closing development session API: ${error}`);
            return false;
        }
    }
}

//# sourceMappingURL=DevelopmentSession.js.map