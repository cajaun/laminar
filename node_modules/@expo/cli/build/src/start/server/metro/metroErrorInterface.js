/**
 * Copyright © 2022 650 Industries.
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
    IS_METRO_BUNDLE_ERROR_SYMBOL: function() {
        return IS_METRO_BUNDLE_ERROR_SYMBOL;
    },
    attachImportStackToRootMessage: function() {
        return attachImportStackToRootMessage;
    },
    dropStackIfContainsCodeFrame: function() {
        return dropStackIfContainsCodeFrame;
    },
    getErrorOverlayHtmlAsync: function() {
        return getErrorOverlayHtmlAsync;
    },
    getStackAsFormattedLog: function() {
        return getStackAsFormattedLog;
    },
    likelyContainsCodeFrame: function() {
        return likelyContainsCodeFrame;
    },
    logMetroError: function() {
        return logMetroError;
    },
    logMetroErrorAsync: function() {
        return logMetroErrorAsync;
    },
    logMetroErrorWithStack: function() {
        return logMetroErrorWithStack;
    },
    nearestImportStack: function() {
        return nearestImportStack;
    }
});
function _paths() {
    const data = require("@expo/config/paths");
    _paths = function() {
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
function _nodeutil() {
    const data = require("node:util");
    _nodeutil = function() {
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
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
function _stacktraceparser() {
    const data = require("stacktrace-parser");
    _stacktraceparser = function() {
        return data;
    };
    return data;
}
function _terminallink() {
    const data = /*#__PURE__*/ _interop_require_default(require("terminal-link"));
    _terminallink = function() {
        return data;
    };
    return data;
}
const _LogBoxLog = require("./log-box/LogBoxLog");
const _formatProjectFilePath = require("./log-box/formatProjectFilePath");
const _log = require("../../../log");
const _ansi = require("../../../utils/ansi");
const _env = require("../../../utils/env");
const _errors = require("../../../utils/errors");
const _getStaticRenderFunctions = require("../getStaticRenderFunctions");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const isDebug = require('debug').enabled('expo:start:server:metro');
function fill(width) {
    return Array(width).join(' ');
}
function formatPaths(config) {
    const filePath = _chalk().default.reset(config.filePath);
    return _chalk().default.dim('(') + filePath + _chalk().default.dim(`:${[
        config.line,
        config.col
    ].filter(Boolean).join(':')})`);
}
async function logMetroErrorWithStack(projectRoot, { stack, codeFrame, error }) {
    if (error instanceof _errors.SilentError) {
        return;
    }
    // process.stdout.write('\u001b[0m'); // Reset attributes
    // process.stdout.write('\u001bc'); // Reset the terminal
    _log.Log.log();
    _log.Log.log(_chalk().default.red('Metro error: ') + error.message);
    _log.Log.log();
    if (error instanceof _errors.CommandError) {
        return;
    }
    _log.Log.log(getStackAsFormattedLog(projectRoot, {
        stack,
        codeFrame,
        error,
        showCollapsedFrames: true
    }).stack);
}
function getStackAsFormattedLog(projectRoot, { stack, codeFrame, error, showCollapsedFrames = _env.env.EXPO_DEBUG }) {
    const logs = [];
    const containsCodeFrame = likelyContainsCodeFrame(error == null ? void 0 : error.message);
    if (containsCodeFrame) {
    // Some transformation errors will have a code frame embedded in the error message
    // from Babel and we should not duplicate it as message is already printed before this call.
    } else if (codeFrame) {
        var _codeFrame_location;
        const maxWarningLineLength = Math.max(800, process.stdout.columns);
        const lineText = codeFrame.content;
        const lines = codeFrame.content.split('\n');
        // ---- index.tsx ------------------------------------------------------
        //  32 |         This is example code which will be under the title.
        const title = _path().default.basename(codeFrame.fileName);
        logs.push(_chalk().default.bold`Code: ${title}`);
        const isPreviewTooLong = lines.some((line)=>line.length > maxWarningLineLength);
        const column = (_codeFrame_location = codeFrame.location) == null ? void 0 : _codeFrame_location.column;
        // When the preview is too long, we skip reading the file and attempting to apply
        // code coloring, this is because it can get very slow.
        if (isPreviewTooLong) {
            var _codeFrame_location1, _codeFrame_location2;
            let previewLine = '';
            let cursorLine = '';
            const formattedPath = formatPaths({
                filePath: codeFrame.fileName,
                line: (_codeFrame_location1 = codeFrame.location) == null ? void 0 : _codeFrame_location1.row,
                col: (_codeFrame_location2 = codeFrame.location) == null ? void 0 : _codeFrame_location2.column
            });
            // Create a curtailed preview line like:
            // `...transition:'fade'},k._updatePropsStack=function(){clearImmediate(k._updateImmediate),k._updateImmediate...`
            // If there is no text preview or column number, we can't do anything.
            if (lineText && column != null) {
                var _codeFrame_fileName;
                const rangeWindow = Math.round(Math.max(((_codeFrame_fileName = codeFrame.fileName) == null ? void 0 : _codeFrame_fileName.length) ?? 0, Math.max(80, process.stdout.columns)) / 2);
                let minBounds = Math.max(0, column - rangeWindow);
                const maxBounds = Math.min(minBounds + rangeWindow * 2, lineText.length);
                previewLine = lineText.slice(minBounds, maxBounds);
                // If we splice content off the start, then we should append `...`.
                // This is unlikely to happen since we limit the activation size.
                if (minBounds > 0) {
                    // Adjust the min bounds so the cursor is aligned after we add the "..."
                    minBounds -= 3;
                    previewLine = _chalk().default.dim('...') + previewLine;
                }
                if (maxBounds < lineText.length) {
                    previewLine += _chalk().default.dim('...');
                }
                // If the column property could be found, then use that to fix the cursor location which is often broken in regex.
                cursorLine = (column == null ? '' : fill(column) + _chalk().default.reset('^')).slice(minBounds);
                logs.push(formattedPath, '', previewLine, cursorLine, _chalk().default.dim('(error truncated)'));
            }
        } else {
            logs.push(codeFrame.content);
        }
    }
    let isFallback = false;
    if (stack == null ? void 0 : stack.length) {
        const stackProps = stack.map((frame)=>{
            return {
                title: frame.methodName,
                subtitle: (0, _formatProjectFilePath.getStackFormattedLocation)(projectRoot, frame),
                collapse: frame.collapse || isInternalBytecode(frame)
            };
        });
        const stackLines = [];
        const backupStackLines = [];
        stackProps.forEach((frame)=>{
            const shouldShow = !frame.collapse || showCollapsedFrames;
            const position = _terminallink().default.isSupported ? (0, _terminallink().default)(frame.subtitle, frame.subtitle) : frame.subtitle;
            let lineItem = _chalk().default.gray(`  ${frame.title} (${position})`);
            if (frame.collapse) {
                lineItem = _chalk().default.dim(lineItem);
            }
            // Never show the internal module system.
            const isMetroRuntime = /\/metro-runtime\/src\/polyfills\/require\.js/.test(frame.subtitle) || /\/metro-require\/require\.js/.test(frame.subtitle);
            if (!isMetroRuntime) {
                if (shouldShow) {
                    stackLines.push(lineItem);
                }
                backupStackLines.push(lineItem);
            }
        });
        logs.push(_chalk().default.bold`Call Stack`);
        if (!backupStackLines.length) {
            logs.push(_chalk().default.gray('  No stack trace available.'));
        } else {
            isFallback = stackLines.length === 0;
            // If there are not stack lines then it means the error likely happened in the node modules, in this case we should fallback to showing all the
            // the stacks to give the user whatever help we can.
            const displayStack = stackLines.length ? stackLines : backupStackLines;
            logs.push(displayStack.join('\n'));
        }
    } else if (error && error.stack) {
        logs.push(_chalk().default.gray(`  ${error.stack}`));
    }
    return {
        isFallback,
        stack: logs.join('\n')
    };
}
const IS_METRO_BUNDLE_ERROR_SYMBOL = Symbol('_isMetroBundleError');
const HAS_LOGGED_SYMBOL = Symbol('_hasLoggedInCLI');
async function logMetroError(projectRoot, { error }) {
    var _log_symbolicated_stack, _log_symbolicated;
    if (error instanceof _errors.SilentError || error[HAS_LOGGED_SYMBOL]) {
        return;
    }
    error[HAS_LOGGED_SYMBOL] = true;
    const stack = parseErrorStack(projectRoot, error.stack);
    const log = new _LogBoxLog.LogBoxLog({
        level: 'static',
        message: {
            content: error.message,
            substitutions: []
        },
        isComponentError: false,
        stack,
        category: 'static',
        componentStack: []
    });
    await new Promise((res)=>log.symbolicate('stack', res));
    logMetroErrorWithStack(projectRoot, {
        stack: ((_log_symbolicated = log.symbolicated) == null ? void 0 : (_log_symbolicated_stack = _log_symbolicated.stack) == null ? void 0 : _log_symbolicated_stack.stack) ?? [],
        codeFrame: log.codeFrame,
        error
    });
}
function isTransformError(error) {
    return error.type === 'TransformError';
}
/** @returns the html required to render the static metro error as an SPA. */ function logFromError({ error, projectRoot }) {
    // Remap direct Metro Node.js errors to a format that will appear more client-friendly in the logbox UI.
    let stack;
    if (isTransformError(error) && error.filename) {
        // Syntax errors in static rendering.
        stack = [
            {
                file: _path().default.join(projectRoot, error.filename),
                methodName: '<unknown>',
                arguments: [],
                // TODO: Import stack
                lineNumber: error.lineNumber,
                column: error.column
            }
        ];
    } else if ('originModulePath' in error && typeof error.originModulePath === 'string') {
        // TODO: Use import stack here when the error is resolution based.
        stack = [
            {
                file: error.originModulePath,
                methodName: '<unknown>',
                arguments: [],
                // TODO: Import stack
                lineNumber: 0,
                column: 0
            }
        ];
    } else {
        stack = parseErrorStack(projectRoot, error.stack);
    }
    return new _LogBoxLog.LogBoxLog({
        level: 'static',
        message: {
            content: error.message,
            substitutions: []
        },
        isComponentError: false,
        stack,
        category: 'static',
        componentStack: []
    });
}
async function logMetroErrorAsync({ error, projectRoot }) {
    var _log_symbolicated_stack, _log_symbolicated;
    const log = logFromError({
        projectRoot,
        error
    });
    await new Promise((res)=>log.symbolicate('stack', ()=>res()));
    logMetroErrorWithStack(projectRoot, {
        stack: ((_log_symbolicated = log.symbolicated) == null ? void 0 : (_log_symbolicated_stack = _log_symbolicated.stack) == null ? void 0 : _log_symbolicated_stack.stack) ?? [],
        codeFrame: log.codeFrame,
        error
    });
}
async function getErrorOverlayHtmlAsync({ error, projectRoot, routerRoot }) {
    var _log_symbolicated_stack, _log_symbolicated;
    const log = logFromError({
        projectRoot,
        error
    });
    await new Promise((res)=>log.symbolicate('stack', ()=>res()));
    logMetroErrorWithStack(projectRoot, {
        stack: ((_log_symbolicated = log.symbolicated) == null ? void 0 : (_log_symbolicated_stack = _log_symbolicated.stack) == null ? void 0 : _log_symbolicated_stack.stack) ?? [],
        codeFrame: log.codeFrame,
        error
    });
    if ('message' in log && 'content' in log.message && typeof log.message.content === 'string') {
        log.message.content = (0, _ansi.stripAnsi)(log.message.content);
    }
    const logBoxContext = {
        selectedLogIndex: 0,
        isDisabled: false,
        logs: [
            log
        ]
    };
    const html = `<html><head><style>#root,body,html{height:100%}body{overflow:hidden}#root{display:flex}</style></head><body><div id="root"></div><script id="_expo-static-error" type="application/json">${JSON.stringify(logBoxContext)}</script></body></html>`;
    const errorOverlayEntry = await (0, _getStaticRenderFunctions.createMetroEndpointAsync)(projectRoot, // Keep the URL relative
    '', (0, _resolvefrom().default)(projectRoot, 'expo-router/_error'), {
        mode: 'development',
        platform: 'web',
        minify: false,
        optimize: false,
        usedExports: false,
        baseUrl: '',
        routerRoot,
        isExporting: false,
        reactCompiler: false
    });
    const htmlWithJs = html.replace('</body>', `<script src=${errorOverlayEntry}></script></body>`);
    return htmlWithJs;
}
function parseErrorStack(projectRoot, stack) {
    if (stack == null) {
        return [];
    }
    if (Array.isArray(stack)) {
        return stack;
    }
    const serverRoot = (0, _paths().getMetroServerRoot)(projectRoot);
    return (0, _stacktraceparser().parse)(stack).map((frame)=>{
        // frame.file will mostly look like `http://localhost:8081/index.bundle?platform=web&dev=true&hot=false`
        if (frame.file) {
            // SSR will sometimes have absolute paths followed by `.bundle?...`, we need to try and make them relative paths and append a dev server URL.
            if (frame.file.startsWith('/') && frame.file.includes('bundle?') && !canParse(frame.file)) {
                // Malformed stack file from SSR. Attempt to repair.
                frame.file = 'https://localhost:8081/' + _path().default.relative(serverRoot, frame.file);
            }
        }
        return {
            ...frame,
            column: frame.column != null ? frame.column - 1 : null
        };
    }).filter((frame)=>frame.file && !frame.file.includes('node_modules'));
}
function canParse(url) {
    try {
        // eslint-disable-next-line no-new
        new URL(url);
        return true;
    } catch  {
        return false;
    }
}
function dropStackIfContainsCodeFrame(err) {
    if (!(err instanceof Error)) return;
    if (likelyContainsCodeFrame(err.message)) {
        // If the error message contains a code frame, we should drop the stack to avoid cluttering the output.
        delete err.stack;
    }
}
function likelyContainsCodeFrame(message) {
    if (!message) return false;
    const clean = (0, _nodeutil().stripVTControlCharacters)(message);
    if (!clean) return false;
    return /^\s*\d+\s+\|/m.test(clean);
}
const attachImportStackToRootMessage = (err)=>{
    if (!(err instanceof Error)) return;
    // Space out build failures.
    const nearestImportStackValue = nearestImportStack(err);
    if (nearestImportStackValue) {
        err.message += '\n\n' + nearestImportStackValue;
        if (!isDebug) {
            // When not debugging remove the stack to avoid cluttering the output and confusing users,
            // the import stack is the guide to fixing the error.
            delete err.stack;
        }
    }
};
const nearestImportStack = (err, root = err)=>{
    if (!(err instanceof Error) || !(root instanceof Error)) return undefined;
    if ('_expoImportStack' in err && typeof err._expoImportStack === 'string') {
        // Space out build failures.
        return err._expoImportStack;
    } else {
        return nearestImportStack(err.cause, root);
    }
};
function isInternalBytecode(frame) {
    var _frame_file;
    return ((_frame_file = frame.file) == null ? void 0 : _frame_file.includes('InternalBytecode.js')) ?? false;
}

//# sourceMappingURL=metroErrorInterface.js.map