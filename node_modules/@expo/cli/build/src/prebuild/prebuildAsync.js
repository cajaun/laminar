"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "prebuildAsync", {
    enumerable: true,
    get: function() {
        return prebuildAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
const _clearNativeFolder = require("./clearNativeFolder");
const _configureProjectAsync = require("./configureProjectAsync");
const _ensureConfigAsync = require("./ensureConfigAsync");
const _resolveOptions = require("./resolveOptions");
const _updateFromTemplate = require("./updateFromTemplate");
const _installAsync = require("../install/installAsync");
const _log = require("../log");
const _env = require("../utils/env");
const _nodeEnv = require("../utils/nodeEnv");
const _nodeModules = require("../utils/nodeModules");
const _ora = require("../utils/ora");
const _profile = require("../utils/profile");
const _prompts = require("../utils/prompts");
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
const debug = require('debug')('expo:prebuild');
async function prebuildAsync(projectRoot, options) {
    (0, _nodeEnv.setNodeEnv)('development');
    require('@expo/env').load(projectRoot);
    const { platforms } = (0, _config().getConfig)(projectRoot).exp;
    if (platforms == null ? void 0 : platforms.length) {
        // Filter out platforms that aren't in the app.json.
        const finalPlatforms = options.platforms.filter((platform)=>platforms.includes(platform));
        if (finalPlatforms.length > 0) {
            options.platforms = finalPlatforms;
        } else {
            const requestedPlatforms = options.platforms.join(', ');
            _log.Log.warn((0, _chalk().default)`⚠️  Requested prebuild for "${requestedPlatforms}", but only "${platforms.join(', ')}" is present in app config ("expo.platforms" entry). Continuing with "${requestedPlatforms}".`);
        }
    }
    if (options.clean) {
        const { maybeBailOnGitStatusAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../utils/git.js")));
        // Clean the project folders...
        if (await maybeBailOnGitStatusAsync()) {
            return null;
        }
        // Clear the native folders before syncing
        await (0, _clearNativeFolder.clearNativeFolder)(projectRoot, options.platforms);
    } else {
        // Check if the existing project folders are malformed.
        await (0, _clearNativeFolder.promptToClearMalformedNativeProjectsAsync)(projectRoot, options.platforms);
    }
    // Warn if the project is attempting to prebuild an unsupported platform (iOS on Windows).
    options.platforms = (0, _resolveOptions.ensureValidPlatforms)(options.platforms);
    // Assert if no platforms are left over after filtering.
    (0, _resolveOptions.assertPlatforms)(options.platforms);
    // Get the Expo config, create it if missing.
    const { exp, pkg } = await (0, _ensureConfigAsync.ensureConfigAsync)(projectRoot, {
        platforms: options.platforms
    });
    // Create native projects from template.
    const { hasNewProjectFiles, needsPodInstall, templateChecksum, changedDependencies } = await (0, _updateFromTemplate.updateFromTemplateAsync)(projectRoot, {
        exp,
        pkg,
        template: options.template != null ? (0, _resolveOptions.resolveTemplateOption)(options.template) : undefined,
        platforms: options.platforms,
        skipDependencyUpdate: options.skipDependencyUpdate
    });
    // Install node modules
    if (options.install) {
        if (changedDependencies.length) {
            var _options_packageManager;
            if ((_options_packageManager = options.packageManager) == null ? void 0 : _options_packageManager.npm) {
                await (0, _nodeModules.clearNodeModulesAsync)(projectRoot);
            }
            _log.Log.log(_chalk().default.gray((0, _chalk().default)`Dependencies in the {bold package.json} changed:`));
            _log.Log.log(_chalk().default.gray('  ' + changedDependencies.join(', ')));
            // Installing dependencies is a legacy feature from the unversioned
            // command. We know opt to not change dependencies unless a template
            // indicates a new dependency is required, or if the core dependencies are wrong.
            if (await (0, _prompts.confirmAsync)({
                message: `Install the updated dependencies?`,
                initial: true
            })) {
                var _options_packageManager1, _options_packageManager2, _options_packageManager3, _options_packageManager4;
                await (0, _installAsync.installAsync)([], {
                    npm: !!((_options_packageManager1 = options.packageManager) == null ? void 0 : _options_packageManager1.npm),
                    yarn: !!((_options_packageManager2 = options.packageManager) == null ? void 0 : _options_packageManager2.yarn),
                    pnpm: !!((_options_packageManager3 = options.packageManager) == null ? void 0 : _options_packageManager3.pnpm),
                    bun: !!((_options_packageManager4 = options.packageManager) == null ? void 0 : _options_packageManager4.bun),
                    silent: !(_env.env.EXPO_DEBUG || _env.env.CI)
                });
            }
        }
    }
    // Apply Expo config to native projects. Prevent log-spew from ora when running in debug mode.
    const configSyncingStep = _env.env.EXPO_DEBUG ? {
        succeed (text) {
            _log.Log.log(text);
        },
        fail (text) {
            _log.Log.error(text);
        }
    } : (0, _ora.logNewSection)('Running prebuild');
    try {
        await (0, _profile.profile)(_configureProjectAsync.configureProjectAsync)(projectRoot, {
            platforms: options.platforms,
            exp,
            templateChecksum
        });
        configSyncingStep.succeed('Finished prebuild');
    } catch (error) {
        configSyncingStep.fail('Prebuild failed');
        throw error;
    }
    // Install CocoaPods
    let podsInstalled = false;
    // err towards running pod install less because it's slow and users can easily run npx pod-install afterwards.
    if (options.platforms.includes('ios') && options.install && needsPodInstall) {
        const { installCocoaPodsAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../utils/cocoapods.js")));
        podsInstalled = await installCocoaPodsAsync(projectRoot);
    } else {
        debug('Skipped pod install');
    }
    return {
        nodeInstall: !!options.install,
        podInstall: !podsInstalled,
        platforms: options.platforms,
        hasNewProjectFiles,
        exp
    };
}

//# sourceMappingURL=prebuildAsync.js.map