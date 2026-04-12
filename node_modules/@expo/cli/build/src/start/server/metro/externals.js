/**
 * Copyright © 2023 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
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
    NODE_STDLIB_MODULES: function() {
        return NODE_STDLIB_MODULES;
    },
    isNodeExternal: function() {
        return isNodeExternal;
    },
    shouldCreateVirtualCanary: function() {
        return shouldCreateVirtualCanary;
    },
    shouldCreateVirtualShim: function() {
        return shouldCreateVirtualShim;
    }
});
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _module() {
    const data = require("module");
    _module = function() {
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const NODE_STDLIB_MODULES = [
    // Add all nested imports...
    'assert/strict',
    'dns/promises',
    'inspector/promises',
    'fs/promises',
    'stream/web',
    'stream/promises',
    'path/posix',
    'path/win32',
    'readline/promises',
    'stream/consumers',
    'timers/promises',
    'util/types',
    'sqlite',
    // Collect all builtin modules...
    ...(_module().builtinModules || // @ts-expect-error
    (process.binding ? Object.keys(process.binding('natives')) : []) || []).filter((x)=>!/^(internal|v8|node-inspect)\/|\//.test(x) && ![
            'sys'
        ].includes(x))
].sort();
const shimsFolder = _path().default.join(require.resolve('@expo/cli/package.json'), '../static/shims');
const canaryFolder = _path().default.join(require.resolve('@expo/cli/package.json'), '../static/canary');
function shouldCreateVirtualShim(normalName) {
    const shimPath = _path().default.join(shimsFolder, normalName);
    if (_fs().default.existsSync(shimPath)) {
        return shimPath;
    }
    return null;
}
function shouldCreateVirtualCanary(normalName) {
    const canaryPath = _path().default.join(canaryFolder, normalName);
    if (_fs().default.existsSync(canaryPath)) {
        return canaryPath;
    }
    return null;
}
function isNodeExternal(moduleName) {
    const moduleId = moduleName.replace(/^node:/, '');
    if (NODE_STDLIB_MODULES.includes(moduleId)) {
        return moduleId;
    }
    return null;
}

//# sourceMappingURL=externals.js.map