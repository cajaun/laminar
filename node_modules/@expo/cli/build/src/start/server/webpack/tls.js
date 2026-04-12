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
    ensureEnvironmentSupportsTLSAsync: function() {
        return ensureEnvironmentSupportsTLSAsync;
    },
    getTLSCertAsync: function() {
        return getTLSCertAsync;
    }
});
function _devcert() {
    const data = require("@expo/devcert");
    _devcert = function() {
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
function _promises() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
    _promises = function() {
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
const _dir = require("../../../utils/dir");
const _dotExpo = require("../../project/dotExpo");
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
async function ensureEnvironmentSupportsTLSAsync(projectRoot) {
    if (!process.env.SSL_CRT_FILE || !process.env.SSL_KEY_FILE) {
        const tls = await getTLSCertAsync(projectRoot);
        if (tls) {
            process.env.SSL_CRT_FILE = tls.certPath;
            process.env.SSL_KEY_FILE = tls.keyPath;
        }
    }
}
async function getTLSCertAsync(projectRoot) {
    _log.log((0, _chalk().default)`Creating TLS certificate for localhost. {dim This functionality may not work on all computers.}`);
    const name = 'localhost';
    const result = await (0, _devcert().certificateFor)(name);
    if (result) {
        const dotExpoDir = (0, _dotExpo.ensureDotExpoProjectDirectoryInitialized)(projectRoot);
        const { key, cert } = result;
        const folder = _path().default.join(dotExpoDir, 'tls');
        const keyPath = _path().default.join(folder, `key-${name}.pem`);
        const certPath = _path().default.join(folder, `cert-${name}.pem`);
        await (0, _dir.ensureDirectoryAsync)(folder);
        await Promise.allSettled([
            _promises().default.writeFile(keyPath, key),
            _promises().default.writeFile(certPath, cert)
        ]);
        return {
            keyPath,
            certPath
        };
    }
    return result;
}

//# sourceMappingURL=tls.js.map