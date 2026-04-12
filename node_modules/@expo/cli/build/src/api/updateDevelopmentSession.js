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
    closeDevelopmentSessionAsync: function() {
        return closeDevelopmentSessionAsync;
    },
    createSessionInfo: function() {
        return createSessionInfo;
    },
    updateDevelopmentSessionAsync: function() {
        return updateDevelopmentSessionAsync;
    }
});
function _os() {
    const data = /*#__PURE__*/ _interop_require_default(require("os"));
    _os = function() {
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
const _client = require("./rest/client");
const _errors = require("../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function createSessionInfo({ exp, runtime, url }) {
    return {
        session: {
            description: `${exp.name} on ${_os().default.hostname()}`,
            hostname: _os().default.hostname(),
            platform: runtime,
            config: {
                // TODO: if icons are specified, upload a url for them too so people can distinguish
                description: exp.description,
                name: exp.name,
                slug: exp.slug,
                primaryColor: exp.primaryColor
            },
            url,
            source: 'desktop'
        }
    };
}
async function updateDevelopmentSessionAsync({ deviceIds, exp, runtime, url }) {
    const searchParams = new (_url()).URLSearchParams();
    deviceIds.forEach((id)=>{
        searchParams.append('deviceId', id);
    });
    const results = await (0, _client.fetchAsync)('development-sessions/notify-alive', {
        searchParams,
        method: 'POST',
        body: JSON.stringify({
            data: createSessionInfo({
                exp,
                runtime,
                url
            })
        })
    });
    if (!results.ok) {
        throw new _errors.CommandError('API', `Unexpected response when updating the development session on Expo servers: ${results.statusText}.`);
    }
}
async function closeDevelopmentSessionAsync({ deviceIds, url }) {
    const searchParams = new (_url()).URLSearchParams();
    deviceIds.forEach((id)=>{
        searchParams.append('deviceId', id);
    });
    const results = await (0, _client.fetchAsync)('development-sessions/notify-close', {
        searchParams,
        method: 'POST',
        body: JSON.stringify({
            session: {
                url
            }
        })
    });
    if (!results.ok) {
        throw new _errors.CommandError('API', `Unexpected response when closing the development session on Expo servers: ${results.statusText}.`);
    }
}

//# sourceMappingURL=updateDevelopmentSession.js.map