"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AsyncWsTunnel", {
    enumerable: true,
    get: function() {
        return AsyncWsTunnel;
    }
});
function _wstunnel() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/ws-tunnel"));
    _wstunnel = function() {
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
function _nodefs() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("node:fs"));
    _nodefs = function() {
        return data;
    };
    return data;
}
function _nodeos() {
    const data = require("node:os");
    _nodeos = function() {
        return data;
    };
    return data;
}
function _nodepath() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("node:path"));
    _nodepath = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
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
const debug = require('debug')('expo:start:server:ws-tunnel');
class AsyncWsTunnel {
    constructor(_projectRoot, port){
        /** Info about the currently running instance of tunnel. */ this.serverUrl = null;
        if (port !== 8081) {
            throw new _errors.CommandError('WS_TUNNEL_PORT', `WS-tunnel only supports tunneling over port 8081, attempted to use port ${port}`);
        }
    }
    getActiveUrl() {
        return this.serverUrl;
    }
    async startAsync() {
        this.serverUrl = await _wstunnel().startAsync({
            ...getTunnelOptions(),
            onStatusChange (status) {
                if (status === 'disconnected') {
                    _log.error(_chalk().default.red('Tunnel connection has been closed. This is often related to intermittent connection problems with the ws proxy servers. Restart the dev server to try connecting again.') + _chalk().default.gray('\nCheck the Expo status page for outages: https://status.expo.dev/'));
                }
            }
        });
        debug('Tunnel URL:', this.serverUrl);
    }
    async stopAsync() {
        debug('Stopping Tunnel');
        await _wstunnel().stopAsync();
        this.serverUrl = null;
    }
}
// Generate a base-36 string of 5 characters (from 32 bits of randomness)
function randomStr() {
    return (Math.random().toString(36) + '00000').slice(2, 7);
}
function getTunnelSession() {
    let session = randomStr() + randomStr() + randomStr();
    if ((0, _env.envIsWebcontainer)()) {
        const leaseId = Buffer.from((0, _nodeos().hostname)()).toString('base64url');
        const leaseFile = _nodepath().join((0, _nodeos().tmpdir)(), `_ws_tunnel_lease_${leaseId}`);
        try {
            session = _nodefs().readFileSync(leaseFile, 'utf8').trim() || session;
        } catch  {}
        try {
            _nodefs().writeFileSync(leaseFile, session, 'utf8');
        } catch  {}
    }
    return session;
}
function getTunnelOptions() {
    const userDefinedSubdomain = _env.env.EXPO_TUNNEL_SUBDOMAIN;
    if (userDefinedSubdomain && typeof userDefinedSubdomain === 'string') {
        debug('Session:', userDefinedSubdomain);
        return {
            session: userDefinedSubdomain
        };
    } else {
        const session = getTunnelSession();
        return {
            session
        };
    }
}

//# sourceMappingURL=AsyncWsTunnel.js.map