"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getProjectDevelopmentCertificateAsync", {
    enumerable: true,
    get: function() {
        return getProjectDevelopmentCertificateAsync;
    }
});
const _client = require("./rest/client");
const _errors = require("../utils/errors");
async function getProjectDevelopmentCertificateAsync(easProjectId, csrPEM) {
    const response = await (0, _client.fetchAsync)(`projects/${encodeURIComponent(easProjectId)}/development-certificates`, {
        method: 'POST',
        body: JSON.stringify({
            csrPEM
        })
    });
    if (!response.ok) {
        throw new _errors.CommandError('API', `Unexpected error from Expo servers: ${response.statusText}.`);
    }
    return await response.text();
}

//# sourceMappingURL=getProjectDevelopmentCertificate.js.map