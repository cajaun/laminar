/**
 * Copyright © 2023 650 Industries.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Fork of the jest resolver but with additional settings for Metro and pnp removed.
 * https://github.com/jestjs/jest/blob/d1a2ed7fea4bdc19836274cd810c8360e3ab62f3/packages/jest-resolve/src/defaultResolver.ts#L1
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = require("path");
    _path = function() {
        return data;
    };
    return data;
}
function _resolve() {
    const data = require("resolve");
    _resolve = function() {
        return data;
    };
    return data;
}
function _resolveexports() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("resolve.exports"));
    _resolveexports = function() {
        return data;
    };
    return data;
}
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
const defaultResolver = (path, { enablePackageExports, blockList = [], ...options })=>{
    // @ts-expect-error
    const resolveOptions = {
        ...options,
        preserveSymlinks: options.preserveSymlinks,
        defaultResolver
    };
    // resolveSync dereferences symlinks to ensure we don't create a separate
    // module instance depending on how it was referenced.
    const result = (0, _resolve().sync)(enablePackageExports ? getPathInModule(path, resolveOptions) : path, {
        ...resolveOptions,
        preserveSymlinks: !options.preserveSymlinks
    });
    return result;
};
const _default = defaultResolver;
/*
 * helper functions
 */ function getPathInModule(path, options) {
    if (shouldIgnoreRequestForExports(path)) {
        return path;
    }
    const segments = path.split('/');
    let moduleName = segments.shift();
    if (!moduleName) {
        return path;
    }
    if (moduleName.startsWith('@')) {
        moduleName = `${moduleName}/${segments.shift()}`;
    }
    // self-reference
    const closestPackageJson = findClosestPackageJson(options.basedir, options);
    if (closestPackageJson) {
        const pkg = options.readPackageSync(options.readFileSync, closestPackageJson);
        (0, _assert().default)(pkg, 'package.json should be read by `readPackageSync`');
        // Added support for the package.json "imports" field (#-prefixed paths)
        if (path.startsWith('#')) {
            const resolved = _resolveexports().imports(pkg, path, createResolveOptions(options.conditions));
            if (resolved) {
                // TODO: Should we attempt to resolve every path in the array?
                return (0, _path().resolve)((0, _path().dirname)(closestPackageJson), resolved[0]);
            }
            // NOTE: resolve.imports would have thrown by this point.
            return path;
        }
        if (pkg.name === moduleName) {
            const resolved = _resolveexports().exports(pkg, segments.join('/') || '.', createResolveOptions(options.conditions));
            if (resolved) {
                return (0, _path().resolve)((0, _path().dirname)(closestPackageJson), resolved[0]);
            }
            if (pkg.exports) {
                throw new Error("`exports` exists, but no results - this is a bug in Expo CLI's Metro resolver. Report an issue: https://github.com/expo/expo/issues");
            }
        }
    }
    let packageJsonPath = '';
    try {
        packageJsonPath = (0, _resolve().sync)(`${moduleName}/package.json`, options);
    } catch  {
    // ignore if package.json cannot be found
    }
    if (!packageJsonPath) {
        return path;
    }
    const pkg = options.readPackageSync(options.readFileSync, packageJsonPath);
    (0, _assert().default)(pkg, 'package.json should be read by `readPackageSync`');
    const resolved = _resolveexports().exports(pkg, segments.join('/') || '.', createResolveOptions(options.conditions));
    if (resolved) {
        return (0, _path().resolve)((0, _path().dirname)(packageJsonPath), resolved[0]);
    }
    if (pkg.exports) {
        throw new Error("`exports` exists, but no results - this is a bug in Expo CLI's Metro resolver. Report an issue: https://github.com/expo/expo/issues");
    }
    return path;
}
function createResolveOptions(conditions) {
    return conditions ? {
        conditions,
        unsafe: true
    } : {
        browser: false,
        require: true
    };
}
// if it's a relative import or an absolute path, imports/exports are ignored
const shouldIgnoreRequestForExports = (path)=>path.startsWith('.') || (0, _path().isAbsolute)(path);
// adapted from
// https://github.com/lukeed/escalade/blob/2477005062cdbd8407afc90d3f48f4930354252b/src/sync.js
function findClosestPackageJson(start, options) {
    let dir = (0, _path().resolve)('.', start);
    if (!options.isDirectory(dir)) {
        dir = (0, _path().dirname)(dir);
    }
    while(true){
        const pkgJsonFile = (0, _path().resolve)(dir, './package.json');
        const hasPackageJson = options.pathExists(pkgJsonFile);
        if (hasPackageJson) {
            return pkgJsonFile;
        }
        const prevDir = dir;
        dir = (0, _path().dirname)(dir);
        if (prevDir === dir) {
            return undefined;
        }
    }
}

//# sourceMappingURL=createJResolver.js.map