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
    getDefaultNativeScheme: function() {
        return getDefaultNativeScheme;
    },
    promptOrQueryNativeSchemeAsync: function() {
        return promptOrQueryNativeSchemeAsync;
    },
    resolveNativeSchemePropsAsync: function() {
        return resolveNativeSchemePropsAsync;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
        return data;
    };
    return data;
}
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
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
const _profile = require("../../../utils/profile");
const _prompts = require("../../../utils/prompts");
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
const debug = require('debug')('expo:run:ios:options:resolveNativeScheme');
async function resolveNativeSchemePropsAsync(projectRoot, options, xcodeProject) {
    return await promptOrQueryNativeSchemeAsync(projectRoot, options) ?? getDefaultNativeScheme(projectRoot, options, xcodeProject);
}
async function promptOrQueryNativeSchemeAsync(projectRoot, { scheme, configuration }) {
    const schemes = _configplugins().IOSConfig.BuildScheme.getRunnableSchemesFromXcodeproj(projectRoot, {
        configuration
    });
    if (!schemes.length) {
        throw new _errors.CommandError('IOS_MALFORMED', 'No native iOS build schemes found');
    }
    if (scheme === true) {
        if (schemes.length === 1) {
            _log.log(`Auto selecting only available scheme: ${schemes[0].name}`);
            return schemes[0];
        }
        const resolvedSchemeName = await (0, _prompts.selectAsync)('Select a scheme', schemes.map((value)=>{
            const isApp = value.type === _configplugins().IOSConfig.Target.TargetType.APPLICATION && value.osType === 'iOS';
            return {
                value: value.name,
                title: isApp ? _chalk().default.bold(value.name) + _chalk().default.gray(' (app)') : value.name
            };
        }), {
            nonInteractiveHelp: `--scheme: argument must be provided with a string in non-interactive mode. Valid choices are: ${schemes.join(', ')}`
        });
        return schemes.find(({ name })=>resolvedSchemeName === name) ?? null;
    }
    // Attempt to match the schemes up so we can open the correct simulator
    return scheme ? schemes.find(({ name })=>name === scheme) || {
        name: scheme
    } : null;
}
function getDefaultNativeScheme(projectRoot, options, xcodeProject) {
    // If the resolution failed then we should just use the first runnable scheme that
    // matches the provided configuration.
    const resolvedSchemes = (0, _profile.profile)(_configplugins().IOSConfig.BuildScheme.getRunnableSchemesFromXcodeproj)(projectRoot, {
        configuration: options.configuration
    });
    // If there are multiple schemes, then the default should be the application.
    if (resolvedSchemes.length > 1) {
        const scheme = resolvedSchemes.find(({ type })=>type === _configplugins().IOSConfig.Target.TargetType.APPLICATION) ?? resolvedSchemes[0];
        debug(`Using default scheme: ${scheme.name}`);
        return scheme;
    }
    // If we couldn't find the scheme, then we'll guess at it,
    // this is needed for cases where the native code hasn't been generated yet.
    if (resolvedSchemes[0]) {
        return resolvedSchemes[0];
    }
    return {
        name: _path().default.basename(xcodeProject.name, _path().default.extname(xcodeProject.name))
    };
}

//# sourceMappingURL=resolveNativeScheme.js.map