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
    getOrPromptForBundleIdentifierAsync: function() {
        return getOrPromptForBundleIdentifierAsync;
    },
    getOrPromptForPackageAsync: function() {
        return getOrPromptForPackageAsync;
    }
});
function _graphqlweb() {
    const data = require("@0no-co/graphql.web");
    _graphqlweb = function() {
        return data;
    };
    return data;
}
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _core() {
    const data = require("@urql/core");
    _core = function() {
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
const _fn = require("./fn");
const _link = require("./link");
const _modifyConfigAsync = require("./modifyConfigAsync");
const _prompts = /*#__PURE__*/ _interop_require_wildcard(require("./prompts"));
const _validateApplicationId = require("./validateApplicationId");
const _AppQuery = require("../api/graphql/queries/AppQuery");
const _UserSettings = require("../api/user/UserSettings");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
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
const debug = require('debug')('expo:app-id');
const ANONYMOUS_USERNAME = 'anonymous';
async function getRecommendedReverseDomainNameSecondPartAsync(exp) {
    var _getSettings_read_auth, _exp_extra_eas, _exp_extra;
    // Get the cached username.
    const cachedUsername = (_getSettings_read_auth = (0, _UserSettings.getSettings)().read().auth) == null ? void 0 : _getSettings_read_auth.username;
    if (cachedUsername) {
        return cachedUsername;
    }
    const easProjectId = (_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_eas = _exp_extra.eas) == null ? void 0 : _exp_extra_eas.projectId;
    if (!easProjectId) {
        return null;
    }
    try {
        const app = await _AppQuery.AppQuery.byIdAsync(easProjectId);
        return app.ownerAccount.name;
    } catch (e) {
        if (e instanceof _graphqlweb().GraphQLError || e instanceof _core().CombinedError) {
            return null;
        }
        throw e;
    }
}
const NO_BUNDLE_ID_MESSAGE = `Project must have a \`ios.bundleIdentifier\` set in the Expo config (app.json or app.config.js).`;
const NO_PACKAGE_MESSAGE = `Project must have a \`android.package\` set in the Expo config (app.json or app.config.js).`;
async function getOrPromptForBundleIdentifierAsync(projectRoot, exp = (0, _config().getConfig)(projectRoot).exp) {
    var _exp_ios;
    const current = (_exp_ios = exp.ios) == null ? void 0 : _exp_ios.bundleIdentifier;
    if (current) {
        (0, _validateApplicationId.assertValidBundleId)(current);
        return current;
    }
    return promptForBundleIdWithInitialAsync(projectRoot, exp, await getRecommendedBundleIdAsync(exp));
}
const memoLog = (0, _fn.memoize)(_log.log);
async function promptForBundleIdWithInitialAsync(projectRoot, exp, bundleIdentifier) {
    if (!bundleIdentifier) {
        memoLog((0, _chalk().default)`\n{bold 📝  iOS Bundle Identifier} {dim ${(0, _link.learnMore)('https://expo.fyi/bundle-identifier')}}\n`);
        // Prompt the user for the bundle ID.
        // Even if the project is using a dynamic config we can still
        // prompt a better error message, recommend a default value, and help the user
        // validate their custom bundle ID upfront.
        const { input } = await (0, _prompts.default)({
            type: 'text',
            name: 'input',
            // The Apple helps people know this isn't an EAS feature.
            message: `What would you like your iOS bundle identifier to be?`,
            validate: _validateApplicationId.validateBundleId
        }, {
            nonInteractiveHelp: NO_BUNDLE_ID_MESSAGE
        });
        bundleIdentifier = input;
    }
    // Warn the user if the bundle ID is already in use.
    const warning = await (0, _validateApplicationId.getBundleIdWarningAsync)(bundleIdentifier);
    if (warning && !await warnAndConfirmAsync(warning)) {
        // Cycle the Bundle ID prompt to try again.
        return await promptForBundleIdWithInitialAsync(projectRoot, exp);
    }
    // Apply the changes to the config.
    if (await (0, _modifyConfigAsync.attemptModification)(projectRoot, {
        ios: {
            ...exp.ios || {},
            bundleIdentifier
        }
    }, {
        ios: {
            bundleIdentifier
        }
    })) {
        _log.log(_chalk().default.gray`\u203A Apple bundle identifier: ${bundleIdentifier}`);
    }
    return bundleIdentifier;
}
async function warnAndConfirmAsync(warning) {
    _log.log();
    _log.warn(warning);
    _log.log();
    if (!await (0, _prompts.confirmAsync)({
        message: `Continue?`,
        initial: true
    })) {
        return false;
    }
    return true;
}
// Recommend a bundle identifier based on the account name of the owner of the project and project slug.
async function getRecommendedBundleIdAsync(exp) {
    var _exp_android;
    const possibleIdFromAndroid = ((_exp_android = exp.android) == null ? void 0 : _exp_android.package) ? (0, _validateApplicationId.getSanitizedBundleIdentifier)(exp.android.package) : undefined;
    // Attempt to use the android package name first since it's convenient to have them aligned.
    if (possibleIdFromAndroid && (0, _validateApplicationId.validateBundleId)(possibleIdFromAndroid)) {
        return possibleIdFromAndroid;
    } else {
        const recommendedReverseDomainNameSecondPart = await getRecommendedReverseDomainNameSecondPartAsync(exp) ?? ANONYMOUS_USERNAME;
        const possibleId = (0, _validateApplicationId.getSanitizedBundleIdentifier)(`com.${recommendedReverseDomainNameSecondPart}.${exp.slug}`);
        if ((0, _validateApplicationId.validateBundleId)(possibleId)) {
            return possibleId;
        }
    }
    return undefined;
}
// Recommend a package name based on the account name of the owner of the project and project slug.
async function getRecommendedPackageNameAsync(exp) {
    var _exp_ios;
    const possibleIdFromApple = ((_exp_ios = exp.ios) == null ? void 0 : _exp_ios.bundleIdentifier) ? (0, _validateApplicationId.getSanitizedPackage)(exp.ios.bundleIdentifier) : undefined;
    // Attempt to use the ios bundle id first since it's convenient to have them aligned.
    if (possibleIdFromApple && (0, _validateApplicationId.validatePackage)(possibleIdFromApple)) {
        return possibleIdFromApple;
    } else {
        const recommendedReverseDomainNameSecondPart = await getRecommendedReverseDomainNameSecondPartAsync(exp) ?? ANONYMOUS_USERNAME;
        const possibleId = (0, _validateApplicationId.getSanitizedPackage)(`com.${recommendedReverseDomainNameSecondPart}.${exp.slug}`);
        if ((0, _validateApplicationId.validatePackage)(possibleId)) {
            return possibleId;
        } else {
            debug(`Recommended package name is invalid: "${possibleId}" (owner: ${recommendedReverseDomainNameSecondPart}, slug: ${exp.slug})`);
        }
    }
    return undefined;
}
async function getOrPromptForPackageAsync(projectRoot, exp = (0, _config().getConfig)(projectRoot).exp) {
    var _exp_android;
    const current = (_exp_android = exp.android) == null ? void 0 : _exp_android.package;
    if (current) {
        (0, _validateApplicationId.assertValidPackage)(current);
        return current;
    }
    return await promptForPackageAsync(projectRoot, exp);
}
async function promptForPackageAsync(projectRoot, exp) {
    return promptForPackageWithInitialAsync(projectRoot, exp, await getRecommendedPackageNameAsync(exp));
}
async function promptForPackageWithInitialAsync(projectRoot, exp, packageName) {
    if (!packageName) {
        memoLog((0, _chalk().default)`\n{bold 📝  Android package} {dim ${(0, _link.learnMore)('https://expo.fyi/android-package')}}\n`);
        // Prompt the user for the android package.
        // Even if the project is using a dynamic config we can still
        // prompt a better error message, recommend a default value, and help the user
        // validate their custom android package upfront.
        const { input } = await (0, _prompts.default)({
            type: 'text',
            name: 'input',
            message: `What would you like your Android package name to be?`,
            validate: _validateApplicationId.validatePackageWithWarning
        }, {
            nonInteractiveHelp: NO_PACKAGE_MESSAGE
        });
        packageName = input;
    }
    // Warn the user if the package name is already in use.
    const warning = await (0, _validateApplicationId.getPackageNameWarningAsync)(packageName);
    if (warning && !await warnAndConfirmAsync(warning)) {
        // Cycle the Package name prompt to try again.
        return promptForPackageWithInitialAsync(projectRoot, exp);
    }
    // Apply the changes to the config.
    if (await (0, _modifyConfigAsync.attemptModification)(projectRoot, {
        android: {
            ...exp.android || {},
            package: packageName
        }
    }, {
        android: {
            package: packageName
        }
    })) {
        _log.log(_chalk().default.gray`\u203A Android package name: ${packageName}`);
    }
    return packageName;
}

//# sourceMappingURL=getOrPromptApplicationId.js.map