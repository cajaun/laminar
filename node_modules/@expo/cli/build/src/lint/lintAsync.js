"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "lintAsync", {
    enumerable: true,
    get: function() {
        return lintAsync;
    }
});
function _packagemanager() {
    const data = require("@expo/package-manager");
    _packagemanager = function() {
        return data;
    };
    return data;
}
function _nodefs() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:fs"));
    _nodefs = function() {
        return data;
    };
    return data;
}
function _nodepath() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:path"));
    _nodepath = function() {
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
const _ESlintPrerequisite = require("./ESlintPrerequisite");
const _errors = require("../utils/errors");
const _findUp = require("../utils/findUp");
const _nodeEnv = require("../utils/nodeEnv");
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
const debug = require('debug')('expo:lint');
const DEFAULT_INPUTS = [
    'src',
    'app',
    'components'
];
const lintAsync = async (inputs, options, eslintArguments = [])=>{
    (0, _nodeEnv.setNodeEnv)('development');
    // Locate the project root based on the process current working directory.
    // This enables users to run `npx expo install` from a subdirectory of the project.
    const projectRoot = (options == null ? void 0 : options.projectRoot) ?? (0, _findUp.findUpProjectRootOrAssert)(process.cwd());
    require('@expo/env').load(projectRoot);
    // TODO: Perhaps we should assert that TypeScript is required.
    const prerequisite = new _ESlintPrerequisite.ESLintProjectPrerequisite(projectRoot);
    if (!await prerequisite.assertAsync()) {
        await prerequisite.bootstrapAsync();
    }
    // TODO(@kitten): The direct require is fine, since we assume `expo > @expo/cli` does not depend on eslint
    // However, it'd be safer to replace this with resolve-from, or another way of requiring via the project root
    const { loadESLint } = require('eslint');
    const mod = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("eslint")));
    let ESLint;
    // loadESLint is >= 8.57.0 (https://github.com/eslint/eslint/releases/tag/v8.57.0) https://github.com/eslint/eslint/pull/18098
    if ('loadESLint' in mod) {
        ESLint = await loadESLint({
            cwd: options.projectRoot
        });
    } else {
        throw new _errors.CommandError('npx expo lint requires ESLint version 8.57.0 or greater. Upgrade eslint or use npx eslint directly.');
    }
    const version = ESLint == null ? void 0 : ESLint.version;
    if (!version || _semver().default.lt(version, '8.57.0')) {
        throw new _errors.CommandError('npx expo lint requires ESLint version 8.57.0 or greater. Upgrade eslint or use npx eslint directly.');
    }
    if (!inputs.length) {
        DEFAULT_INPUTS.map((input)=>{
            const abs = _nodepath().default.join(projectRoot, input);
            if (_nodefs().default.existsSync(abs)) {
                inputs.push(abs);
            }
        });
    }
    const eslintArgs = [];
    inputs.forEach((input)=>{
        eslintArgs.push(input);
    });
    options.ext.forEach((ext)=>{
        eslintArgs.push('--ext', ext);
    });
    eslintArgs.push(`--fix=${options.fix}`);
    eslintArgs.push(`--cache=${options.cache}`);
    if (options.config) {
        eslintArgs.push(`--config`, options.config);
    }
    if (!options.ignore) {
        eslintArgs.push('--no-ignore');
    }
    options.ignorePattern.forEach((pattern)=>{
        eslintArgs.push(`--ignore-pattern=${pattern}`);
    });
    eslintArgs.push(...options.fixType.map((type)=>`--fix-type=${type}`));
    if (options.quiet) {
        eslintArgs.push('--quiet');
    }
    if (options.maxWarnings != null && options.maxWarnings >= 0) {
        eslintArgs.push(`--max-warnings=${options.maxWarnings.toString()}`);
    }
    const cacheDir = _nodepath().default.join(projectRoot, '.expo', 'cache', 'eslint/');
    // Add other defaults
    eslintArgs.push(`--cache-location=${cacheDir}`);
    // Add passthrough arguments
    eslintArguments.forEach((arg)=>{
        eslintArgs.push(arg);
    });
    debug('Running ESLint with args: %O', eslintArgs);
    const manager = (0, _packagemanager().createForProject)(projectRoot, {
        silent: true
    });
    try {
        // TODO: Custom logger
        // - Use relative paths
        // - When react-hooks/exhaustive-deps is hit, notify about enabling React Compiler.
        // - Green check when no issues are found.
        await manager.runBinAsync([
            'eslint',
            ...eslintArgs
        ], {
            stdio: 'inherit'
        });
    } catch (error) {
        process.exit(error.status);
    }
};

//# sourceMappingURL=lintAsync.js.map