#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoPrebuild", {
    enumerable: true,
    get: function() {
        return expoPrebuild;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _args = require("../utils/args");
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
const expoPrebuild = async (argv)=>{
    const args = (0, _args.assertArgs)({
        // Types
        '--help': Boolean,
        '--clean': Boolean,
        '--npm': Boolean,
        '--pnpm': Boolean,
        '--yarn': Boolean,
        '--bun': Boolean,
        '--no-install': Boolean,
        '--template': String,
        '--platform': String,
        '--skip-dependency-update': String,
        // Aliases
        '-h': '--help',
        '-p': '--platform',
        '-t': '--type'
    }, argv);
    if (args['--help']) {
        (0, _args.printHelp)(`Create native iOS and Android project files for building natively`, (0, _chalk().default)`npx expo prebuild {dim <dir>}`, [
            (0, _chalk().default)`<dir>                                    Directory of the Expo project. {dim Default: Current working directory}`,
            `--no-install                             Skip installing npm packages and CocoaPods`,
            `--clean                                  Delete the native folders and regenerate them before applying changes`,
            (0, _chalk().default)`--npm                                    Use npm to install dependencies. {dim Default when package-lock.json exists}`,
            (0, _chalk().default)`--yarn                                   Use Yarn to install dependencies. {dim Default when yarn.lock exists}`,
            (0, _chalk().default)`--bun                                    Use bun to install dependencies. {dim Default when bun.lock or bun.lockb exists}`,
            (0, _chalk().default)`--pnpm                                   Use pnpm to install dependencies. {dim Default when pnpm-lock.yaml exists}`,
            `--template <template>                    Project template to clone from. File path pointing to a local tar file, npm package or a github repo`,
            (0, _chalk().default)`-p, --platform <all|android|ios>         Platforms to sync: ios, android, all. {dim Default: all}`,
            `--skip-dependency-update <dependencies>  Preserves versions of listed packages in package.json (comma separated list)`,
            `-h, --help                               Usage info`
        ].join('\n'));
    }
    // Load modules after the help prompt so `npx expo prebuild -h` shows as fast as possible.
    const [// ./prebuildAsync
    { prebuildAsync }, // ./resolveOptions
    { resolvePlatformOption, resolvePackageManagerOptions, resolveSkipDependencyUpdate }, // ../utils/errors
    { logCmdError }] = await Promise.all([
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./prebuildAsync.js"))),
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./resolveOptions.js"))),
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../utils/errors.js")))
    ]);
    return (()=>{
        return prebuildAsync((0, _args.getProjectRoot)(args), {
            // Parsed options
            clean: args['--clean'],
            packageManager: resolvePackageManagerOptions(args),
            install: !args['--no-install'],
            platforms: resolvePlatformOption(args['--platform']),
            // TODO: Parse
            skipDependencyUpdate: resolveSkipDependencyUpdate(args['--skip-dependency-update']),
            template: args['--template']
        });
    })().catch(logCmdError);
};

//# sourceMappingURL=index.js.map