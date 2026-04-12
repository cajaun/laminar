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
    getCodeSigningInfoForPbxproj: function() {
        return getCodeSigningInfoForPbxproj;
    },
    mutateXcodeProjectWithAutoCodeSigningInfo: function() {
        return mutateXcodeProjectWithAutoCodeSigningInfo;
    },
    setAutoCodeSigningInfoForPbxproj: function() {
        return setAutoCodeSigningInfoForPbxproj;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getCodeSigningInfoForPbxproj(projectRoot) {
    const project = _configplugins().IOSConfig.XcodeUtils.getPbxproj(projectRoot);
    const targets = _configplugins().IOSConfig.Target.findSignableTargets(project);
    const signingInfo = {};
    for (const [nativeTargetId, nativeTarget] of targets){
        const developmentTeams = [];
        const provisioningProfiles = [];
        _configplugins().IOSConfig.XcodeUtils.getBuildConfigurationsForListId(project, nativeTarget.buildConfigurationList).filter(([, item])=>item.buildSettings.PRODUCT_NAME).forEach(([, item])=>{
            const { DEVELOPMENT_TEAM, PROVISIONING_PROFILE } = item.buildSettings;
            if (typeof DEVELOPMENT_TEAM === 'string' && // If the user selects "Team: none" in Xcode, it'll be an empty string.
            !!DEVELOPMENT_TEAM && // xcode package sometimes reads an empty string as a quoted empty string.
            DEVELOPMENT_TEAM !== '""') {
                developmentTeams.push(DEVELOPMENT_TEAM);
            }
            if (typeof PROVISIONING_PROFILE === 'string' && !!PROVISIONING_PROFILE) {
                provisioningProfiles.push(PROVISIONING_PROFILE);
            }
        });
        signingInfo[nativeTargetId] = {
            developmentTeams,
            provisioningProfiles
        };
    }
    return signingInfo;
}
function mutateXcodeProjectWithAutoCodeSigningInfo({ project, appleTeamId }) {
    const targets = _configplugins().IOSConfig.Target.findSignableTargets(project);
    const quotedAppleTeamId = ensureQuotes(appleTeamId);
    for (const [nativeTargetId, nativeTarget] of targets){
        _configplugins().IOSConfig.XcodeUtils.getBuildConfigurationsForListId(project, nativeTarget.buildConfigurationList).filter(([, item])=>item.buildSettings.PRODUCT_NAME).forEach(([, item])=>{
            item.buildSettings.DEVELOPMENT_TEAM = quotedAppleTeamId;
            item.buildSettings.CODE_SIGN_IDENTITY = '"Apple Development"';
            item.buildSettings.CODE_SIGN_STYLE = 'Automatic';
        });
        Object.entries(_configplugins().IOSConfig.XcodeUtils.getProjectSection(project)).filter(_configplugins().IOSConfig.XcodeUtils.isNotComment).forEach(([, item])=>{
            if (!item.attributes.TargetAttributes) {
                item.attributes.TargetAttributes = {};
            }
            if (!item.attributes.TargetAttributes[nativeTargetId]) {
                item.attributes.TargetAttributes[nativeTargetId] = {};
            }
            item.attributes.TargetAttributes[nativeTargetId].DevelopmentTeam = quotedAppleTeamId;
            item.attributes.TargetAttributes[nativeTargetId].ProvisioningStyle = 'Automatic';
        });
    }
    return project;
}
function setAutoCodeSigningInfoForPbxproj(projectRoot, { appleTeamId }) {
    const project = _configplugins().IOSConfig.XcodeUtils.getPbxproj(projectRoot);
    mutateXcodeProjectWithAutoCodeSigningInfo({
        project,
        appleTeamId
    });
    _fs().default.writeFileSync(project.filepath, project.writeSync());
}
const ensureQuotes = (value)=>{
    if (!value.match(/^['"]/)) {
        return `"${value}"`;
    }
    return value;
};

//# sourceMappingURL=xcodeCodeSigning.js.map