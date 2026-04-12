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
    getAssetFieldPathsForManifestAsync: function() {
        return getAssetFieldPathsForManifestAsync;
    },
    resolveGoogleServicesFile: function() {
        return resolveGoogleServicesFile;
    },
    resolveManifestAssets: function() {
        return resolveManifestAssets;
    }
});
function _promises() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
    _promises = function() {
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
const _getExpoSchema = require("../../../api/getExpoSchema");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _dir = require("../../../utils/dir");
const _errors = require("../../../utils/errors");
const _obj = require("../../../utils/obj");
const _url = require("../../../utils/url");
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
async function resolveGoogleServicesFile(projectRoot, manifest) {
    var _manifest_android, _manifest_ios;
    if ((_manifest_android = manifest.android) == null ? void 0 : _manifest_android.googleServicesFile) {
        try {
            const contents = await _promises().default.readFile(_path().default.resolve(projectRoot, manifest.android.googleServicesFile), 'utf8');
            manifest.android.googleServicesFile = contents;
        } catch  {
            _log.warn(`Could not parse Expo config: android.googleServicesFile: "${manifest.android.googleServicesFile}"`);
            // Delete the field so Expo Go doesn't attempt to read it.
            delete manifest.android.googleServicesFile;
        }
    }
    if ((_manifest_ios = manifest.ios) == null ? void 0 : _manifest_ios.googleServicesFile) {
        try {
            const contents = await _promises().default.readFile(_path().default.resolve(projectRoot, manifest.ios.googleServicesFile), 'base64');
            manifest.ios.googleServicesFile = contents;
        } catch  {
            _log.warn(`Could not parse Expo config: ios.googleServicesFile: "${manifest.ios.googleServicesFile}"`);
            // Delete the field so Expo Go doesn't attempt to read it.
            delete manifest.ios.googleServicesFile;
        }
    }
    return manifest;
}
async function getAssetFieldPathsForManifestAsync(manifest) {
    // String array like ["icon", "notification.icon", "loading.icon", "loading.backgroundImage", "ios.icon", ...]
    const sdkAssetFieldPaths = await (0, _getExpoSchema.getAssetSchemasAsync)(manifest.sdkVersion);
    return sdkAssetFieldPaths.filter((assetSchema)=>(0, _obj.get)(manifest, assetSchema));
}
async function resolveManifestAssets(projectRoot, { manifest, resolver, strict }) {
    try {
        // Asset fields that the user has set like ["icon", "splash.image"]
        const assetSchemas = await getAssetFieldPathsForManifestAsync(manifest);
        // Get the URLs
        const urls = await Promise.all(assetSchemas.map(async (manifestField)=>{
            const pathOrURL = (0, _obj.get)(manifest, manifestField);
            // URL
            if ((0, _url.validateUrl)(pathOrURL, {
                requireProtocol: true
            })) {
                return pathOrURL;
            }
            // File path
            if (await (0, _dir.fileExistsAsync)(_path().default.resolve(projectRoot, pathOrURL))) {
                return await resolver(pathOrURL);
            }
            // Unknown
            const err = new _errors.CommandError('MANIFEST_ASSET', 'Could not resolve local asset: ' + pathOrURL);
            err.localAssetPath = pathOrURL;
            err.manifestField = manifestField;
            throw err;
        }));
        // Set the corresponding URL fields
        assetSchemas.forEach((manifestField, index)=>(0, _obj.set)(manifest, `${manifestField}Url`, urls[index]));
    } catch (error) {
        if (error.localAssetPath) {
            _log.warn(`Unable to resolve asset "${error.localAssetPath}" from "${error.manifestField}" in your app.json or app.config.js`);
        } else {
            _log.warn(`Warning: Unable to resolve manifest assets. Icons and fonts might not work. ${error.message}.`);
        }
        if (strict) {
            throw new _errors.CommandError('MANIFEST_ASSET', 'Failed to export manifest assets: ' + error.message);
        }
    }
}

//# sourceMappingURL=resolveAssets.js.map