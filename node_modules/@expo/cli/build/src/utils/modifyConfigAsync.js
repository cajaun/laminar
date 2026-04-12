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
    attemptModification: function() {
        return attemptModification;
    },
    warnAboutConfigAndThrow: function() {
        return warnAboutConfigAndThrow;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
async function attemptModification(projectRoot, edits, exactEdits) {
    const modification = await (0, _config().modifyConfigAsync)(projectRoot, edits, {
        skipSDKVersionRequirement: true
    });
    if (modification.type !== 'success') {
        warnAboutConfigAndThrow(modification.type, modification.message, exactEdits);
    }
    return modification.type === 'success';
}
function warnAboutConfigAndThrow(type, message, edits) {
    _log.log();
    if (type === 'warn') {
        // The project is using a dynamic config, give the user a helpful log and bail out.
        _log.log(_chalk().default.yellow(message));
    }
    notifyAboutManualConfigEdits(edits);
    throw new _errors.SilentError();
}
function notifyAboutManualConfigEdits(edits) {
    _log.log(_chalk().default.cyan(`Add the following to your Expo config`));
    _log.log();
    _log.log(JSON.stringify(edits, null, 2));
    _log.log();
}

//# sourceMappingURL=modifyConfigAsync.js.map