"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppleAppIdResolver", {
    enumerable: true,
    get: function() {
        return AppleAppIdResolver;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
        return data;
    };
    return data;
}
function _plist() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/plist"));
    _plist = function() {
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
const _AppIdResolver = require("../AppIdResolver");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:platforms:ios:AppleAppIdResolver');
class AppleAppIdResolver extends _AppIdResolver.AppIdResolver {
    constructor(projectRoot){
        super(projectRoot, 'ios', 'ios.bundleIdentifier');
    }
    /** @return `true` if the app has valid `*.pbxproj` file */ async hasNativeProjectAsync() {
        try {
            // Never returns nullish values.
            return !!_configplugins().IOSConfig.Paths.getAllPBXProjectPaths(this.projectRoot).length;
        } catch (error) {
            debug('Expected error checking for native project:', error.message);
            return false;
        }
    }
    async resolveAppIdFromNativeAsync() {
        // Check xcode project
        try {
            const bundleId = _configplugins().IOSConfig.BundleIdentifier.getBundleIdentifierFromPbxproj(this.projectRoot);
            if (bundleId) {
                return bundleId;
            }
        } catch (error) {
            debug('Expected error resolving the bundle identifier from the pbxproj:', error);
        }
        // Check Info.plist
        try {
            const infoPlistPath = _configplugins().IOSConfig.Paths.getInfoPlistPath(this.projectRoot);
            const data = await _plist().default.parse(_fs().default.readFileSync(infoPlistPath, 'utf8'));
            if (data.CFBundleIdentifier && !data.CFBundleIdentifier.startsWith('$(')) {
                return data.CFBundleIdentifier;
            }
        } catch (error) {
            debug('Expected error resolving the bundle identifier from the project Info.plist:', error);
        }
        return null;
    }
}

//# sourceMappingURL=AppleAppIdResolver.js.map