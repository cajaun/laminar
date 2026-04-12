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
    assertMissingRuntimePlatform: function() {
        return assertMissingRuntimePlatform;
    },
    assertRuntimePlatform: function() {
        return assertRuntimePlatform;
    },
    parsePlatformHeader: function() {
        return parsePlatformHeader;
    },
    resolvePlatformFromUserAgentHeader: function() {
        return resolvePlatformFromUserAgentHeader;
    }
});
function _url() {
    const data = require("url");
    _url = function() {
        return data;
    };
    return data;
}
const _errors = require("../../../utils/errors");
const debug = require('debug')('expo:start:server:middleware:resolvePlatform');
function parsePlatformHeader(req) {
    var _url_query;
    const url = (0, _url().parse)(req.url, /* parseQueryString */ true);
    const platform = ((_url_query = url.query) == null ? void 0 : _url_query.platform) || req.headers['expo-platform'] || req.headers['exponent-platform'];
    return (Array.isArray(platform) ? platform[0] : platform) ?? null;
}
function resolvePlatformFromUserAgentHeader(req) {
    let platform = null;
    const userAgent = req.headers['user-agent'];
    if (userAgent == null ? void 0 : userAgent.match(/Android/i)) {
        platform = 'android';
    }
    if (userAgent == null ? void 0 : userAgent.match(/OculusBrowser|Quest/i)) {
        platform = 'android';
    }
    if (userAgent == null ? void 0 : userAgent.match(/iPhone|iPad/i)) {
        platform = 'ios';
    }
    debug(`Resolved platform ${platform} from user-agent header: ${userAgent}`);
    return platform;
}
function assertMissingRuntimePlatform(platform) {
    if (!platform) {
        throw new _errors.CommandError('PLATFORM_HEADER', `Must specify "expo-platform" header or "platform" query parameter`);
    }
}
function assertRuntimePlatform(platform) {
    const stringifiedPlatform = String(platform);
    if (![
        'android',
        'ios',
        'web'
    ].includes(stringifiedPlatform)) {
        throw new _errors.CommandError('PLATFORM_HEADER', `platform must be "android", "ios", or "web". Received: "${platform}"`);
    }
}

//# sourceMappingURL=resolvePlatform.js.map