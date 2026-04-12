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
    MetroTerminalReporter: function() {
        return MetroTerminalReporter;
    },
    extractCodeFrame: function() {
        return extractCodeFrame;
    },
    formatUsingNodeStandardLibraryError: function() {
        return formatUsingNodeStandardLibraryError;
    },
    isNodeStdLibraryModule: function() {
        return isNodeStdLibraryModule;
    },
    stripMetroInfo: function() {
        return stripMetroInfo;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
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
function _util() {
    const data = require("util");
    _util = function() {
        return data;
    };
    return data;
}
const _TerminalReporter = require("./TerminalReporter");
const _externals = require("./externals");
const _env = require("../../../utils/env");
const _link = require("../../../utils/link");
const _serverLogLikeMetro = require("../serverLogLikeMetro");
const _metroErrorInterface = require("./metroErrorInterface");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:metro:logger');
const MAX_PROGRESS_BAR_CHAR_WIDTH = 16;
const DARK_BLOCK_CHAR = '\u2593';
const LIGHT_BLOCK_CHAR = '\u2591';
class MetroTerminalReporter extends _TerminalReporter.TerminalReporter {
    constructor(projectRoot, terminal){
        super(terminal), this.projectRoot = projectRoot;
    }
    _log(event) {
        switch(event.type){
            case 'unstable_server_log':
                var _event_data;
                if (typeof ((_event_data = event.data) == null ? void 0 : _event_data[0]) === 'string') {
                    const message = event.data[0];
                    if (message.match(/JavaScript logs have moved/)) {
                        // Hide this very loud message from upstream React Native in favor of the note in the terminal UI:
                        // The "› Press j │ open debugger"
                        // logger?.info(
                        //   '\u001B[1m\u001B[7m💡 JavaScript logs have moved!\u001B[22m They can now be ' +
                        //     'viewed in React Native DevTools. Tip: Type \u001B[1mj\u001B[22m in ' +
                        //     'the terminal to open (requires Google Chrome or Microsoft Edge).' +
                        //     '\u001B[27m',
                        // );
                        return;
                    }
                    if (!_env.env.EXPO_DEBUG) {
                        // In the context of developing an iOS app or website, the MetroInspectorProxy "connection" logs are very confusing.
                        // Here we'll hide them behind EXPO_DEBUG or DEBUG=expo:*. In the future we can reformat them to clearly indicate that the "Connection" is regarding the debugger.
                        // These logs are also confusing because they can say "connection established" even when the debugger is not in a usable state. Really they belong in a UI or behind some sort of debug logging.
                        if (message.match(/Connection (closed|established|failed|terminated)/i)) {
                            // Skip logging.
                            return;
                        }
                    }
                }
                break;
            case 'client_log':
                {
                    if (this.shouldFilterClientLog(event)) {
                        return;
                    }
                    const { level } = event;
                    if (!level) {
                        break;
                    }
                    if (level === 'warn' || level === 'error') {
                        let hasStack = false;
                        const parsed = event.data.map((msg)=>{
                            // Quick check to see if an unsymbolicated stack is being logged.
                            if (msg.includes('.bundle//&platform=')) {
                                const stack = (0, _serverLogLikeMetro.parseErrorStringToObject)(msg);
                                if (stack) {
                                    hasStack = true;
                                }
                                return stack;
                            }
                            return msg;
                        });
                        if (hasStack) {
                            (async ()=>{
                                const symbolicating = parsed.map((p)=>{
                                    if (typeof p === 'string') return p;
                                    return (0, _serverLogLikeMetro.maybeSymbolicateAndFormatJSErrorStackLogAsync)(this.projectRoot, level, p);
                                });
                                let usefulStackCount = 0;
                                const fallbackIndices = [];
                                const symbolicated = (await Promise.allSettled(symbolicating)).map((s, index)=>{
                                    if (s.status === 'rejected') {
                                        debug('Error formatting stack', parsed[index], s.reason);
                                        return parsed[index];
                                    } else if (typeof s.value === 'string') {
                                        return s.value;
                                    } else {
                                        if (!s.value.isFallback) {
                                            usefulStackCount++;
                                        } else {
                                            fallbackIndices.push(index);
                                        }
                                        return s.value.stack;
                                    }
                                });
                                // Using EXPO_DEBUG we can print all stack
                                const filtered = usefulStackCount && !_env.env.EXPO_DEBUG ? symbolicated.filter((_, index)=>!fallbackIndices.includes(index)) : symbolicated;
                                (0, _serverLogLikeMetro.logLikeMetro)(this.terminal.log.bind(this.terminal), level, null, ...filtered);
                            })();
                            return;
                        }
                    }
                    // Overwrite the Metro terminal logging so we can improve the warnings, symbolicate stacks, and inject extra info.
                    (0, _serverLogLikeMetro.logLikeMetro)(this.terminal.log.bind(this.terminal), level, null, ...event.data);
                    return;
                }
        }
        return super._log(event);
    }
    // Used for testing
    _getElapsedTime(startTime) {
        return process.hrtime.bigint() - startTime;
    }
    /**
   * Extends the bundle progress to include the current platform that we're bundling.
   *
   * @returns `iOS path/to/bundle.js ▓▓▓▓▓░░░░░░░░░░░ 36.6% (4790/7922)`
   */ _getBundleStatusMessage(progress, phase) {
        var _progress_bundleDetails_customTransformOptions, _progress_bundleDetails;
        const env = getEnvironmentForBuildDetails(progress.bundleDetails);
        const platform = env || getPlatformTagForBuildDetails(progress.bundleDetails);
        const inProgress = phase === 'in_progress';
        let localPath;
        if (typeof ((_progress_bundleDetails = progress.bundleDetails) == null ? void 0 : (_progress_bundleDetails_customTransformOptions = _progress_bundleDetails.customTransformOptions) == null ? void 0 : _progress_bundleDetails_customTransformOptions.dom) === 'string' && progress.bundleDetails.customTransformOptions.dom.includes(_path().default.sep)) {
            // Because we use a generated entry file for DOM components, we need to adjust the logging path so it
            // shows a unique path for each component.
            // Here, we take the relative import path and remove all the starting slashes.
            localPath = progress.bundleDetails.customTransformOptions.dom.replace(/^(\.?\.[\\/])+/, '');
        } else {
            const inputFile = progress.bundleDetails.entryFile;
            localPath = _path().default.isAbsolute(inputFile) ? _path().default.relative(this.projectRoot, inputFile) : inputFile;
        }
        if (!inProgress) {
            const status = phase === 'done' ? `Bundled ` : `Bundling failed `;
            const color = phase === 'done' ? _chalk().default.green : _chalk().default.red;
            const startTime = this._bundleTimers.get(progress.bundleDetails.buildID);
            let time = '';
            if (startTime != null) {
                const elapsed = this._getElapsedTime(startTime);
                const micro = Number(elapsed) / 1000;
                const converted = Number(elapsed) / 1e6;
                // If the milliseconds are < 0.5 then it will display as 0, so we display in microseconds.
                if (converted <= 0.5) {
                    const tenthFractionOfMicro = (micro * 10 / 1000).toFixed(0);
                    // Format as microseconds to nearest tenth
                    time = _chalk().default.cyan.bold(`0.${tenthFractionOfMicro}ms`);
                } else {
                    time = _chalk().default.dim(converted.toFixed(0) + 'ms');
                }
            }
            // iOS Bundled 150ms
            const plural = progress.totalFileCount === 1 ? '' : 's';
            return color(platform + status) + time + _chalk().default.reset.dim(` ${localPath} (${progress.totalFileCount} module${plural})`);
        }
        const filledBar = Math.floor(progress.ratio * MAX_PROGRESS_BAR_CHAR_WIDTH);
        const _progress = inProgress ? _chalk().default.green.bgGreen(DARK_BLOCK_CHAR.repeat(filledBar)) + _chalk().default.bgWhite.white(LIGHT_BLOCK_CHAR.repeat(MAX_PROGRESS_BAR_CHAR_WIDTH - filledBar)) + _chalk().default.bold(` ${(100 * progress.ratio).toFixed(1).padStart(4)}% `) + _chalk().default.dim(`(${progress.transformedFileCount.toString().padStart(progress.totalFileCount.toString().length)}/${progress.totalFileCount})`) : '';
        return platform + _chalk().default.reset.dim(`${_path().default.dirname(localPath)}${_path().default.sep}`) + _chalk().default.bold(_path().default.basename(localPath)) + ' ' + _progress;
    }
    _logInitializing(port, hasReducedPerformance) {
        // Don't print a giant logo...
        this.terminal.log(_chalk().default.dim('Starting Metro Bundler'));
    }
    shouldFilterClientLog(event) {
        return isAppRegistryStartupMessage(event.data);
    }
    shouldFilterBundleEvent(event) {
        var _event_bundleDetails;
        return 'bundleDetails' in event && ((_event_bundleDetails = event.bundleDetails) == null ? void 0 : _event_bundleDetails.bundleType) === 'map';
    }
    /** Print the cache clear message. */ transformCacheReset() {
        (0, _TerminalReporter.logWarning)(this.terminal, (0, _chalk().default)`Bundler cache is empty, rebuilding {dim (this may take a minute)}`);
    }
    /** One of the first logs that will be printed */ dependencyGraphLoading(hasReducedPerformance) {
        // this.terminal.log('Dependency graph is loading...');
        if (hasReducedPerformance) {
            // Extends https://github.com/facebook/metro/blob/347b1d7ed87995d7951aaa9fd597c04b06013dac/packages/metro/src/lib/TerminalReporter.js#L283-L290
            this.terminal.log(_chalk().default.red([
                'Metro is operating with reduced performance.',
                'Fix the problem above and restart Metro.'
            ].join('\n')));
        }
    }
    _logBundlingError(error) {
        const moduleResolutionError = formatUsingNodeStandardLibraryError(this.projectRoot, error);
        if (moduleResolutionError) {
            let message = maybeAppendCodeFrame(moduleResolutionError, error.message);
            message += '\n\n' + (0, _metroErrorInterface.nearestImportStack)(error);
            return this.terminal.log(message);
        }
        (0, _metroErrorInterface.attachImportStackToRootMessage)(error);
        // NOTE(@kitten): Metro drops the stack forcefully when it finds a `SyntaxError`. However,
        // this is really unhelpful, since it prevents debugging Babel plugins or reporting bugs
        // in Babel plugins or a transformer entirely
        if (error.snippet == null && error.stack != null && error instanceof SyntaxError) {
            error.message = error.stack;
            delete error.stack;
        }
        return super._logBundlingError(error);
    }
}
function formatUsingNodeStandardLibraryError(projectRoot, error) {
    if (!error.message) {
        return null;
    }
    const { targetModuleName, originModulePath } = error;
    if (!targetModuleName || !originModulePath) {
        return null;
    }
    const relativePath = _path().default.relative(projectRoot, originModulePath);
    const DOCS_PAGE_URL = 'https://docs.expo.dev/workflow/using-libraries/#using-third-party-libraries';
    if (isNodeStdLibraryModule(targetModuleName)) {
        if (originModulePath.includes('node_modules')) {
            return [
                `The package at "${_chalk().default.bold(relativePath)}" attempted to import the Node standard library module "${_chalk().default.bold(targetModuleName)}".`,
                `It failed because the native React runtime does not include the Node standard library.`,
                (0, _link.learnMore)(DOCS_PAGE_URL)
            ].join('\n');
        } else {
            return [
                `You attempted to import the Node standard library module "${_chalk().default.bold(targetModuleName)}" from "${_chalk().default.bold(relativePath)}".`,
                `It failed because the native React runtime does not include the Node standard library.`,
                (0, _link.learnMore)(DOCS_PAGE_URL)
            ].join('\n');
        }
    }
    return `Unable to resolve "${targetModuleName}" from "${relativePath}"`;
}
function isNodeStdLibraryModule(moduleName) {
    return /^node:/.test(moduleName) || _externals.NODE_STDLIB_MODULES.includes(moduleName);
}
/** If the code frame can be found then append it to the existing message.  */ function maybeAppendCodeFrame(message, rawMessage) {
    const codeFrame = extractCodeFrame(stripMetroInfo(rawMessage));
    if (codeFrame) {
        message += '\n' + codeFrame;
    }
    return message;
}
function extractCodeFrame(errorMessage) {
    const codeFrameLine = /^(?:\s*(?:>?\s*\d+\s*\||\s*\|).*\n?)+/;
    let wasPreviousLineCodeFrame = null;
    return errorMessage.split('\n').filter((line)=>{
        if (wasPreviousLineCodeFrame === false) return false;
        const keep = codeFrameLine.test((0, _util().stripVTControlCharacters)(line));
        if (keep && wasPreviousLineCodeFrame === null) wasPreviousLineCodeFrame = true;
        else if (!keep && wasPreviousLineCodeFrame) wasPreviousLineCodeFrame = false;
        return keep;
    }).join('\n');
}
function stripMetroInfo(errorMessage) {
    // Newer versions of Metro don't include the list.
    if (!errorMessage.includes('4. Remove the cache')) {
        return errorMessage;
    }
    const lines = errorMessage.split('\n');
    const index = lines.findIndex((line)=>line.includes('4. Remove the cache'));
    if (index === -1) {
        return errorMessage;
    }
    return lines.slice(index + 1).join('\n');
}
/** @returns if the message matches the initial startup log */ function isAppRegistryStartupMessage(body) {
    return body.length === 1 && (/^Running application "main" with appParams:/.test(body[0]) || /^Running "main" with \{/.test(body[0]));
}
/** @returns platform specific tag for a `BundleDetails` object */ function getPlatformTagForBuildDetails(bundleDetails) {
    const platform = (bundleDetails == null ? void 0 : bundleDetails.platform) ?? null;
    if (platform) {
        const formatted = {
            ios: 'iOS',
            android: 'Android',
            web: 'Web'
        }[platform] || platform;
        return `${_chalk().default.bold(formatted)} `;
    }
    return '';
}
/** @returns platform specific tag for a `BundleDetails` object */ function getEnvironmentForBuildDetails(bundleDetails) {
    var _bundleDetails_customTransformOptions, _bundleDetails_customTransformOptions1, _bundleDetails_customTransformOptions2;
    // Expo CLI will pass `customTransformOptions.environment = 'node'` when bundling for the server.
    const env = (bundleDetails == null ? void 0 : (_bundleDetails_customTransformOptions = bundleDetails.customTransformOptions) == null ? void 0 : _bundleDetails_customTransformOptions.environment) ?? null;
    if (env === 'node') {
        return _chalk().default.bold('λ') + ' ';
    } else if (env === 'react-server') {
        return _chalk().default.bold(`RSC(${getPlatformTagForBuildDetails(bundleDetails).trim()})`) + ' ';
    }
    if ((bundleDetails == null ? void 0 : (_bundleDetails_customTransformOptions1 = bundleDetails.customTransformOptions) == null ? void 0 : _bundleDetails_customTransformOptions1.dom) && typeof (bundleDetails == null ? void 0 : (_bundleDetails_customTransformOptions2 = bundleDetails.customTransformOptions) == null ? void 0 : _bundleDetails_customTransformOptions2.dom) === 'string') {
        return _chalk().default.bold(`DOM`) + ' ';
    }
    return '';
}

//# sourceMappingURL=MetroTerminalReporter.js.map