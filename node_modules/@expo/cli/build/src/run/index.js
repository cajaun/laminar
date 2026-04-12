#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoRun", {
    enumerable: true,
    get: function() {
        return expoRun;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _hints = require("./hints");
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
const expoRun = async (argv)=>{
    const args = (0, _args.assertWithOptionsArgs)({
        // Types
        '--help': Boolean,
        // Aliases
        '-h': '--help'
    }, {
        argv,
        // Allow additional flags for both android and ios commands
        permissive: true
    });
    try {
        let [platform] = args._ ?? [];
        // Workaround, filter `--flag` as platform
        if (platform == null ? void 0 : platform.startsWith('-')) {
            platform = '';
        }
        // Remove the platform from raw arguments, when provided
        const argsWithoutPlatform = !platform ? argv : argv == null ? void 0 : argv.splice(1);
        // Do not capture `--help` when platform is provided
        if (!platform && args['--help']) {
            (0, _args.printHelp)('Run the native app locally', `npx expo run <android|ios>`, (0, _chalk().default)`{dim $} npx expo run <android|ios> --help  Output usage information`);
        }
        if (!platform) {
            const { selectAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("../utils/prompts.js")));
            platform = await selectAsync('Select the platform to run', [
                {
                    title: 'Android',
                    value: 'android'
                },
                {
                    title: 'iOS',
                    value: 'ios'
                }
            ]);
        }
        (0, _hints.logPlatformRunCommand)(platform, argsWithoutPlatform);
        switch(platform){
            case 'android':
                {
                    const { expoRunAndroid } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./android/index.js")));
                    return expoRunAndroid(argsWithoutPlatform);
                }
            case 'ios':
                {
                    const { expoRunIos } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./ios/index.js")));
                    return expoRunIos(argsWithoutPlatform);
                }
            default:
                throw new _errors.CommandError('UNSUPPORTED_PLATFORM', `Unsupported platform: ${platform}`);
        }
    } catch (error) {
        (0, _errors.logCmdError)(error);
    }
};

//# sourceMappingURL=index.js.map