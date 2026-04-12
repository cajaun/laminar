"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getPublicExpoManifestAsync", {
    enumerable: true,
    get: function() {
        return getPublicExpoManifestAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
const _getResolvedLocales = require("./getResolvedLocales");
const _env = require("../utils/env");
const _errors = require("../utils/errors");
async function getPublicExpoManifestAsync(projectRoot, { skipValidation } = {}) {
    // Read the config in public mode which strips the `hooks`.
    const { exp } = (0, _config().getConfig)(projectRoot, {
        isPublicConfig: true,
        // This shouldn't be needed since the CLI is vendored in `expo`.
        skipSDKVersionRequirement: true
    });
    // Only allow projects to be published with UNVERSIONED if a correct token is set in env
    if (!skipValidation && exp.sdkVersion === 'UNVERSIONED' && !_env.env.EXPO_SKIP_MANIFEST_VALIDATION_TOKEN) {
        throw new _errors.CommandError('INVALID_OPTIONS', 'Cannot publish with sdkVersion UNVERSIONED.');
    }
    return {
        ...exp,
        locales: await (0, _getResolvedLocales.getResolvedLocalesAsync)(projectRoot, exp),
        sdkVersion: exp.sdkVersion
    };
}

//# sourceMappingURL=getPublicExpoManifest.js.map