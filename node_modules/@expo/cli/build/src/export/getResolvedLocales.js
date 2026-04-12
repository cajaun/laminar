"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getResolvedLocalesAsync", {
    enumerable: true,
    get: function() {
        return getResolvedLocalesAsync;
    }
});
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
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
const _errors = require("../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function getResolvedLocalesAsync(projectRoot, exp) {
    if (!exp.locales) {
        return {};
    }
    const locales = {};
    for (const [lang, localeJsonPath] of Object.entries(exp.locales)){
        if (typeof localeJsonPath === 'string') {
            try {
                locales[lang] = await _jsonfile().default.readAsync(_path().default.join(projectRoot, localeJsonPath));
            } catch (error) {
                throw new _errors.CommandError('EXPO_CONFIG', JSON.stringify(error));
            }
        } else {
            // In the off chance that someone defined the locales json in the config, pass it directly to the object.
            // We do this to make the types more elegant.
            locales[lang] = localeJsonPath;
        }
    }
    return locales;
}

//# sourceMappingURL=getResolvedLocales.js.map