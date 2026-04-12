"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AndroidAppIdResolver", {
    enumerable: true,
    get: function() {
        return AndroidAppIdResolver;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
        return data;
    };
    return data;
}
const _AppIdResolver = require("../AppIdResolver");
const debug = require('debug')('expo:start:platforms:android:AndroidAppIdResolver');
class AndroidAppIdResolver extends _AppIdResolver.AppIdResolver {
    constructor(projectRoot){
        super(projectRoot, 'android', 'android.package');
    }
    async hasNativeProjectAsync() {
        try {
            await _configplugins().AndroidConfig.Paths.getProjectPathOrThrowAsync(this.projectRoot);
            return true;
        } catch (error) {
            debug('Expected error checking for native project:', error.message);
            return false;
        }
    }
    async resolveAppIdFromNativeAsync() {
        const applicationIdFromGradle = await _configplugins().AndroidConfig.Package.getApplicationIdAsync(this.projectRoot).catch(()=>null);
        if (applicationIdFromGradle) {
            return applicationIdFromGradle;
        }
        try {
            var _androidManifest_manifest_$, _androidManifest_manifest;
            const filePath = await _configplugins().AndroidConfig.Paths.getAndroidManifestAsync(this.projectRoot);
            const androidManifest = await _configplugins().AndroidConfig.Manifest.readAndroidManifestAsync(filePath);
            // Assert MainActivity defined.
            await _configplugins().AndroidConfig.Manifest.getMainActivityOrThrow(androidManifest);
            if ((_androidManifest_manifest = androidManifest.manifest) == null ? void 0 : (_androidManifest_manifest_$ = _androidManifest_manifest.$) == null ? void 0 : _androidManifest_manifest_$.package) {
                return androidManifest.manifest.$.package;
            }
        } catch (error) {
            debug('Expected error resolving the package name from the AndroidManifest.xml:', error);
        }
        return null;
    }
}

//# sourceMappingURL=AndroidAppIdResolver.js.map