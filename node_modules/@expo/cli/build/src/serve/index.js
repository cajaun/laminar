#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoServe", {
    enumerable: true,
    get: function() {
        return expoServe;
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
const expoServe = async (argv)=>{
    const args = (0, _args.assertArgs)({
        // Types
        '--help': Boolean,
        '--port': Number,
        // Aliases
        '-h': '--help'
    }, argv);
    if (args['--help']) {
        (0, _args.printHelp)(`Host the production server locally`, (0, _chalk().default)`npx expo serve {dim <dir>}`, [
            (0, _chalk().default)`<dir>            Directory of the Expo project. {dim Default: Current working directory}`,
            `--port <number>  Port to host the server on`,
            `-h, --help       Usage info`
        ].join('\n'));
    }
    // Load modules after the help prompt so `npx expo config -h` shows as fast as possible.
    const [// ./configAsync
    { serveAsync }, // ../utils/errors
    { logCmdError }] = await Promise.all([
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./serveAsync.js"))),
        Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../utils/errors.js")))
    ]);
    return serveAsync((0, _args.getProjectRoot)(args), {
        isDefaultDirectory: !args._[0],
        // Parsed options
        port: args['--port']
    }).catch(logCmdError);
};

//# sourceMappingURL=index.js.map