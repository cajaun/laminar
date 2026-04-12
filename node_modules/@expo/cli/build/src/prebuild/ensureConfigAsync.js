"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureConfigAsync", {
    enumerable: true,
    get: function() {
        return ensureConfigAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
const _getOrPromptApplicationId = require("../utils/getOrPromptApplicationId");
async function ensureConfigAsync(projectRoot, { platforms }) {
    // Prompt for the Android package first because it's more strict than the bundle identifier
    // this means you'll have a better chance at matching the bundle identifier with the package name.
    if (platforms.includes('android')) {
        await (0, _getOrPromptApplicationId.getOrPromptForPackageAsync)(projectRoot);
    }
    if (platforms.includes('ios')) {
        await (0, _getOrPromptApplicationId.getOrPromptForBundleIdentifierAsync)(projectRoot);
    }
    // Read config again because prompting for bundle id or package name may have mutated the results.
    return (0, _config().getConfig)(projectRoot);
}

//# sourceMappingURL=ensureConfigAsync.js.map