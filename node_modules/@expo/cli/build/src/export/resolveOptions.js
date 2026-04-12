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
    resolveOptionsAsync: function() {
        return resolveOptionsAsync;
    },
    resolvePlatformOption: function() {
        return resolvePlatformOption;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
const _platformBundlers = require("../start/server/platformBundlers");
const _errors = require("../utils/errors");
function resolvePlatformOption(exp, platformBundlers, platform = [
    'all'
]) {
    const platformsAvailable = Object.fromEntries(Object.entries(platformBundlers).filter(([platform, bundler])=>{
        var _exp_platforms;
        return bundler === 'metro' && ((_exp_platforms = exp.platforms) == null ? void 0 : _exp_platforms.includes(platform));
    }));
    if (!Object.keys(platformsAvailable).length) {
        throw new _errors.CommandError(`No platforms are configured to use the Metro bundler in the project Expo config.`);
    }
    const assertPlatformBundler = (platform)=>{
        if (!platformsAvailable[platform]) {
            var _exp_platforms, _exp_platforms1;
            if (!((_exp_platforms = exp.platforms) == null ? void 0 : _exp_platforms.includes(platform)) && platform === 'web') {
                // Pass through so the more robust error message is shown.
                return platform;
            }
            throw new _errors.CommandError('BAD_ARGS', `Platform "${platform}" is not configured to use the Metro bundler in the project Expo config, or is missing from the supported platforms in the platforms array: [${(_exp_platforms1 = exp.platforms) == null ? void 0 : _exp_platforms1.join(', ')}].`);
        }
        return platform;
    };
    const knownPlatforms = [
        'android',
        'ios',
        'web'
    ];
    const assertPlatformIsKnown = (platform)=>{
        if (!knownPlatforms.includes(platform)) {
            throw new _errors.CommandError(`Unsupported platform "${platform}". Options are: ${knownPlatforms.join(',')},all`);
        }
        return platform;
    };
    return platform// Expand `all` to all available platforms.
    .map((platform)=>platform === 'all' ? Object.keys(platformsAvailable) : platform).flat()// Remove duplicated platforms
    .filter((platform, index, list)=>list.indexOf(platform) === index)// Assert platforms are valid
    .map((platform)=>assertPlatformIsKnown(platform)).map((platform)=>assertPlatformBundler(platform));
}
async function resolveOptionsAsync(projectRoot, args) {
    const { exp } = (0, _config().getConfig)(projectRoot, {
        skipPlugins: true,
        skipSDKVersionRequirement: true
    });
    const platformBundlers = (0, _platformBundlers.getPlatformBundlers)(projectRoot, exp);
    const platforms = resolvePlatformOption(exp, platformBundlers, args['--platform']);
    return {
        platforms,
        hostedNative: !!args['--unstable-hosted-native'],
        outputDir: args['--output-dir'] ?? 'dist',
        minify: !args['--no-minify'],
        bytecode: !args['--no-bytecode'],
        clear: !!args['--clear'],
        dev: !!args['--dev'],
        maxWorkers: args['--max-workers'],
        dumpAssetmap: !!args['--dump-assetmap'],
        sourceMaps: !!args['--source-maps'],
        skipSSG: !!args['--no-ssg'] || !!args['--api-only']
    };
}

//# sourceMappingURL=resolveOptions.js.map