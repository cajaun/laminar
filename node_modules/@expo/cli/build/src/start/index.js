#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoStart", {
    enumerable: true,
    get: function() {
        return expoStart;
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
const expoStart = async (argv)=>{
    const args = (0, _args.assertArgs)({
        // Types
        '--help': Boolean,
        '--clear': Boolean,
        '--max-workers': Number,
        '--no-dev': Boolean,
        '--minify': Boolean,
        '--https': Boolean,
        '--private-key-path': String,
        '--port': Number,
        '--dev-client': Boolean,
        '--scheme': String,
        '--android': Boolean,
        '--ios': Boolean,
        '--web': Boolean,
        '--host': String,
        '--tunnel': Boolean,
        '--lan': Boolean,
        '--localhost': Boolean,
        '--offline': Boolean,
        '--go': Boolean,
        // Aliases
        '-h': '--help',
        '-c': '--clear',
        '-p': '--port',
        '-a': '--android',
        '-i': '--ios',
        '-w': '--web',
        '-m': '--host',
        '-d': '--dev-client',
        '-g': '--go',
        // Alias for adding interop with the Metro docs and RedBox errors.
        '--reset-cache': '--clear'
    }, argv);
    if (args['--help']) {
        (0, _args.printHelp)(`Start a local dev server for the app`, (0, _chalk().default)`npx expo start {dim <dir>}`, [
            (0, _chalk().default)`<dir>                           Directory of the Expo project. {dim Default: Current working directory}`,
            `-a, --android                   Open on a connected Android device`,
            `-i, --ios                       Open in an iOS simulator`,
            `-w, --web                       Open in a web browser`,
            ``,
            (0, _chalk().default)`-d, --dev-client                Launch in a custom native app`,
            (0, _chalk().default)`-g, --go                        Launch in Expo Go`,
            ``,
            `-c, --clear                     Clear the bundler cache`,
            `--max-workers <number>          Maximum number of tasks to allow Metro to spawn`,
            `--no-dev                        Bundle in production mode`,
            `--minify                        Minify JavaScript`,
            ``,
            (0, _chalk().default)`-m, --host <string>             Dev server hosting type. {dim Default: lan}`,
            (0, _chalk().default)`                                {bold lan}: Use the local network`,
            (0, _chalk().default)`                                {bold tunnel}: Use any network by tunnel through ngrok`,
            (0, _chalk().default)`                                {bold localhost}: Connect to the dev server over localhost`,
            `--tunnel                        Same as --host tunnel`,
            `--lan                           Same as --host lan`,
            `--localhost                     Same as --host localhost`,
            ``,
            `--offline                       Skip network requests and use anonymous manifest signatures`,
            (0, _chalk().default)`--https                         Start the dev server with https protocol. {bold Deprecated in favor of --tunnel}`,
            `--scheme <scheme>               Custom URI protocol to use when launching an app`,
            (0, _chalk().default)`-p, --port <number>             Port to start the dev server on (does not apply to web or tunnel). {dim Default: 8081}`,
            ``,
            (0, _chalk().default)`--private-key-path <path>       Path to private key for code signing. {dim Default: "private-key.pem" in the same directory as the certificate specified by the expo-updates configuration in app.json.}`,
            `-h, --help                      Usage info`
        ].join('\n'));
    }
    const projectRoot = (0, _args.getProjectRoot)(args);
    // NOTE(cedric): `./resolveOptions` loads the expo config when using dev clients, this needs to be initialized before that
    const { setNodeEnv, loadEnvFiles } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../utils/nodeEnv.js")));
    setNodeEnv(!args['--no-dev'] ? 'development' : 'production');
    loadEnvFiles(projectRoot);
    const { resolveOptionsAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./resolveOptions.js")));
    const options = await resolveOptionsAsync(projectRoot, args).catch(_errors.logCmdError);
    if (options.offline) {
        const { disableNetwork } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../api/settings.js")));
        disableNetwork();
    }
    const { startAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./startAsync.js")));
    return startAsync(projectRoot, options, {
        webOnly: false
    }).catch(_errors.logCmdError);
};

//# sourceMappingURL=index.js.map