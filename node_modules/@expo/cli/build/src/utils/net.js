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
    isLocalSocket: function() {
        return isLocalSocket;
    },
    isMatchingOrigin: function() {
        return isMatchingOrigin;
    }
});
const ipv6To4Prefix = '::ffff:';
const isLocalSocket = (socket)=>{
    let { localAddress, remoteAddress, remoteFamily } = socket;
    const isLoopbackRequest = localAddress && localAddress === remoteAddress;
    if (isLoopbackRequest) {
        return true;
    } else if (!remoteAddress || !remoteFamily) {
        return false;
    }
    if (remoteFamily === 'IPv6' && remoteAddress.startsWith(ipv6To4Prefix)) {
        remoteAddress = remoteAddress.slice(ipv6To4Prefix.length);
    }
    return remoteAddress === '::1' || remoteAddress.startsWith('127.');
};
const isMatchingOrigin = (request, serverBaseUrl)=>{
    // NOTE(@kitten): The browser will always send an origin header for websocket upgrade connections
    if (!request.headers.origin) {
        return true;
    }
    const actualHost = new URL(`${request.headers.origin}`).host;
    const expectedHost = new URL(serverBaseUrl).host;
    return actualHost === expectedHost;
};

//# sourceMappingURL=net.js.map