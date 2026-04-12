"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureDeviceIsCodeSignedForDeploymentAsync", {
    enumerable: true,
    get: function() {
        return ensureDeviceIsCodeSignedForDeploymentAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _Security = /*#__PURE__*/ _interop_require_wildcard(require("./Security"));
const _resolveCertificateSigningIdentity = require("./resolveCertificateSigningIdentity");
const _xcodeCodeSigning = require("./xcodeCodeSigning");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
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
async function ensureDeviceIsCodeSignedForDeploymentAsync(projectRoot) {
    if (isCodeSigningConfigured(projectRoot)) {
        return null;
    }
    return configureCodeSigningAsync(projectRoot);
}
function isCodeSigningConfigured(projectRoot) {
    // Check if the app already has a development team defined.
    const signingInfo = (0, _xcodeCodeSigning.getCodeSigningInfoForPbxproj)(projectRoot);
    const allTargetsHaveTeams = Object.values(signingInfo).reduce((prev, curr)=>{
        return prev && !!curr.developmentTeams.length;
    }, true);
    if (allTargetsHaveTeams) {
        const teamList = Object.values(signingInfo).reduce((prev, curr)=>{
            return prev.concat([
                curr.developmentTeams[0]
            ]);
        }, []);
        _log.log(_chalk().default.dim`\u203A Auto signing app using team(s): ${teamList.join(', ')}`);
        return true;
    }
    const allTargetsHaveProfiles = Object.values(signingInfo).reduce((prev, curr)=>{
        return prev && !!curr.provisioningProfiles.length;
    }, true);
    if (allTargetsHaveProfiles) {
        // this indicates that the user has manual code signing setup (possibly for production).
        return true;
    }
    return false;
}
async function configureCodeSigningAsync(projectRoot) {
    const ids = await _Security.findIdentitiesAsync();
    const id = await (0, _resolveCertificateSigningIdentity.resolveCertificateSigningIdentityAsync)(projectRoot, ids);
    _log.log(`\u203A Signing and building iOS app with: ${id.codeSigningInfo}`);
    (0, _xcodeCodeSigning.setAutoCodeSigningInfoForPbxproj)(projectRoot, {
        appleTeamId: id.appleTeamId
    });
    return id.appleTeamId;
}

//# sourceMappingURL=configureCodeSigning.js.map