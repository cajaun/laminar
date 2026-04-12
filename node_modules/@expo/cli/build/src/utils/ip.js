"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getIpAddress", {
    enumerable: true,
    get: function() {
        return getIpAddress;
    }
});
function _lannetwork() {
    const data = require("lan-network");
    _lannetwork = function() {
        return data;
    };
    return data;
}
function getIpAddress() {
    try {
        const lan = (0, _lannetwork().lanNetworkSync)();
        return lan.address;
    } catch  {
        return '127.0.0.1';
    }
}

//# sourceMappingURL=ip.js.map