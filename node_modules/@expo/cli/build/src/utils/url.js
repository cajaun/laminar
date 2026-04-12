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
    isUrlAvailableAsync: function() {
        return isUrlAvailableAsync;
    },
    isUrlOk: function() {
        return isUrlOk;
    },
    stripExtension: function() {
        return stripExtension;
    },
    stripPort: function() {
        return stripPort;
    },
    validateUrl: function() {
        return validateUrl;
    }
});
function _dns() {
    const data = /*#__PURE__*/ _interop_require_default(require("dns"));
    _dns = function() {
        return data;
    };
    return data;
}
function _url() {
    const data = require("url");
    _url = function() {
        return data;
    };
    return data;
}
const _client = require("../api/rest/client");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function isUrlAvailableAsync(url) {
    return new Promise((resolve)=>{
        _dns().default.lookup(url, (err)=>{
            resolve(!err);
        });
    });
}
async function isUrlOk(url) {
    try {
        const res = await (0, _client.fetchAsync)(url);
        return res.ok;
    } catch  {
        return false;
    }
}
function validateUrl(urlString, { protocols, requireProtocol } = {}) {
    try {
        const results = new (_url()).URL(urlString);
        if (!results.protocol && !requireProtocol) {
            return true;
        }
        return protocols ? results.protocol ? protocols.map((x)=>`${x.toLowerCase()}:`).includes(results.protocol) : false : true;
    } catch  {
        return false;
    }
}
function stripPort(host) {
    var _coerceUrl;
    return ((_coerceUrl = coerceUrl(host)) == null ? void 0 : _coerceUrl.hostname) ?? null;
}
function coerceUrl(urlString) {
    if (!urlString) {
        return null;
    }
    try {
        return new (_url()).URL('/', urlString);
    } catch  {
        return new (_url()).URL('/', `http://${urlString}`);
    }
}
function stripExtension(url, extension) {
    return url.replace(new RegExp(`.${extension}$`), '');
}

//# sourceMappingURL=url.js.map