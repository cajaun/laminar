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
    DevelopmentCodeSigningInfoFile: function() {
        return DevelopmentCodeSigningInfoFile;
    },
    getCodeSigningInfoAsync: function() {
        return getCodeSigningInfoAsync;
    },
    getDevelopmentCodeSigningDirectory: function() {
        return getDevelopmentCodeSigningDirectory;
    },
    signManifestString: function() {
        return signManifestString;
    }
});
function _graphqlweb() {
    const data = require("@0no-co/graphql.web");
    _graphqlweb = function() {
        return data;
    };
    return data;
}
function _codesigningcertificates() {
    const data = require("@expo/code-signing-certificates");
    _codesigningcertificates = function() {
        return data;
    };
    return data;
}
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
        return data;
    };
    return data;
}
function _core() {
    const data = require("@urql/core");
    _core = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = require("fs");
    _fs = function() {
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
function _structuredheaders() {
    const data = require("structured-headers");
    _structuredheaders = function() {
        return data;
    };
    return data;
}
const _env = require("./env");
const _errors = require("./errors");
const _getExpoGoIntermediateCertificate = require("../api/getExpoGoIntermediateCertificate");
const _getProjectDevelopmentCertificate = require("../api/getProjectDevelopmentCertificate");
const _AppQuery = require("../api/graphql/queries/AppQuery");
const _UserSettings = require("../api/user/UserSettings");
const _actions = require("../api/user/actions");
const _generated = require("../graphql/generated");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _link = require("../utils/link");
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
const debug = require('debug')('expo:codesigning');
const DEVELOPMENT_CODE_SIGNING_SETTINGS_FILE_NAME = 'development-code-signing-settings-2.json';
function getDevelopmentCodeSigningDirectory() {
    return _path().default.join((0, _UserSettings.getExpoHomeDirectory)(), 'codesigning');
}
function getProjectDevelopmentCodeSigningInfoFile(defaults) {
    function getFile(easProjectId) {
        const filePath = _path().default.join(getDevelopmentCodeSigningDirectory(), easProjectId, DEVELOPMENT_CODE_SIGNING_SETTINGS_FILE_NAME);
        return new (_jsonfile()).default(filePath);
    }
    async function readAsync(easProjectId) {
        let projectSettings;
        try {
            projectSettings = await getFile(easProjectId).readAsync();
        } catch  {
            projectSettings = await getFile(easProjectId).writeAsync(defaults, {
                ensureDir: true
            });
        }
        // Set defaults for any missing fields
        return {
            ...defaults,
            ...projectSettings
        };
    }
    async function setAsync(easProjectId, json) {
        try {
            return await getFile(easProjectId).mergeAsync(json, {
                cantReadFileDefault: defaults
            });
        } catch  {
            return await getFile(easProjectId).writeAsync({
                ...defaults,
                ...json
            }, {
                ensureDir: true
            });
        }
    }
    return {
        getFile,
        readAsync,
        setAsync
    };
}
const DevelopmentCodeSigningInfoFile = getProjectDevelopmentCodeSigningInfoFile({
    easProjectId: null,
    scopeKey: null,
    privateKey: null,
    certificateChain: null
});
async function getCodeSigningInfoAsync(exp, expectSignatureHeader, privateKeyPath) {
    if (!expectSignatureHeader) {
        return null;
    }
    let parsedExpectSignature;
    try {
        parsedExpectSignature = (0, _structuredheaders().parseDictionary)(expectSignatureHeader);
    } catch  {
        throw new _errors.CommandError('Invalid value for expo-expect-signature header');
    }
    const expectedKeyIdOuter = parsedExpectSignature.get('keyid');
    if (!expectedKeyIdOuter) {
        throw new _errors.CommandError('keyid not present in expo-expect-signature header');
    }
    const expectedKeyId = expectedKeyIdOuter[0];
    if (typeof expectedKeyId !== 'string') {
        throw new _errors.CommandError(`Invalid value for keyid in expo-expect-signature header: ${expectedKeyId}`);
    }
    let expectedAlg = null;
    const expectedAlgOuter = parsedExpectSignature.get('alg');
    if (expectedAlgOuter) {
        const expectedAlgTemp = expectedAlgOuter[0];
        if (typeof expectedAlgTemp !== 'string') {
            throw new _errors.CommandError('Invalid value for alg in expo-expect-signature header');
        }
        expectedAlg = expectedAlgTemp;
    }
    if (expectedKeyId === 'expo-root') {
        return await getExpoRootDevelopmentCodeSigningInfoAsync(exp);
    } else if (expectedKeyId === 'expo-go') {
        throw new _errors.CommandError('Invalid certificate requested: cannot sign with embedded keyid=expo-go key');
    } else {
        return await getProjectCodeSigningCertificateAsync(exp, privateKeyPath, expectedKeyId, expectedAlg);
    }
}
/**
 * Get a development code signing certificate for the expo-root -> expo-go -> (development certificate) certificate chain.
 * This requires the user be logged in and online, otherwise try to use the cached development certificate.
 */ async function getExpoRootDevelopmentCodeSigningInfoAsync(exp) {
    var _exp_extra_eas, _exp_extra;
    const easProjectId = (_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_eas = _exp_extra.eas) == null ? void 0 : _exp_extra_eas.projectId;
    // can't check for scope key validity since scope key is derived on the server from projectId and we may be offline.
    // we rely upon the client certificate check to validate the scope key
    if (!easProjectId) {
        debug(`WARN: Expo Application Services (EAS) is not configured for your project. Configuring EAS enables a more secure development experience amongst many other benefits. ${(0, _link.learnMore)('https://docs.expo.dev/eas/')}`);
        return null;
    }
    const developmentCodeSigningInfoFromFile = await DevelopmentCodeSigningInfoFile.readAsync(easProjectId);
    const validatedCodeSigningInfo = validateStoredDevelopmentExpoRootCertificateCodeSigningInfo(developmentCodeSigningInfoFromFile, easProjectId);
    // 1. If online, ensure logged in, generate key pair and CSR, fetch and cache certificate chain for projectId
    //    (overwriting existing dev cert in case projectId changed or it has expired)
    if (!_env.env.EXPO_OFFLINE) {
        try {
            const newCodeSigningInfo = await fetchAndCacheNewDevelopmentCodeSigningInfoAsync(easProjectId);
            if (newCodeSigningInfo) {
                return newCodeSigningInfo;
            // fall back to cached certificate if we couldn't fetch a new one
            } else if (validatedCodeSigningInfo) {
                _log.warn('Could not fetch new Expo development certificate, falling back to cached certificate');
                return validatedCodeSigningInfo;
            } else {
                return null;
            }
        } catch (e) {
            if (validatedCodeSigningInfo) {
                _log.warn('There was an error fetching the Expo development certificate, falling back to cached certificate');
                return validatedCodeSigningInfo;
            } else {
                // need to return null here and say a message
                throw e;
            }
        }
    }
    // 2. check for cached cert/private key matching projectId and scopeKey of project, if found and valid return private key and cert chain including expo-go cert
    if (validatedCodeSigningInfo) {
        return validatedCodeSigningInfo;
    }
    // 3. if offline, return null
    _log.warn('Offline and no cached development certificate found, unable to sign manifest');
    return null;
}
/**
 * Get the certificate configured for expo-updates for this project.
 */ async function getProjectCodeSigningCertificateAsync(exp, privateKeyPath, expectedKeyId, expectedAlg) {
    var _exp_updates, _exp_updates1;
    const codeSigningCertificatePath = (_exp_updates = exp.updates) == null ? void 0 : _exp_updates.codeSigningCertificate;
    if (!codeSigningCertificatePath) {
        return null;
    }
    if (!privateKeyPath) {
        throw new _errors.CommandError('Must specify --private-key-path argument to sign development manifest for requested code signing key');
    }
    const codeSigningMetadata = (_exp_updates1 = exp.updates) == null ? void 0 : _exp_updates1.codeSigningMetadata;
    if (!codeSigningMetadata) {
        throw new _errors.CommandError('Must specify "codeSigningMetadata" under the "updates" field of your app config file to use EAS code signing');
    }
    const { alg, keyid } = codeSigningMetadata;
    if (!alg || !keyid) {
        throw new _errors.CommandError('Must specify "keyid" and "alg" in the "codeSigningMetadata" field under the "updates" field of your app config file to use EAS code signing');
    }
    if (expectedKeyId !== keyid) {
        throw new _errors.CommandError(`keyid mismatch: client=${expectedKeyId}, project=${keyid}`);
    }
    if (expectedAlg && expectedAlg !== alg) {
        throw new _errors.CommandError(`"alg" field mismatch (client=${expectedAlg}, project=${alg})`);
    }
    const { privateKeyPEM, certificatePEM } = await getProjectPrivateKeyAndCertificateFromFilePathsAsync({
        codeSigningCertificatePath,
        privateKeyPath
    });
    return {
        keyId: keyid,
        privateKey: privateKeyPEM,
        certificateForPrivateKey: certificatePEM,
        certificateChainForResponse: [],
        scopeKey: null
    };
}
async function readFileWithErrorAsync(path, errorMessage) {
    try {
        return await _fs().promises.readFile(path, 'utf8');
    } catch  {
        throw new _errors.CommandError(errorMessage);
    }
}
async function getProjectPrivateKeyAndCertificateFromFilePathsAsync({ codeSigningCertificatePath, privateKeyPath }) {
    const [codeSigningCertificatePEM, privateKeyPEM] = await Promise.all([
        readFileWithErrorAsync(codeSigningCertificatePath, `Code signing certificate cannot be read from path: ${codeSigningCertificatePath}`),
        readFileWithErrorAsync(privateKeyPath, `Code signing private key cannot be read from path: ${privateKeyPath}`)
    ]);
    const privateKey = (0, _codesigningcertificates().convertPrivateKeyPEMToPrivateKey)(privateKeyPEM);
    const certificate = (0, _codesigningcertificates().convertCertificatePEMToCertificate)(codeSigningCertificatePEM);
    (0, _codesigningcertificates().validateSelfSignedCertificate)(certificate, {
        publicKey: certificate.publicKey,
        privateKey
    });
    return {
        privateKeyPEM,
        certificatePEM: codeSigningCertificatePEM
    };
}
/**
 * Validate that the cached code signing info is still valid for the current project and
 * that it hasn't expired. If invalid, return null.
 */ function validateStoredDevelopmentExpoRootCertificateCodeSigningInfo(codeSigningInfo, easProjectId) {
    if (codeSigningInfo.easProjectId !== easProjectId) {
        return null;
    }
    const { privateKey: privateKeyPEM, certificateChain: certificatePEMs, scopeKey } = codeSigningInfo;
    if (!privateKeyPEM || !certificatePEMs) {
        return null;
    }
    const certificateChain = certificatePEMs.map((certificatePEM)=>(0, _codesigningcertificates().convertCertificatePEMToCertificate)(certificatePEM));
    // TODO(wschurman): maybe move to @expo/code-signing-certificates
    // ensure all intermediate certificates are valid
    for (const certificate of certificateChain){
        const now = new Date();
        if (certificate.validity.notBefore > now || certificate.validity.notAfter < now) {
            return null;
        }
    }
    // TODO(wschurman): maybe do more validation, like validation of projectID and scopeKey within eas certificate extension
    return {
        keyId: 'expo-go',
        certificateChainForResponse: certificatePEMs,
        certificateForPrivateKey: certificatePEMs[0],
        privateKey: privateKeyPEM,
        scopeKey
    };
}
function actorCanGetProjectDevelopmentCertificate(actor, app) {
    var _actor_accounts_find_users_find_permissions, _actor_accounts_find_users_find, _actor_accounts_find_users, _actor_accounts_find;
    const owningAccountId = app.ownerAccount.id;
    const owningAccountIsActorPrimaryAccount = actor.__typename === 'User' || actor.__typename === 'SSOUser' ? actor.primaryAccount.id === owningAccountId : false;
    const userHasPublishPermissionForOwningAccount = !!((_actor_accounts_find = actor.accounts.find((account)=>account.id === owningAccountId)) == null ? void 0 : (_actor_accounts_find_users = _actor_accounts_find.users) == null ? void 0 : (_actor_accounts_find_users_find = _actor_accounts_find_users.find((userPermission)=>userPermission.actor.id === actor.id)) == null ? void 0 : (_actor_accounts_find_users_find_permissions = _actor_accounts_find_users_find.permissions) == null ? void 0 : _actor_accounts_find_users_find_permissions.includes(_generated.Permission.Publish));
    return owningAccountIsActorPrimaryAccount || userHasPublishPermissionForOwningAccount;
}
async function fetchAndCacheNewDevelopmentCodeSigningInfoAsync(easProjectId) {
    const actor = await (0, _actions.tryGetUserAsync)();
    if (!actor) {
        return null;
    }
    let app;
    try {
        app = await _AppQuery.AppQuery.byIdAsync(easProjectId);
    } catch (e) {
        if (e instanceof _graphqlweb().GraphQLError || e instanceof _core().CombinedError) {
            return null;
        }
        throw e;
    }
    if (!actorCanGetProjectDevelopmentCertificate(actor, app)) {
        return null;
    }
    const keyPair = (0, _codesigningcertificates().generateKeyPair)();
    const keyPairPEM = (0, _codesigningcertificates().convertKeyPairToPEM)(keyPair);
    const csr = (0, _codesigningcertificates().generateCSR)(keyPair, `Development Certificate for ${easProjectId}`);
    const csrPEM = (0, _codesigningcertificates().convertCSRToCSRPEM)(csr);
    const [developmentSigningCertificate, expoGoIntermediateCertificate] = await Promise.all([
        (0, _getProjectDevelopmentCertificate.getProjectDevelopmentCertificateAsync)(easProjectId, csrPEM),
        (0, _getExpoGoIntermediateCertificate.getExpoGoIntermediateCertificateAsync)(easProjectId)
    ]);
    await DevelopmentCodeSigningInfoFile.setAsync(easProjectId, {
        easProjectId,
        scopeKey: app.scopeKey,
        privateKey: keyPairPEM.privateKeyPEM,
        certificateChain: [
            developmentSigningCertificate,
            expoGoIntermediateCertificate
        ]
    });
    return {
        keyId: 'expo-go',
        certificateChainForResponse: [
            developmentSigningCertificate,
            expoGoIntermediateCertificate
        ],
        certificateForPrivateKey: developmentSigningCertificate,
        privateKey: keyPairPEM.privateKeyPEM,
        scopeKey: app.scopeKey
    };
}
function signManifestString(stringifiedManifest, codeSigningInfo) {
    const privateKey = (0, _codesigningcertificates().convertPrivateKeyPEMToPrivateKey)(codeSigningInfo.privateKey);
    const certificate = (0, _codesigningcertificates().convertCertificatePEMToCertificate)(codeSigningInfo.certificateForPrivateKey);
    return (0, _codesigningcertificates().signBufferRSASHA256AndVerify)(privateKey, certificate, Buffer.from(stringifiedManifest, 'utf8'));
}

//# sourceMappingURL=codesigning.js.map