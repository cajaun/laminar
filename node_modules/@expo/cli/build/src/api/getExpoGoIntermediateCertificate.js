"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getExpoGoIntermediateCertificateAsync", {
    enumerable: true,
    get: function() {
        return getExpoGoIntermediateCertificateAsync;
    }
});
const _client = require("./rest/client");
const _errors = require("../utils/errors");
async function getExpoGoIntermediateCertificateAsync(easProjectId) {
    const response = await (0, _client.fetchAsync)(`projects/${encodeURIComponent(easProjectId)}/development-certificates/expo-go-intermediate-certificate`, {
        method: 'GET'
    });
    if (!response.ok) {
        throw new _errors.CommandError('API', `Unexpected error from Expo servers: ${response.statusText}.`);
    }
    return await response.text();
}

//# sourceMappingURL=getExpoGoIntermediateCertificate.js.map