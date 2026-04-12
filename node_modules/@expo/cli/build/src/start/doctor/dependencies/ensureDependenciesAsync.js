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
    createInstallCommand: function() {
        return createInstallCommand;
    },
    ensureDependenciesAsync: function() {
        return ensureDependenciesAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
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
function _wrapansi() {
    const data = /*#__PURE__*/ _interop_require_default(require("wrap-ansi"));
    _wrapansi = function() {
        return data;
    };
    return data;
}
const _getMissingPackages = require("./getMissingPackages");
const _installAsync = require("../../../install/installAsync");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _errors = require("../../../utils/errors");
const _interactive = require("../../../utils/interactive");
const _ora = require("../../../utils/ora");
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
async function ensureDependenciesAsync(projectRoot, { exp = (0, _config().getConfig)(projectRoot).exp, requiredPackages, warningMessage, installMessage, // Don't prompt in CI
skipPrompt = !(0, _interactive.isInteractive)(), isProjectMutable = (0, _interactive.isInteractive)() }) {
    const { missing } = await (0, _getMissingPackages.getMissingPackagesAsync)(projectRoot, {
        sdkVersion: exp.sdkVersion,
        requiredPackages
    });
    if (!missing.length) {
        return true;
    }
    // Prompt to install or bail out...
    const readableMissingPackages = missing.map(({ pkg, version })=>version ? [
            pkg,
            version
        ].join('@') : pkg).join(', ');
    let title = installMessage;
    if (skipPrompt && !isProjectMutable) {
        title += '\n\n';
    } else {
        let confirm = skipPrompt;
        if (skipPrompt) {
            // Automatically install packages without prompting.
            _log.log(wrapForTerminal(title + ` Installing ${_chalk().default.cyan(readableMissingPackages)}`));
        } else {
            confirm = await (0, _prompts.confirmAsync)({
                message: wrapForTerminal(title + ` Would you like to install ${_chalk().default.cyan(readableMissingPackages)}?`),
                initial: true
            });
        }
        if (confirm) {
            // Format with version if available.
            const [packages, devPackages] = missing.reduce(([deps, devDeps], p)=>{
                const pkg = p.version ? [
                    p.pkg,
                    p.version
                ].join('@') : p.pkg;
                if (p.dev) {
                    return [
                        deps,
                        devDeps.concat(pkg)
                    ];
                }
                return [
                    deps.concat(pkg),
                    devDeps
                ];
            }, [
                [],
                []
            ]);
            if (packages.length) {
                await installPackagesAsync(projectRoot, {
                    packages
                });
            }
            if (devPackages.length) {
                await installPackagesAsync(projectRoot, {
                    packages: devPackages,
                    dev: true
                });
            }
            // Try again but skip prompting twice, simply fail if the packages didn't install correctly.
            return await ensureDependenciesAsync(projectRoot, {
                skipPrompt: true,
                installMessage,
                warningMessage,
                requiredPackages
            });
        }
        // Reset the title so it doesn't print twice in interactive mode.
        title = '';
    }
    const installCommand = 'npx expo install ' + missing.map(({ pkg })=>pkg).join(' ');
    const disableMessage = warningMessage;
    const solution = `Install ${_chalk().default.bold(readableMissingPackages)} by running:\n\n  ${_chalk().default.reset.bold(installCommand)}\n\n`;
    // This prevents users from starting a misconfigured JS or TS project by default.
    throw new _errors.CommandError(wrapForTerminal(title + solution + disableMessage + '\n'));
}
/**  Wrap long messages to fit smaller terminals. */ function wrapForTerminal(message) {
    return (0, _wrapansi().default)(message, process.stdout.columns || 80);
}
function createInstallCommand({ packages }) {
    return 'npx expo install ' + packages.map(({ pkg })=>pkg).join(' ');
}
/** Install packages in the project. */ async function installPackagesAsync(projectRoot, { packages, dev }) {
    const packagesStr = _chalk().default.bold(packages.join(', '));
    _log.log();
    const installingPackageStep = (0, _ora.logNewSection)(`Installing ${packagesStr}`);
    try {
        await (0, _installAsync.installAsync)(packages, {
            projectRoot,
            dev
        });
    } catch (e) {
        installingPackageStep.fail(`Failed to install ${packagesStr} with error: ${e.message}`);
        throw e;
    }
    installingPackageStep.succeed(`Installed ${packagesStr}`);
}

//# sourceMappingURL=ensureDependenciesAsync.js.map