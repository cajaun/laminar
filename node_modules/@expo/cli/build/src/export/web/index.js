#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoExportWeb", {
    enumerable: true,
    get: function() {
        return expoExportWeb;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _args = require("../../utils/args");
const _errors = require("../../utils/errors");
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
const expoExportWeb = async (argv)=>{
    const args = (0, _args.assertArgs)({
        // Types
        '--help': Boolean,
        '--clear': Boolean,
        '--dev': Boolean,
        // Aliases
        '-h': '--help',
        '-c': '--clear'
    }, argv);
    if (args['--help']) {
        (0, _args.printHelp)(`(Deprecated) Bundle the static files of the web app with Webpack for hosting on a web server`, (0, _chalk().default)`npx expo export:web {dim <dir>}`, [
            (0, _chalk().default)`<dir>                         Directory of the Expo project. {dim Default: Current working directory}`,
            `--dev                         Bundle in development mode`,
            `-c, --clear                   Clear the bundler cache`,
            `-h, --help                    Usage info`
        ].join('\n'));
    }
    const projectRoot = (0, _args.getProjectRoot)(args);
    const { resolveOptionsAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./resolveOptions.js")));
    const options = await resolveOptionsAsync(args).catch(_errors.logCmdError);
    const { exportWebAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./exportWebAsync.js")));
    return exportWebAsync(projectRoot, options).catch(_errors.logCmdError);
};

//# sourceMappingURL=index.js.map