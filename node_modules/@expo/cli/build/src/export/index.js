#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoExport", {
    enumerable: true,
    get: function() {
        return expoExport;
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
const _errors = require("../utils/errors");
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
const expoExport = async (argv)=>{
    const args = (0, _args.assertArgs)({
        // Types
        '--help': Boolean,
        '--clear': Boolean,
        '--dump-assetmap': Boolean,
        '--dev': Boolean,
        '--source-maps': Boolean,
        '--max-workers': Number,
        '--output-dir': String,
        '--platform': [
            String
        ],
        '--no-minify': Boolean,
        '--no-bytecode': Boolean,
        '--no-ssg': Boolean,
        '--api-only': Boolean,
        '--unstable-hosted-native': Boolean,
        // Hack: This is added because EAS CLI always includes the flag.
        // If supplied, we'll do nothing with the value, but at least the process won't crash.
        // Note that we also don't show this value in the `--help` prompt since we don't want people to use it.
        '--experimental-bundle': Boolean,
        // Aliases
        '-h': '--help',
        '-s': '--source-maps',
        // '-d': '--dump-assetmap',
        '-c': '--clear',
        '-p': '--platform',
        // Interop with Metro docs and RedBox errors.
        '--reset-cache': '--clear',
        // Deprecated
        '--dump-sourcemap': '--source-maps'
    }, argv);
    if (args['--help']) {
        (0, _args.printHelp)(`Export the static files of the app for hosting it on a web server`, (0, _chalk().default)`npx expo export {dim <dir>}`, [
            (0, _chalk().default)`<dir>                      Directory of the Expo project. {dim Default: Current working directory}`,
            (0, _chalk().default)`--output-dir <dir>         The directory to export the static files to. {dim Default: dist}`,
            `--dev                      Configure static files for developing locally using a non-https server`,
            `--no-minify                Prevent minifying source`,
            `--no-bytecode              Prevent generating Hermes bytecode`,
            `--max-workers <number>     Maximum number of tasks to allow the bundler to spawn`,
            `--dump-assetmap            Emit an asset map for further processing`,
            `--no-ssg, --api-only       Skip exporting static HTML files and only export API routes for web`,
            (0, _chalk().default)`-p, --platform <platform>  Options: android, ios, web, all. {dim Default: all}`,
            `-s, --source-maps          Emit JavaScript source maps`,
            `-c, --clear                Clear the bundler cache`,
            `-h, --help                 Usage info`
        ].join('\n'));
    }
    const projectRoot = (0, _args.getProjectRoot)(args);
    const { resolveOptionsAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./resolveOptions.js")));
    const options = await resolveOptionsAsync(projectRoot, args).catch(_errors.logCmdError);
    const { exportAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./exportAsync.js")));
    return exportAsync(projectRoot, options).catch(_errors.logCmdError);
};

//# sourceMappingURL=index.js.map