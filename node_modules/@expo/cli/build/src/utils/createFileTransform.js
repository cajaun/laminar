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
    createEntryResolver: function() {
        return createEntryResolver;
    },
    createGlobFilter: function() {
        return createGlobFilter;
    }
});
function _configplugins() {
    const data = require("@expo/config-plugins");
    _configplugins = function() {
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
function _picomatch() {
    const data = /*#__PURE__*/ _interop_require_default(require("picomatch"));
    _picomatch = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:file-transform');
function createEntryResolver(name) {
    return (entry)=>{
        if (name) {
            // Rewrite paths for bare workflow
            entry.path = entry.path.replace(/HelloWorld/g, entry.path.includes('android') ? _configplugins().IOSConfig.XcodeUtils.sanitizedName(name.toLowerCase()) : _configplugins().IOSConfig.XcodeUtils.sanitizedName(name)).replace(/helloworld/g, _configplugins().IOSConfig.XcodeUtils.sanitizedName(name).toLowerCase());
        }
        if (entry.type && /^file$/i.test(entry.type) && _path().default.basename(entry.path) === 'gitignore') {
            // Rename `gitignore` because npm ignores files named `.gitignore` when publishing.
            // See: https://github.com/npm/npm/issues/1862
            entry.path = entry.path.replace(/gitignore$/, '.gitignore');
        }
    };
}
function createGlobFilter(globPattern, options) {
    const matcher = (0, _picomatch().default)(globPattern, options);
    debug('filter: created for pattern(s) "%s" (%s)', Array.isArray(globPattern) ? globPattern.join('", "') : globPattern, options);
    return (path)=>{
        const included = matcher(path);
        debug('filter: %s - %s', included ? 'include' : 'exclude', path);
        return included;
    };
}

//# sourceMappingURL=createFileTransform.js.map