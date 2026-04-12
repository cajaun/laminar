// Common utilities for interacting with `args` library.
// These functions should be used by every command.
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
    assertArgs: function() {
        return assertArgs;
    },
    assertWithOptionsArgs: function() {
        return assertWithOptionsArgs;
    },
    getProjectRoot: function() {
        return getProjectRoot;
    },
    printHelp: function() {
        return printHelp;
    }
});
function _arg() {
    const data = /*#__PURE__*/ _interop_require_default(require("arg"));
    _arg = function() {
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
function _fs() {
    const data = require("fs");
    _fs = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = require("path");
    _path = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
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
function getProjectRoot(args) {
    const projectRoot = (0, _path().resolve)(args._[0] || '.');
    if (!(0, _fs().existsSync)(projectRoot)) {
        _log.exit(`Invalid project root: ${projectRoot}`);
    }
    return projectRoot;
}
function assertArgs(schema, argv) {
    return assertWithOptionsArgs(schema, {
        argv
    });
}
function assertWithOptionsArgs(schema, options) {
    try {
        return (0, _arg().default)(schema, options);
    } catch (error) {
        // Handle errors caused by user input.
        // Only errors from `arg`, which does not start with `ARG_CONFIG_` are user input errors.
        // See: https://github.com/vercel/arg/releases/tag/5.0.0
        if ('code' in error && error.code.startsWith('ARG_') && !error.code.startsWith('ARG_CONFIG_')) {
            _log.exit(error.message, 1);
        }
        // Otherwise rethrow the error.
        throw error;
    }
}
function printHelp(info, usage, options, extra = '') {
    _log.exit((0, _chalk().default)`
  {bold Info}
    ${info}

  {bold Usage}
    {dim $} ${usage}

  {bold Options}
    ${options.split('\n').join('\n    ')}
` + extra, 0);
}

//# sourceMappingURL=args.js.map