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
    parsePlistAsync: function() {
        return parsePlistAsync;
    },
    parsePlistBuffer: function() {
        return parsePlistBuffer;
    }
});
function _plist() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/plist"));
    _plist = function() {
        return data;
    };
    return data;
}
function _bplistparser() {
    const data = /*#__PURE__*/ _interop_require_default(require("bplist-parser"));
    _bplistparser = function() {
        return data;
    };
    return data;
}
function _promises() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
    _promises = function() {
        return data;
    };
    return data;
}
const _errors = require("./errors");
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
const CHAR_CHEVRON_OPEN = 60;
const CHAR_B_LOWER = 98;
async function parsePlistAsync(plistPath) {
    _log.debug(`Parse plist: ${plistPath}`);
    return parsePlistBuffer(await _promises().default.readFile(plistPath));
}
function parsePlistBuffer(contents) {
    if (contents[0] === CHAR_CHEVRON_OPEN) {
        const info = _plist().default.parse(contents.toString());
        if (Array.isArray(info)) return info[0];
        return info;
    } else if (contents[0] === CHAR_B_LOWER) {
        // @ts-expect-error
        const info = _bplistparser().default.parseBuffer(contents);
        if (Array.isArray(info)) return info[0];
        return info;
    } else {
        throw new _errors.CommandError('PLIST', `Cannot parse plist of type byte (0x${contents[0].toString(16)})`);
    }
}

//# sourceMappingURL=plist.js.map