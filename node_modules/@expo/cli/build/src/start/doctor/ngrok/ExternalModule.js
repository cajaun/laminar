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
    ExternalModule: function() {
        return ExternalModule;
    },
    ExternalModuleVersionError: function() {
        return ExternalModuleVersionError;
    }
});
function _packagemanager() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/package-manager"));
    _packagemanager = function() {
        return data;
    };
    return data;
}
function _requireg() {
    const data = /*#__PURE__*/ _interop_require_default(require("requireg"));
    _requireg = function() {
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
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _delay = require("../../../utils/delay");
const _env = require("../../../utils/env");
const _errors = require("../../../utils/errors");
const _prompts = require("../../../utils/prompts");
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
const debug = require('debug')('expo:doctor:externalModule');
class ExternalModuleVersionError extends _errors.CommandError {
    constructor(message, shouldGloballyInstall){
        super('EXTERNAL_MODULE_VERSION', message), this.shouldGloballyInstall = shouldGloballyInstall;
    }
}
class ExternalModule {
    constructor(/** Project root for checking if the package is installed locally. */ projectRoot, /** Info on the external package. */ pkg, /** A function used to create the installation prompt message. */ promptMessage){
        this.projectRoot = projectRoot;
        this.pkg = pkg;
        this.promptMessage = promptMessage;
        this.instance = null;
    }
    /** Resolve the globally or locally installed instance, or prompt to install. */ async resolveAsync({ prefersGlobalInstall, ...options } = {}) {
        try {
            return this.getVersioned() ?? this.installAsync({
                ...options,
                shouldGloballyInstall: prefersGlobalInstall
            });
        } catch (error) {
            if (error instanceof ExternalModuleVersionError) {
                // If the module version in not compliant with the version range,
                // we should prompt the user to install the package where it already exists.
                return this.installAsync({
                    ...options,
                    shouldGloballyInstall: error.shouldGloballyInstall ?? prefersGlobalInstall
                });
            }
            throw error;
        }
    }
    /** Prompt the user to install the package and try again. */ async installAsync({ shouldPrompt = true, autoInstall, shouldGloballyInstall } = {}) {
        const packageName = [
            this.pkg.name,
            this.pkg.versionRange
        ].join('@');
        if (!autoInstall) {
            // Delay the prompt so it doesn't conflict with other dev tool logs
            await (0, _delay.delayAsync)(100);
        }
        const answer = autoInstall || shouldPrompt && await (0, _prompts.confirmAsync)({
            message: this.promptMessage(packageName),
            initial: true
        });
        if (answer) {
            _log.log(`Installing ${packageName}...`);
            // Always use npm for global installs
            const packageManager = shouldGloballyInstall ? new (_packagemanager()).NpmPackageManager({
                cwd: this.projectRoot,
                log: _log.log,
                silent: !(_env.env.EXPO_DEBUG || _env.env.CI)
            }) : _packagemanager().createForProject(this.projectRoot, {
                silent: !(_env.env.EXPO_DEBUG || _env.env.CI)
            });
            try {
                if (shouldGloballyInstall) {
                    await packageManager.addGlobalAsync([
                        packageName
                    ]);
                } else {
                    await packageManager.addDevAsync([
                        packageName
                    ]);
                }
                _log.log(`Installed ${packageName}`);
            } catch (error) {
                error.message = `Failed to install ${packageName} ${shouldGloballyInstall ? 'globally' : 'locally'}: ${error.message}`;
                throw error;
            }
            return await this.resolveAsync({
                shouldPrompt: false
            });
        }
        throw new _errors.CommandError('EXTERNAL_MODULE_AVAILABILITY', `Install ${packageName} and try again`);
    }
    /** Get the module. */ get() {
        try {
            return this.getVersioned();
        } catch  {
            return null;
        }
    }
    /** Get the module, throws if the module is not versioned correctly. */ getVersioned() {
        this.instance ??= this._resolveModule(true) ?? this._resolveModule(false);
        return this.instance;
    }
    /** Exposed for testing. */ _require(moduleId) {
        return require(moduleId);
    }
    /** Resolve a copy that's installed in the project. Exposed for testing. */ _resolveLocal(moduleId) {
        return (0, _resolvefrom().default)(this.projectRoot, moduleId);
    }
    /** Resolve a copy that's installed globally. Exposed for testing. */ _resolveGlobal(moduleId) {
        return _requireg().default.resolve(moduleId);
    }
    /** Resolve the module and verify the version. Exposed for testing. */ _resolveModule(isLocal) {
        const resolver = isLocal ? this._resolveLocal.bind(this) : this._resolveGlobal.bind(this);
        try {
            const packageJsonPath = resolver(`${this.pkg.name}/package.json`);
            const packageJson = this._require(packageJsonPath);
            if (packageJson) {
                if (_semver().default.satisfies(packageJson.version, this.pkg.versionRange)) {
                    const modulePath = resolver(this.pkg.name);
                    const requiredModule = this._require(modulePath);
                    if (requiredModule == null) {
                        throw new _errors.CommandError('EXTERNAL_MODULE_EXPORT', `${this.pkg.name} exports a nullish value, which is not allowed.`);
                    }
                    return requiredModule;
                }
                throw new ExternalModuleVersionError(`Required module '${this.pkg.name}@${packageJson.version}' does not satisfy ${this.pkg.versionRange}. Installed at: ${packageJsonPath}`, !isLocal);
            }
        } catch (error) {
            if (error instanceof _errors.CommandError) {
                throw error;
            } else if (error.code !== 'MODULE_NOT_FOUND') {
                debug('Failed to resolve module', error.message);
            }
        }
        return null;
    }
}

//# sourceMappingURL=ExternalModule.js.map