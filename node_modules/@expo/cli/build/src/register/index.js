#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoRegister", {
    enumerable: true,
    get: function() {
        return expoRegister;
    }
});
const _args = require("../utils/args");
const _errors = require("../utils/errors");
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
const expoRegister = async (argv)=>{
    const args = (0, _args.assertArgs)({
        // Types
        '--help': Boolean,
        // Aliases
        '-h': '--help'
    }, argv);
    if (args['--help']) {
        (0, _args.printHelp)(`Sign up for a new Expo account`, `npx expo register`, // Options
        `-h, --help    Usage info`);
    }
    const { registerAsync } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("./registerAsync.js")));
    return registerAsync().catch(_errors.logCmdError);
};

//# sourceMappingURL=index.js.map