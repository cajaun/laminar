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
    AbortCommandError: function() {
        return AbortCommandError;
    },
    CommandError: function() {
        return CommandError;
    },
    SilentError: function() {
        return SilentError;
    },
    UnimplementedError: function() {
        return UnimplementedError;
    },
    logCmdError: function() {
        return logCmdError;
    }
});
function _assert() {
    const data = require("assert");
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
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
const _log = require("../log");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const ERROR_PREFIX = 'Error: ';
class CommandError extends Error {
    constructor(code, message = ''){
        super(''), this.code = code, this.name = 'CommandError', this.isCommandError = true;
        // If e.toString() was called to get `message` we don't want it to look
        // like "Error: Error:".
        if (message.startsWith(ERROR_PREFIX)) {
            message = message.substring(ERROR_PREFIX.length);
        }
        this.message = message || code;
    }
}
class AbortCommandError extends CommandError {
    constructor(){
        super('ABORTED', 'Interactive prompt was cancelled.');
    }
}
class SilentError extends CommandError {
    constructor(messageOrError){
        const message = (typeof messageOrError === 'string' ? messageOrError : messageOrError == null ? void 0 : messageOrError.message) ?? 'This error should fail silently in the CLI';
        super('SILENT', message);
        if (typeof messageOrError !== 'string') {
            // forward the props of the incoming error for tests or processes outside of expo-cli that use expo cli internals.
            this.stack = (messageOrError == null ? void 0 : messageOrError.stack) ?? this.stack;
            this.name = (messageOrError == null ? void 0 : messageOrError.name) ?? this.name;
        }
    }
}
function logCmdError(error) {
    if (!(error instanceof Error)) {
        throw error;
    }
    if (error instanceof AbortCommandError || error instanceof SilentError) {
        // Do nothing, this is used for prompts or other cases that were custom logged.
        process.exit(1);
    } else if (error instanceof CommandError || error instanceof _assert().AssertionError || error.name === 'ApiV2Error' || error.name === 'ConfigError') {
        // Print the stack trace in debug mode only.
        (0, _log.exit)(error);
    }
    const errorDetails = error.stack ? '\n' + _chalk().default.gray(error.stack) : '';
    (0, _log.exit)(_chalk().default.red(error.toString()) + errorDetails);
}
class UnimplementedError extends Error {
    constructor(){
        super('Unimplemented');
        this.name = 'UnimplementedError';
    }
}
/**
 * Add additional information when EMFILE errors are encountered.
 * These errors originate from Metro's FSEventsWatcher due to `fsevents` going over MacOS system limit.
 * Unfortunately, these limits in macOS are relatively low compared to an average React Native project.
 *
 * @see https://github.com/expo/expo/issues/29083
 * @see https://github.com/facebook/metro/issues/834
 * @see https://github.com/fsevents/fsevents/issues/42#issuecomment-62632234
 */ function handleTooManyOpenFileErrors(error) {
    // Only enable special logging when running on macOS and are running into the `EMFILE` error
    if ('code' in error && error.code === 'EMFILE' && process.platform === 'darwin') {
        try {
            // Try to recover watchman, if it's not installed this will throw
            (0, _child_process().execSync)('watchman shutdown-server', {
                stdio: 'ignore'
            });
            // NOTE(cedric): this both starts the watchman server and resets all watchers
            (0, _child_process().execSync)('watchman watch-del-all', {
                stdio: 'ignore'
            });
            (0, _log.warn)('Watchman is installed but was likely not enabled when starting Metro, try starting your project again.\nIf this problem persists, follow the troubleshooting guide of Watchman: https://facebook.github.io/watchman/docs/troubleshooting');
        } catch  {
            (0, _log.warn)(`Your macOS system limit does not allow enough watchers for Metro, install Watchman instead. Learn more: https://facebook.github.io/watchman/docs/install`);
        }
        (0, _log.exception)(error);
        process.exit(1);
    }
    throw error;
}
process.on('uncaughtException', handleTooManyOpenFileErrors);

//# sourceMappingURL=errors.js.map