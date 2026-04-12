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
    hasExpoCanaryAsync: function() {
        return hasExpoCanaryAsync;
    },
    resolveAllPackageVersionsAsync: function() {
        return resolveAllPackageVersionsAsync;
    },
    resolvePackageVersionAsync: function() {
        return resolvePackageVersionAsync;
    }
});
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
function _semver() {
    const data = /*#__PURE__*/ _interop_require_default(require("semver"));
    _semver = function() {
        return data;
    };
    return data;
}
const _errors = require("../../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function resolvePackageVersionAsync(projectRoot, packageName) {
    let packageJsonPath;
    try {
        packageJsonPath = (0, _resolvefrom().default)(projectRoot, `${packageName}/package.json`);
    } catch (error) {
        // This is a workaround for packages using `exports`. If this doesn't
        // include `package.json`, we have to use the error message to get the location.
        if (error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
            var _error_message_match;
            packageJsonPath = (_error_message_match = error.message.match(/("exports"|defined) in (.*)$/i)) == null ? void 0 : _error_message_match[2];
        }
    }
    if (!packageJsonPath) {
        throw new _errors.CommandError('PACKAGE_NOT_FOUND', `"${packageName}" is added as a dependency in your project's package.json but it doesn't seem to be installed. Run "npm install", or the equivalent for your package manager, and try again.`);
    }
    const packageJson = await _jsonfile().default.readAsync(packageJsonPath);
    return packageJson.version;
}
async function resolveAllPackageVersionsAsync(projectRoot, packages) {
    const resolvedPackages = await Promise.all(packages.map(async (packageName)=>[
            packageName,
            await resolvePackageVersionAsync(projectRoot, packageName)
        ]));
    return Object.fromEntries(resolvedPackages);
}
async function hasExpoCanaryAsync(projectRoot) {
    let expoVersion = '';
    try {
        // Resolve installed `expo` version first
        expoVersion = await resolvePackageVersionAsync(projectRoot, 'expo');
    } catch (error) {
        var _packageJson_dependencies;
        if (error.code !== 'PACKAGE_NOT_FOUND') {
            throw error;
        }
        // Resolve through project `package.json`
        const packageJson = await _jsonfile().default.readAsync((0, _resolvefrom().default)(projectRoot, './package.json'));
        expoVersion = ((_packageJson_dependencies = packageJson.dependencies) == null ? void 0 : _packageJson_dependencies.expo) ?? '';
    }
    if (expoVersion === 'canary') {
        return true;
    }
    const prerelease = _semver().default.prerelease(expoVersion) || [];
    return !!prerelease.some((segment)=>typeof segment === 'string' && segment.includes('canary'));
}

//# sourceMappingURL=resolvePackages.js.map