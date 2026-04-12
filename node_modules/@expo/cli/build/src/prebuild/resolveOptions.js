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
    assertPlatforms: function() {
        return assertPlatforms;
    },
    ensureValidPlatforms: function() {
        return ensureValidPlatforms;
    },
    resolvePackageManagerOptions: function() {
        return resolvePackageManagerOptions;
    },
    resolvePlatformOption: function() {
        return resolvePlatformOption;
    },
    resolveSkipDependencyUpdate: function() {
        return resolveSkipDependencyUpdate;
    },
    resolveTemplateOption: function() {
        return resolveTemplateOption;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
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
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
const _errors = require("../utils/errors");
const _url = require("../utils/url");
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
const debug = require('debug')('expo:prebuild:resolveOptions');
function resolvePackageManagerOptions(args) {
    const managers = {
        npm: args['--npm'],
        yarn: args['--yarn'],
        pnpm: args['--pnpm'],
        bun: args['--bun']
    };
    if ([
        managers.npm,
        managers.pnpm,
        managers.yarn,
        managers.bun,
        !!args['--no-install']
    ].filter(Boolean).length > 1) {
        throw new _errors.CommandError('BAD_ARGS', 'Specify at most one of: --no-install, --npm, --pnpm, --yarn, --bun');
    }
    return managers;
}
function resolveTemplateOption(template) {
    (0, _assert().default)(template, 'template is required');
    if (// Expands github shorthand (owner/repo) to full URLs
    template.includes('/') && !(template.startsWith('@') || // Scoped package
    template.startsWith('.') || // Relative path
    template.startsWith(_path().default.sep) || // Absolute path
    // Contains a protocol
    /^[a-z][-a-z0-9\\.\\+]*:/.test(template))) {
        template = `https://github.com/${template}`;
    }
    if (template.startsWith('https://') || template.startsWith('http://')) {
        if (!(0, _url.validateUrl)(template)) {
            throw new _errors.CommandError('BAD_ARGS', 'Invalid URL provided as a template');
        }
        debug('Resolved template to repository path:', template);
        return {
            type: 'repository',
            uri: template
        };
    }
    if (// Supports `file:./path/to/template.tgz`
    template.startsWith('file:') || // Supports `../path/to/template.tgz`
    template.startsWith('.') || // Supports `\\path\\to\\template.tgz`
    template.startsWith(_path().default.sep)) {
        let resolvedUri = template;
        if (resolvedUri.startsWith('file:')) {
            resolvedUri = resolvedUri.substring(5);
        }
        const templatePath = _path().default.resolve(resolvedUri);
        (0, _assert().default)(_fs().default.existsSync(templatePath), 'template file does not exist: ' + templatePath);
        (0, _assert().default)(_fs().default.statSync(templatePath).isFile(), 'template must be a tar file created by running `npm pack` in a project: ' + templatePath);
        debug(`Resolved template to file path:`, templatePath);
        return {
            type: 'file',
            uri: templatePath
        };
    }
    if (_fs().default.existsSync(template)) {
        // Backward compatible with the old local template argument, e.g. `--template dir/template.tgz`
        const templatePath = _path().default.resolve(template);
        debug(`Resolved template to file path:`, templatePath);
        return {
            type: 'file',
            uri: templatePath
        };
    }
    debug(`Resolved template to NPM package:`, template);
    return {
        type: 'npm',
        uri: template
    };
}
function resolveSkipDependencyUpdate(value) {
    if (!value || typeof value !== 'string') {
        return [];
    }
    return value.split(',');
}
function resolvePlatformOption(platform = 'all', { loose } = {}) {
    switch(platform){
        case 'ios':
            return [
                'ios'
            ];
        case 'android':
            return [
                'android'
            ];
        case 'all':
            return loose || process.platform !== 'win32' ? [
                'android',
                'ios'
            ] : [
                'android'
            ];
        default:
            return [
                platform
            ];
    }
}
function ensureValidPlatforms(platforms) {
    // Skip prebuild for iOS on Windows
    if (process.platform === 'win32' && platforms.includes('ios')) {
        _log.warn((0, _chalk().default)`⚠️  Skipping generating the iOS native project files. Run {bold npx expo prebuild} again from macOS or Linux to generate the iOS project.\n`);
        return platforms.filter((platform)=>platform !== 'ios');
    }
    return platforms;
}
function assertPlatforms(platforms) {
    if (!(platforms == null ? void 0 : platforms.length)) {
        throw new _errors.CommandError('At least one platform must be enabled when syncing');
    }
}

//# sourceMappingURL=resolveOptions.js.map