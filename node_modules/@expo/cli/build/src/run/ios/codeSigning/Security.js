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
    extractCodeSigningInfo: function() {
        return extractCodeSigningInfo;
    },
    extractSigningId: function() {
        return extractSigningId;
    },
    findIdentitiesAsync: function() {
        return findIdentitiesAsync;
    },
    getCertificateForSigningIdAsync: function() {
        return getCertificateForSigningIdAsync;
    },
    getSecurityPemAsync: function() {
        return getSecurityPemAsync;
    },
    resolveCertificateSigningInfoAsync: function() {
        return resolveCertificateSigningInfoAsync;
    },
    resolveIdentitiesAsync: function() {
        return resolveIdentitiesAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _nodeforge() {
    const data = /*#__PURE__*/ _interop_require_default(require("node-forge"));
    _nodeforge = function() {
        return data;
    };
    return data;
}
const _SecurityBinPrerequisite = require("../../../start/doctor/SecurityBinPrerequisite");
const _errors = require("../../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function getSecurityPemAsync(id) {
    var _stdout_trim, _stdout;
    const pem = (_stdout = (await (0, _spawnasync().default)('security', [
        'find-certificate',
        '-c',
        id,
        '-p'
    ])).stdout) == null ? void 0 : (_stdout_trim = _stdout.trim) == null ? void 0 : _stdout_trim.call(_stdout);
    if (!pem) {
        throw new _errors.CommandError(`Failed to get PEM certificate for ID "${id}" using the 'security' bin`);
    }
    return pem;
}
async function getCertificateForSigningIdAsync(id) {
    const pem = await getSecurityPemAsync(id);
    return _nodeforge().default.pki.certificateFromPem(pem);
}
async function findIdentitiesAsync() {
    var _stdout_trim, _stdout;
    await _SecurityBinPrerequisite.SecurityBinPrerequisite.instance.assertAsync();
    const results = (_stdout_trim = (_stdout = (await (0, _spawnasync().default)('security', [
        'find-identity',
        '-p',
        'codesigning',
        '-v'
    ])).stdout).trim) == null ? void 0 : _stdout_trim.call(_stdout);
    // Returns a string like:
    // 1) 12222234253761286351826735HGKDHAJGF45283 "Apple Development: Evan Bacon (AA00AABB0A)" (CSSMERR_TP_CERT_REVOKED)
    // 2) 12312234253761286351826735HGKDHAJGF45283 "Apple Development: bacon@expo.io (BB00AABB0A)"
    // 3) 12442234253761286351826735HGKDHAJGF45283 "iPhone Distribution: Evan Bacon (CC00AABB0B)" (CSSMERR_TP_CERT_REVOKED)
    // 4) 15672234253761286351826735HGKDHAJGF45283 "Apple Development: Evan Bacon (AA00AABB0A)"
    //  4 valid identities found
    const parsed = results.split('\n').map((line)=>extractCodeSigningInfo(line)).filter(Boolean);
    // Remove duplicates
    return [
        ...new Set(parsed)
    ];
}
function extractCodeSigningInfo(value) {
    var _value_match;
    return ((_value_match = value.match(/^\s*\d+\).+"(.+Develop(ment|er).+)"$/)) == null ? void 0 : _value_match[1]) ?? null;
}
async function resolveIdentitiesAsync(identities) {
    const values = identities.map(extractSigningId).filter(Boolean);
    return Promise.all(values.map(resolveCertificateSigningInfoAsync));
}
async function resolveCertificateSigningInfoAsync(signingCertificateId) {
    var _certificate_subject_getField, _certificate_subject_getField1, _certificate_subject_getField2;
    const certificate = await getCertificateForSigningIdAsync(signingCertificateId);
    return {
        signingCertificateId,
        codeSigningInfo: (_certificate_subject_getField = certificate.subject.getField('CN')) == null ? void 0 : _certificate_subject_getField.value,
        appleTeamName: (_certificate_subject_getField1 = certificate.subject.getField('O')) == null ? void 0 : _certificate_subject_getField1.value,
        appleTeamId: (_certificate_subject_getField2 = certificate.subject.getField('OU')) == null ? void 0 : _certificate_subject_getField2.value
    };
}
function extractSigningId(codeSigningInfo) {
    var _codeSigningInfo_match;
    return ((_codeSigningInfo_match = codeSigningInfo.match(/.*\(([a-zA-Z0-9]+)\)/)) == null ? void 0 : _codeSigningInfo_match[1]) ?? null;
}

//# sourceMappingURL=Security.js.map