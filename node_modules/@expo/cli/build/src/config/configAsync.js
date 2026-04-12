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
    configAsync: function() {
        return configAsync;
    },
    logConfig: function() {
        return logConfig;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _util() {
    const data = /*#__PURE__*/ _interop_require_default(require("util"));
    _util = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _errors = require("../utils/errors");
const _nodeEnv = require("../utils/nodeEnv");
const _profile = require("../utils/profile");
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
function logConfig(config) {
    const isObjStr = (str)=>/^\w+: {/g.test(str);
    _log.log(_util().default.inspect(config, {
        colors: true,
        compact: false,
        // Sort objects to the end so that smaller values aren't hidden between large objects.
        sorted (a, b) {
            if (isObjStr(a)) return 1;
            if (isObjStr(b)) return -1;
            return 0;
        },
        showHidden: false,
        depth: null
    }));
}
async function configAsync(projectRoot, options) {
    const loggingFunctions = {
        log: console.log,
        warn: console.warn,
        error: console.error
    };
    // Disable logging for this command if the user wants to get JSON output.
    // This will ensure that only the JSON is printed to stdout.
    if (options.json) {
        console.log = function() {};
        console.warn = function() {};
        console.error = function() {};
    }
    (0, _nodeEnv.setNodeEnv)('development');
    require('@expo/env').load(projectRoot);
    if (options.type) {
        _assert().default.match(options.type, /^(public|prebuild|introspect)$/);
    }
    let config;
    if (options.type === 'prebuild') {
        const { getPrebuildConfigAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("@expo/prebuild-config")));
        config = await (0, _profile.profile)(getPrebuildConfigAsync)(projectRoot, {
            platforms: [
                'ios',
                'android'
            ]
        });
    } else if (options.type === 'introspect') {
        const { getPrebuildConfigAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("@expo/prebuild-config")));
        const { compileModsAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("@expo/config-plugins/build/plugins/mod-compiler.js")));
        config = await (0, _profile.profile)(getPrebuildConfigAsync)(projectRoot, {
            platforms: [
                'ios',
                'android'
            ]
        });
        await compileModsAsync(config.exp, {
            projectRoot,
            introspect: true,
            platforms: [
                'ios',
                'android'
            ],
            assertMissingModProviders: false
        });
        // @ts-ignore
        delete config.modRequest;
        // @ts-ignore
        delete config.modResults;
    } else if (options.type === 'public') {
        config = (0, _profile.profile)(_config().getConfig)(projectRoot, {
            skipSDKVersionRequirement: true,
            isPublicConfig: true
        });
    } else if (options.type) {
        throw new _errors.CommandError(`Invalid option: --type ${options.type}. Valid options are: public, prebuild`);
    } else {
        config = (0, _profile.profile)(_config().getConfig)(projectRoot, {
            skipSDKVersionRequirement: true
        });
    }
    const configOutput = options.full ? config : config.exp;
    if (!options.json) {
        _log.log();
        logConfig(configOutput);
        _log.log();
    } else {
        process.stdout.write(JSON.stringify(configOutput));
        // Re-enable logging functions for testing.
        console.log = loggingFunctions.log;
        console.warn = loggingFunctions.warn;
        console.error = loggingFunctions.error;
    }
}

//# sourceMappingURL=configAsync.js.map