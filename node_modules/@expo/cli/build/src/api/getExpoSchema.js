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
    _getSchemaAsync: function() {
        return _getSchemaAsync;
    },
    getAssetSchemasAsync: function() {
        return getAssetSchemasAsync;
    }
});
function _schemautils() {
    const data = require("@expo/schema-utils");
    _schemautils = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
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
const _client = require("./rest/client");
const _env = require("../utils/env");
const _errors = require("../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const schemaJson = {};
async function _getSchemaAsync(sdkVersion) {
    const json = await getSchemaJSONAsync(sdkVersion);
    return (0, _schemautils().derefSchema)(json.schema);
}
async function getAssetSchemasAsync(sdkVersion = 'UNVERSIONED') {
    // If no SDK version is available then fall back to unversioned
    const schema = await _getSchemaAsync(sdkVersion);
    const assetSchemas = [];
    const visit = (node, fieldPath)=>{
        if (node.meta && node.meta.asset) {
            assetSchemas.push(fieldPath);
        }
        const properties = node.properties;
        if (properties) {
            Object.keys(properties).forEach((property)=>visit(properties[property], `${fieldPath}${fieldPath.length > 0 ? '.' : ''}${property}`));
        }
    };
    visit(schema, '');
    return assetSchemas;
}
async function getSchemaJSONAsync(sdkVersion) {
    if (_env.env.EXPO_UNIVERSE_DIR) {
        return JSON.parse(_fs().default.readFileSync(_path().default.join(_env.env.EXPO_UNIVERSE_DIR, 'server', 'www', 'xdl-schemas', 'UNVERSIONED-schema.json')).toString());
    }
    if (!schemaJson[sdkVersion]) {
        try {
            schemaJson[sdkVersion] = await getConfigurationSchemaAsync(sdkVersion);
        } catch (e) {
            if (e.code === 'INVALID_JSON') {
                throw new _errors.CommandError('INVALID_JSON', `Couldn't read schema from server`);
            }
            throw e;
        }
    }
    return schemaJson[sdkVersion];
}
async function getConfigurationSchemaAsync(sdkVersion) {
    // Reconstruct the cached fetch since caching could be disabled.
    const fetchAsync = (0, _client.createCachedFetch)({
        cacheDirectory: 'schema-cache',
        // We'll use a 1 week cache for versions so older versions get flushed out eventually.
        ttl: 1000 * 60 * 60 * 24 * 7
    });
    const response = await fetchAsync(`project/configuration/schema/${sdkVersion}`);
    const json = await response.json();
    return (0, _client.getResponseDataOrThrow)(json);
}

//# sourceMappingURL=getExpoSchema.js.map