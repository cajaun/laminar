#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoRunAndroid", {
    enumerable: true,
    get: function() {
        return expoRunAndroid;
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
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
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
const expoRunAndroid = async (argv)=>{
    const rawArgsMap = {
        // Types
        '--help': Boolean,
        '--no-build-cache': Boolean,
        '--no-install': Boolean,
        '--no-bundler': Boolean,
        '--variant': String,
        '--binary': String,
        '--app-id': String,
        // Unstable, temporary fallback to disable active archs only behavior
        // TODO: replace with better fallback option, like free-form passing gradle props
        '--all-arch': Boolean,
        '--port': Number,
        // Aliases
        '-p': '--port',
        '-h': '--help'
    };
    const args = (0, _args.assertWithOptionsArgs)(rawArgsMap, {
        argv,
        permissive: true
    });
    // '-d' -> '--device': Boolean,
    if (args['--help']) {
        _log.exit((0, _chalk().default)`
  {bold Description}
    Run the native Android app locally

  {bold Usage}
    $ npx expo run:android <dir>

  {bold Options} 
    --no-build-cache       Clear the native build cache
    --no-install           Skip installing dependencies
    --no-bundler           Skip starting the bundler
    --app-id <appId>       Custom Android application ID to launch.
    --variant <name>       Build variant or product flavor and build variant. {dim Default: debug}
    --binary <path>        Path to existing .apk or .aab to install.
    -d, --device [device]  Device name to run the app on
    -p, --port <port>      Port to start the dev server on. {dim Default: 8081}
    -h, --help             Output usage information
`, 0);
    }
    const { resolveStringOrBooleanArgsAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../../utils/resolveArgs.js")));
    const parsed = await resolveStringOrBooleanArgsAsync(argv ?? [], rawArgsMap, {
        '--device': Boolean,
        '-d': '--device'
    }).catch(_errors.logCmdError);
    const { runAndroidAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./runAndroidAsync.js")));
    return runAndroidAsync(_path().default.resolve(parsed.projectRoot), {
        // Parsed options
        buildCache: !args['--no-build-cache'],
        install: !args['--no-install'],
        bundler: !args['--no-bundler'],
        port: args['--port'],
        variant: args['--variant'],
        allArch: args['--all-arch'],
        binary: args['--binary'],
        appId: args['--app-id'],
        // Custom parsed args
        device: parsed.args['--device']
    }).catch(_errors.logCmdError);
};

//# sourceMappingURL=index.js.map