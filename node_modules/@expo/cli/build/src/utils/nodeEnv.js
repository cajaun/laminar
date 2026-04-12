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
    loadEnvFiles: function() {
        return loadEnvFiles;
    },
    setNodeEnv: function() {
        return setNodeEnv;
    }
});
function _env() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/env"));
    _env = function() {
        return data;
    };
    return data;
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
function setNodeEnv(mode) {
    process.env.NODE_ENV = process.env.NODE_ENV || mode;
    process.env.BABEL_ENV = process.env.BABEL_ENV || process.env.NODE_ENV;
    // @ts-expect-error: Add support for external React libraries being loaded in the same process.
    globalThis.__DEV__ = process.env.NODE_ENV !== 'production';
}
function loadEnvFiles(projectRoot, options) {
    return _env().load(projectRoot, options);
}

//# sourceMappingURL=nodeEnv.js.map