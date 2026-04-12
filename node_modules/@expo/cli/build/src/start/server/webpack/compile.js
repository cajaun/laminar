"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "compileAsync", {
    enumerable: true,
    get: function() {
        return compileAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _util() {
    const data = require("util");
    _util = function() {
        return data;
    };
    return data;
}
const _formatWebpackMessages = require("./formatWebpackMessages");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
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
async function compileAsync(compiler) {
    const stats = await (0, _util().promisify)(compiler.run.bind(compiler))();
    const { errors, warnings } = (0, _formatWebpackMessages.formatWebpackMessages)(stats.toJson({
        all: false,
        warnings: true,
        errors: true
    }));
    if (errors == null ? void 0 : errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (errors.length > 1) {
            errors.length = 1;
        }
        throw new _errors.CommandError('WEBPACK_BUNDLE', errors.join('\n\n'));
    }
    if (warnings == null ? void 0 : warnings.length) {
        _log.warn(_chalk().default.yellow('Compiled with warnings\n'));
        _log.warn(warnings.join('\n\n'));
    } else {
        _log.log(_chalk().default.green('Compiled successfully'));
    }
    return {
        errors,
        warnings
    };
}

//# sourceMappingURL=compile.js.map