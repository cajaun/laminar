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
    ExpoGoManifestHandlerMiddleware: function() {
        return ExpoGoManifestHandlerMiddleware;
    },
    ResponseContentType: function() {
        return ResponseContentType;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
        return data;
    };
    return data;
}
function _accepts() {
    const data = /*#__PURE__*/ _interop_require_default(require("accepts"));
    _accepts = function() {
        return data;
    };
    return data;
}
function _crypto() {
    const data = /*#__PURE__*/ _interop_require_default(require("crypto"));
    _crypto = function() {
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
const _ManifestMiddleware = require("./ManifestMiddleware");
const _resolvePlatform = require("./resolvePlatform");
const _resolveRuntimeVersionWithExpoUpdatesAsync = require("./resolveRuntimeVersionWithExpoUpdatesAsync");
const _UserSettings = require("../../../api/user/UserSettings");
const _user = require("../../../api/user/user");
const _codesigning = require("../../../utils/codesigning");
const _errors = require("../../../utils/errors");
const _multipartMixed = require("../../../utils/multipartMixed");
const _url = require("../../../utils/url");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:server:middleware:ExpoGoManifestHandlerMiddleware');
var ResponseContentType = /*#__PURE__*/ function(ResponseContentType) {
    ResponseContentType[ResponseContentType["TEXT_PLAIN"] = 0] = "TEXT_PLAIN";
    ResponseContentType[ResponseContentType["APPLICATION_JSON"] = 1] = "APPLICATION_JSON";
    ResponseContentType[ResponseContentType["APPLICATION_EXPO_JSON"] = 2] = "APPLICATION_EXPO_JSON";
    ResponseContentType[ResponseContentType["MULTIPART_MIXED"] = 3] = "MULTIPART_MIXED";
    return ResponseContentType;
}({});
class ExpoGoManifestHandlerMiddleware extends _ManifestMiddleware.ManifestMiddleware {
    getParsedHeaders(req) {
        let platform = (0, _resolvePlatform.parsePlatformHeader)(req);
        if (!platform) {
            debug(`No "expo-platform" header or "platform" query parameter specified. Falling back to "ios".`);
            platform = 'ios';
        }
        (0, _resolvePlatform.assertRuntimePlatform)(platform);
        // Expo Updates clients explicitly accept "multipart/mixed" responses while browsers implicitly
        // accept them with "accept: */*". To make it easier to debug manifest responses by visiting their
        // URLs in a browser, we denote the response as "text/plain" if the user agent appears not to be
        // an Expo Updates client.
        const accept = (0, _accepts().default)(req);
        const acceptedType = accept.types([
            'unknown/unknown',
            'multipart/mixed',
            'application/json',
            'application/expo+json',
            'text/plain'
        ]);
        let responseContentType;
        switch(acceptedType){
            case 'multipart/mixed':
                responseContentType = 3;
                break;
            case 'application/json':
                responseContentType = 1;
                break;
            case 'application/expo+json':
                responseContentType = 2;
                break;
            default:
                responseContentType = 0;
                break;
        }
        const expectSignature = req.headers['expo-expect-signature'];
        return {
            responseContentType,
            platform,
            expectSignature: expectSignature ? String(expectSignature) : null,
            hostname: (0, _url.stripPort)(req.headers['host']),
            protocol: req.headers['x-forwarded-proto']
        };
    }
    getDefaultResponseHeaders() {
        const headers = new Map();
        // set required headers for Expo Updates manifest specification
        headers.set('expo-protocol-version', 0);
        headers.set('expo-sfv-version', 0);
        headers.set('cache-control', 'private, max-age=0');
        return headers;
    }
    async _getManifestResponseAsync(requestOptions) {
        var _exp_extra_eas, _exp_extra;
        const { exp, hostUri, expoGoConfig, bundleUrl } = await this._resolveProjectSettingsAsync(requestOptions);
        const runtimeVersion = await (0, _resolveRuntimeVersionWithExpoUpdatesAsync.resolveRuntimeVersionWithExpoUpdatesAsync)({
            projectRoot: this.projectRoot,
            platform: requestOptions.platform
        }) ?? // if expo-updates can't determine runtime version, fall back to calculation from config-plugin.
        // this happens when expo-updates is installed but runtimeVersion hasn't yet been configured or when
        // expo-updates is not installed.
        await _configplugins().Updates.getRuntimeVersionAsync(this.projectRoot, {
            ...exp,
            runtimeVersion: exp.runtimeVersion ?? {
                policy: 'sdkVersion'
            }
        }, requestOptions.platform);
        if (!runtimeVersion) {
            throw new _errors.CommandError('MANIFEST_MIDDLEWARE', `Unable to determine runtime version for platform '${requestOptions.platform}'`);
        }
        const codeSigningInfo = await (0, _codesigning.getCodeSigningInfoAsync)(exp, requestOptions.expectSignature, this.options.privateKeyPath);
        const easProjectId = (_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_eas = _exp_extra.eas) == null ? void 0 : _exp_extra_eas.projectId;
        const scopeKey = await ExpoGoManifestHandlerMiddleware.getScopeKeyAsync({
            slug: exp.slug,
            codeSigningInfo
        });
        const expoUpdatesManifest = {
            id: _crypto().default.randomUUID(),
            createdAt: new Date().toISOString(),
            runtimeVersion,
            launchAsset: {
                key: 'bundle',
                contentType: 'application/javascript',
                url: bundleUrl
            },
            assets: [],
            metadata: {},
            extra: {
                eas: {
                    projectId: easProjectId ?? undefined
                },
                expoClient: {
                    ...exp,
                    hostUri
                },
                expoGo: expoGoConfig,
                scopeKey
            }
        };
        const stringifiedManifest = JSON.stringify(expoUpdatesManifest);
        let manifestPartHeaders = null;
        let certificateChainBody = null;
        if (codeSigningInfo) {
            const signature = (0, _codesigning.signManifestString)(stringifiedManifest, codeSigningInfo);
            manifestPartHeaders = {
                'expo-signature': (0, _structuredheaders().serializeDictionary)(convertToDictionaryItemsRepresentation({
                    keyid: codeSigningInfo.keyId,
                    sig: signature,
                    alg: 'rsa-v1_5-sha256'
                }))
            };
            certificateChainBody = codeSigningInfo.certificateChainForResponse.join('\n');
        }
        const headers = this.getDefaultResponseHeaders();
        switch(requestOptions.responseContentType){
            case 3:
                {
                    const encoded = await this.encodeFormDataAsync({
                        stringifiedManifest,
                        manifestPartHeaders,
                        certificateChainBody
                    });
                    headers.set('content-type', `multipart/mixed; boundary=${encoded.boundary}`);
                    return {
                        body: encoded.body,
                        version: runtimeVersion,
                        headers
                    };
                }
            case 2:
            case 1:
            case 0:
                {
                    headers.set('content-type', ExpoGoManifestHandlerMiddleware.getContentTypeForResponseContentType(requestOptions.responseContentType));
                    if (manifestPartHeaders) {
                        Object.entries(manifestPartHeaders).forEach(([key, value])=>{
                            headers.set(key, value);
                        });
                    }
                    return {
                        body: stringifiedManifest,
                        version: runtimeVersion,
                        headers
                    };
                }
        }
    }
    static getContentTypeForResponseContentType(responseContentType) {
        switch(responseContentType){
            case 3:
                return 'multipart/mixed';
            case 2:
                return 'application/expo+json';
            case 1:
                return 'application/json';
            case 0:
                return 'text/plain';
        }
    }
    encodeFormDataAsync({ stringifiedManifest, manifestPartHeaders, certificateChainBody }) {
        const fields = [
            {
                name: 'manifest',
                value: stringifiedManifest,
                contentType: 'application/json',
                partHeaders: manifestPartHeaders
            }
        ];
        if (certificateChainBody && certificateChainBody.length > 0) {
            fields.push({
                name: 'certificate_chain',
                value: certificateChainBody,
                contentType: 'application/x-pem-file'
            });
        }
        return (0, _multipartMixed.encodeMultipartMixed)(fields);
    }
    static async getScopeKeyAsync({ slug, codeSigningInfo }) {
        const scopeKeyFromCodeSigningInfo = codeSigningInfo == null ? void 0 : codeSigningInfo.scopeKey;
        if (scopeKeyFromCodeSigningInfo) {
            return scopeKeyFromCodeSigningInfo;
        }
        // Log.warn(
        //   env.EXPO_OFFLINE
        //     ? 'Using anonymous scope key in manifest for offline mode.'
        //     : 'Using anonymous scope key in manifest.'
        // );
        return await getAnonymousScopeKeyAsync(slug);
    }
}
async function getAnonymousScopeKeyAsync(slug) {
    const userAnonymousIdentifier = await (0, _UserSettings.getAnonymousIdAsync)();
    return `@${_user.ANONYMOUS_USERNAME}/${slug}-${userAnonymousIdentifier}`;
}
function convertToDictionaryItemsRepresentation(obj) {
    return new Map(Object.entries(obj).map(([k, v])=>{
        return [
            k,
            [
                v,
                new Map()
            ]
        ];
    }));
}

//# sourceMappingURL=ExpoGoManifestHandlerMiddleware.js.map