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
    FailedToResolvePathError: function() {
        return FailedToResolvePathError;
    },
    createFastResolver: function() {
        return createFastResolver;
    }
});
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
const _createJResolver = /*#__PURE__*/ _interop_require_default(require("./createJResolver"));
const _externals = require("./externals");
const _formatFileCandidates = require("./formatFileCandidates");
const _metroOptions = require("../middleware/metroOptions");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class FailedToResolvePathError extends Error {
    constructor(...args){
        super(...args), // Added to ensure the error is matched by our tooling.
        // TODO: Test that this matches `isFailedToResolvePathError`
        this.candidates = {};
    }
}
class ShimModuleError extends Error {
}
const debug = require('debug')('expo:metro:resolve');
const realpathFS = process.platform !== 'win32' && _fs().default.realpathSync && typeof _fs().default.realpathSync.native === 'function' ? _fs().default.realpathSync.native : _fs().default.realpathSync;
function realpathSync(x) {
    try {
        return realpathFS(x);
    } catch (realpathErr) {
        if (realpathErr.code !== 'ENOENT') {
            throw realpathErr;
        }
    }
    return x;
}
function createFastResolver({ preserveSymlinks, blockList }) {
    debug('Creating with settings:', {
        preserveSymlinks,
        blockList
    });
    const cachedExtensions = new Map();
    function getAdjustedExtensions({ metroSourceExtensions, platform, isNative }) {
        const key = JSON.stringify({
            metroSourceExtensions,
            platform,
            isNative
        });
        if (cachedExtensions.has(key)) {
            return cachedExtensions.get(key);
        }
        let output = metroSourceExtensions;
        if (platform) {
            const nextOutput = [];
            output.forEach((ext)=>{
                nextOutput.push(`${platform}.${ext}`);
                if (isNative) {
                    nextOutput.push(`native.${ext}`);
                }
                nextOutput.push(ext);
            });
            output = nextOutput;
        }
        output = Array.from(new Set(output));
        // resolve expects these to start with a dot.
        output = output.map((ext)=>`.${ext}`);
        cachedExtensions.set(key, output);
        return output;
    }
    function fastResolve(context, moduleName, platform) {
        var _context_customResolverOptions;
        const environment = (_context_customResolverOptions = context.customResolverOptions) == null ? void 0 : _context_customResolverOptions.environment;
        const isServer = (0, _metroOptions.isServerEnvironment)(environment);
        const extensions = getAdjustedExtensions({
            metroSourceExtensions: context.sourceExts,
            platform,
            isNative: context.preferNativePlatform
        });
        let fp;
        const conditions = context.unstable_enablePackageExports ? [
            ...new Set([
                'default',
                context.isESMImport === true ? 'import' : 'require',
                ...context.unstable_conditionNames,
                ...platform != null ? context.unstable_conditionsByPlatform[platform] ?? [] : []
            ])
        ] : [];
        // NOTE(cedric): metro@0.81.0 ships with `fileSystemLookup`, while `metro@0.80.12` ships as unstable
        const fileSystemLookup = 'unstable_fileSystemLookup' in context ? context.unstable_fileSystemLookup : context.fileSystemLookup;
        if (!fileSystemLookup) {
            throw new Error('Metro API fileSystemLookup is required for fast resolver');
        }
        try {
            fp = (0, _createJResolver.default)(moduleName, {
                blockList,
                enablePackageExports: context.unstable_enablePackageExports,
                basedir: _path().default.dirname(context.originModulePath),
                paths: context.nodeModulesPaths.length ? context.nodeModulesPaths : undefined,
                extensions,
                conditions,
                realpathSync (file) {
                    let metroRealPath = null;
                    const res = fileSystemLookup(file);
                    if (res == null ? void 0 : res.exists) {
                        metroRealPath = res.realPath;
                    }
                    if (metroRealPath == null && preserveSymlinks) {
                        return realpathSync(file);
                    }
                    return metroRealPath ?? file;
                },
                isDirectory (file) {
                    const res = fileSystemLookup(file);
                    return res.exists && res.type === 'd';
                },
                isFile (file) {
                    const res = fileSystemLookup(file);
                    return res.exists && res.type === 'f';
                },
                pathExists (file) {
                    return fileSystemLookup(file).exists;
                },
                packageFilter (pkg) {
                    // set the pkg.main to the first available field in context.mainFields
                    for (const field of context.mainFields){
                        if (pkg[field] && // object-inspect uses browser: {} in package.json
                        typeof pkg[field] === 'string') {
                            return {
                                ...pkg,
                                main: pkg[field]
                            };
                        }
                    }
                    return pkg;
                },
                // Used to ensure files trace to packages instead of node_modules in expo/expo. This is how Metro works and
                // the app doesn't finish without it.
                preserveSymlinks,
                readPackageSync (readFileSync, pkgFile) {
                    return context.getPackage(pkgFile) ?? JSON.parse(_fs().default.readFileSync(pkgFile, 'utf8'));
                },
                includeCoreModules: isServer,
                pathFilter: // Disable `browser` field for server environments.
                isServer ? undefined : (pkg, _resolvedPath, relativePathIn)=>{
                    let relativePath = relativePathIn;
                    if (relativePath[0] !== '.') {
                        relativePath = `./${relativePath}`;
                    }
                    const replacements = pkg.browser;
                    if (replacements === undefined) {
                        return '';
                    }
                    // TODO: Probably use a better extension matching system here.
                    // This was added for `uuid/v4` -> `./lib/rng` -> `./lib/rng-browser.js`
                    const mappedPath = replacements[relativePath] ?? replacements[relativePath + '.js'];
                    if (mappedPath === false) {
                        throw new ShimModuleError();
                    }
                    return mappedPath;
                }
            });
        } catch (error) {
            if (error instanceof ShimModuleError) {
                return {
                    type: 'empty'
                };
            }
            if ('code' in error && error.code === 'MODULE_NOT_FOUND') {
                if ((0, _externals.isNodeExternal)(moduleName)) {
                    // In this case, mock the file to use an empty module.
                    return {
                        type: 'empty'
                    };
                }
                debug({
                    moduleName,
                    platform,
                    conditions,
                    isServer,
                    preserveSymlinks
                }, context);
                throw new FailedToResolvePathError('The module could not be resolved because no file or module matched the pattern:\n' + `  ${(0, _formatFileCandidates.formatFileCandidates)({
                    type: 'sourceFile',
                    filePathPrefix: moduleName,
                    candidateExts: extensions
                }, true)}\n\nFrom:\n  ${context.originModulePath}\n`);
            }
            throw error;
        }
        if (context.sourceExts.some((ext)=>fp.endsWith(ext))) {
            return {
                type: 'sourceFile',
                filePath: fp
            };
        }
        if ((0, _externals.isNodeExternal)(fp)) {
            if (isServer) {
                return {
                    type: 'sourceFile',
                    filePath: fp
                };
            }
            // NOTE: This shouldn't happen, the module should throw.
            // Mock non-server built-in modules to empty.
            return {
                type: 'empty'
            };
        }
        // NOTE: platform extensions may not be supported on assets.
        if (platform === 'web') {
            // Skip multi-resolution on web/server bundles. Only consideration here is that
            // we may still need it in case the only image is a multi-resolution image.
            return {
                type: 'assetFiles',
                filePaths: [
                    fp
                ]
            };
        }
        const dirPath = _path().default.dirname(fp);
        const extension = _path().default.extname(fp);
        const basename = _path().default.basename(fp, extension);
        return {
            type: 'assetFiles',
            // Support multi-resolution asset extensions...
            filePaths: context.resolveAsset(dirPath, basename, extension) ?? [
                fp
            ]
        };
    }
    return fastResolve;
}

//# sourceMappingURL=createExpoMetroResolver.js.map