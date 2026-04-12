#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoExportEmbed", {
    enumerable: true,
    get: function() {
        return expoExportEmbed;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _args = require("../../utils/args");
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
const expoExportEmbed = async (argv)=>{
    const rawArgsMap = {
        // Types
        '--entry-file': String,
        '--platform': String,
        '--transformer': String,
        '--bundle-output': String,
        '--bundle-encoding': String,
        '--max-workers': Number,
        '--sourcemap-output': String,
        '--sourcemap-sources-root': String,
        '--assets-dest': String,
        '--asset-catalog-dest': String,
        '--unstable-transform-profile': String,
        '--config': String,
        // Hack: This is added because react-native-xcode.sh script always includes this value.
        // If supplied, we'll do nothing with the value, but at least the process won't crash.
        // Note that we also don't show this value in the `--help` prompt since we don't want people to use it.
        '--config-cmd': String,
        // New flag to guess the other flags based on the environment.
        '--eager': Boolean,
        // Export the bundle as Hermes bytecode bundle
        '--bytecode': Boolean,
        // This is here for compatibility with the `npx react-native bundle` command.
        // devs should use `DEBUG=expo:*` instead.
        '--verbose': Boolean,
        '--help': Boolean,
        // Aliases
        '-h': '--help',
        '-v': '--verbose'
    };
    const args = (0, _args.assertWithOptionsArgs)(rawArgsMap, {
        argv,
        permissive: true
    });
    if (args['--help']) {
        (0, _args.printHelp)(`(Internal) Export the JavaScript bundle during a native build script for embedding in a native binary`, (0, _chalk().default)`npx expo export:embed {dim <dir>}`, [
            (0, _chalk().default)`<dir>                                  Directory of the Expo project. {dim Default: Current working directory}`,
            `--entry-file <path>                    Path to the root JS file, either absolute or relative to JS root`,
            `--platform <string>                    Either "ios" or "android" (default: "ios")`,
            `--transformer <string>                 Specify a custom transformer to be used`,
            `--dev [boolean]                        If false, warnings are disabled and the bundle is minified (default: true)`,
            `--minify [boolean]                     Allows overriding whether bundle is minified. This defaults to false if dev is true, and true if dev is false. Disabling minification can be useful for speeding up production builds for testing purposes.`,
            `--bundle-output <string>               File name where to store the resulting bundle, ex. /tmp/groups.bundle`,
            `--bundle-encoding <string>             Encoding the bundle should be written in (https://nodejs.org/api/buffer.html#buffer_buffer). (default: "utf8")`,
            `--max-workers <number>                 Specifies the maximum number of workers the worker-pool will spawn for transforming files. This defaults to the number of the cores available on your machine.`,
            `--sourcemap-output <string>            File name where to store the sourcemap file for resulting bundle, ex. /tmp/groups.map`,
            `--sourcemap-sources-root <string>      Path to make sourcemap's sources entries relative to, ex. /root/dir`,
            `--sourcemap-use-absolute-path          Report SourceMapURL using its full path`,
            `--assets-dest <string>                 Directory name where to store assets referenced in the bundle`,
            `--asset-catalog-dest <string>          Directory to create an iOS Asset Catalog for images`,
            `--unstable-transform-profile <string>  Experimental, transform JS for a specific JS engine. Currently supported: hermes, hermes-canary, default`,
            `--reset-cache                          Removes cached files`,
            `--eager                                Eagerly export the bundle with default options`,
            `--bytecode                             Export the bundle as Hermes bytecode bundle`,
            `-v, --verbose                          Enables debug logging`,
            `--config <string>                      Path to the CLI configuration file`,
            // This is seemingly unused.
            `--read-global-cache                    Try to fetch transformed JS code from the global cache, if configured.`,
            `-h, --help                             Usage info`
        ].join('\n'));
    }
    const [{ exportEmbedAsync }, { resolveOptions }, { logCmdError }, { resolveCustomBooleanArgsAsync }] = await Promise.all([
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./exportEmbedAsync.js"))),
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./resolveOptions.js"))),
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../../utils/errors.js"))),
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../../utils/resolveArgs.js")))
    ]);
    return (async ()=>{
        const parsed = await resolveCustomBooleanArgsAsync(argv ?? [], rawArgsMap, {
            '--eager': Boolean,
            '--bytecode': Boolean,
            '--dev': Boolean,
            '--minify': Boolean,
            '--sourcemap-use-absolute-path': Boolean,
            '--reset-cache': Boolean,
            '--read-global-cache': Boolean
        });
        const projectRoot = _path().default.resolve(parsed.projectRoot);
        return exportEmbedAsync(projectRoot, resolveOptions(projectRoot, args, parsed));
    })().catch(logCmdError);
};

//# sourceMappingURL=index.js.map