/**
 * Copyright © 2024 650 Industries.
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
    augmentLogs: function() {
        return augmentLogs;
    },
    formatStackLikeMetro: function() {
        return formatStackLikeMetro;
    },
    logLikeMetro: function() {
        return logLikeMetro;
    },
    maybeSymbolicateAndFormatJSErrorStackLogAsync: function() {
        return maybeSymbolicateAndFormatJSErrorStackLogAsync;
    },
    parseErrorStringToObject: function() {
        return parseErrorStringToObject;
    }
});
function _metroconfig() {
    const data = require("@expo/metro-config");
    _metroconfig = function() {
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _sourcemapsupport() {
    const data = require("source-map-support");
    _sourcemapsupport = function() {
        return data;
    };
    return data;
}
function _stacktraceparser() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("stacktrace-parser"));
    _stacktraceparser = function() {
        return data;
    };
    return data;
}
const _LogBoxSymbolication = require("./metro/log-box/LogBoxSymbolication");
const _env = require("../../utils/env");
const _fn = require("../../utils/fn");
const _LogBoxLog = require("./metro/log-box/LogBoxLog");
const _metroErrorInterface = require("./metro/metroErrorInterface");
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
const debug = require('debug')('expo:metro:logger');
const groupStack = [];
let collapsedGuardTimer;
function logLikeMetro(originalLogFunction, level, platform, ...data) {
    // @ts-expect-error
    const logFunction = console[level] && level !== 'trace' ? level : 'log';
    const color = level === 'error' ? _chalk().default.inverse.red : level === 'warn' ? _chalk().default.inverse.yellow : _chalk().default.inverse.white;
    if (level === 'group') {
        groupStack.push(level);
    } else if (level === 'groupCollapsed') {
        groupStack.push(level);
        clearTimeout(collapsedGuardTimer);
        // Inform users that logs get swallowed if they forget to call `groupEnd`.
        collapsedGuardTimer = setTimeout(()=>{
            if (groupStack.includes('groupCollapsed')) {
                originalLogFunction(_chalk().default.inverse.yellow.bold(' WARN '), 'Expected `console.groupEnd` to be called after `console.groupCollapsed`.');
                groupStack.length = 0;
            }
        }, 3000);
        return;
    } else if (level === 'groupEnd') {
        groupStack.pop();
        if (!groupStack.length) {
            clearTimeout(collapsedGuardTimer);
        }
        return;
    }
    if (!groupStack.includes('groupCollapsed')) {
        // Remove excess whitespace at the end of a log message, if possible.
        const lastItem = data[data.length - 1];
        if (typeof lastItem === 'string') {
            data[data.length - 1] = lastItem.trimEnd();
        }
        const modePrefix = platform && platform !== 'BRIDGE' && platform !== 'NOBRIDGE' ? _chalk().default.bold`${platform} ` : '';
        originalLogFunction(modePrefix + color.bold(` ${logFunction.toUpperCase()} `) + ''.padEnd(groupStack.length * 2, ' '), ...data);
    }
}
const escapedPathSep = _path().default.sep === '\\' ? '\\\\' : _path().default.sep;
const SERVER_STACK_MATCHER = new RegExp(`${escapedPathSep}(react-dom|metro-runtime|expo-router)${escapedPathSep}`);
async function maybeSymbolicateAndFormatJSErrorStackLogAsync(projectRoot, level, error) {
    var _log_symbolicated_stack, _log_symbolicated;
    const log = new _LogBoxLog.LogBoxLog({
        level: level,
        message: {
            content: error.message,
            substitutions: []
        },
        isComponentError: false,
        stack: error.stack,
        category: 'static',
        componentStack: []
    });
    await new Promise((res)=>log.symbolicate('stack', res));
    const formatted = (0, _metroErrorInterface.getStackAsFormattedLog)(projectRoot, {
        stack: ((_log_symbolicated = log.symbolicated) == null ? void 0 : (_log_symbolicated_stack = _log_symbolicated.stack) == null ? void 0 : _log_symbolicated_stack.stack) ?? [],
        codeFrame: log.codeFrame
    });
    // NOTE: Message is printed above stack by the default Metro logic. So we don't need to include it here.
    const symbolicatedErrorStackLog = `\n\n${formatted.stack}`;
    return {
        isFallback: formatted.isFallback,
        stack: symbolicatedErrorStackLog
    };
}
function parseErrorStringToObject(errorString) {
    // Find the first line of the possible stack trace
    const stackStartIndex = errorString.indexOf('\n    at ');
    if (stackStartIndex === -1) {
        // No stack trace found, return the original error string
        return null;
    }
    const message = errorString.slice(0, stackStartIndex).trim();
    const stack = errorString.slice(stackStartIndex + 1);
    try {
        const parsedStack = (0, _LogBoxSymbolication.parseErrorStack)(stack);
        return {
            message,
            stack: parsedStack
        };
    } catch (e) {
        // If parsing fails, return the original error string
        debug('Failed to parse error stack:', e);
        return null;
    }
}
function augmentLogsInternal(projectRoot) {
    const augmentLog = (name, fn)=>{
        // @ts-expect-error: TypeScript doesn't know about polyfilled functions.
        if (fn.__polyfilled) {
            return fn;
        }
        const originalFn = fn.bind(console);
        function logWithStack(...args) {
            const stack = new Error().stack;
            // Check if the log originates from the server.
            const isServerLog = !!(stack == null ? void 0 : stack.match(SERVER_STACK_MATCHER));
            if (isServerLog) {
                if (name === 'error' || name === 'warn') {
                    if (args.length === 2 && typeof args[1] === 'string' && args[1].trim().startsWith('at ')) {
                        // react-dom custom stacks which are always broken.
                        // A stack string like:
                        //    at div
                        //    at http://localhost:8081/node_modules/expo-router/node/render.bundle?platform=web&dev=true&hot=false&transform.engine=hermes&transform.routerRoot=app&resolver.environment=node&transform.environment=node:38008:27
                        //    at Background (http://localhost:8081/node_modules/expo-router/node/render.bundle?platform=web&dev=true&hot=false&transform.engine=hermes&transform.routerRoot=app&resolver.environment=node&transform.environment=node:151009:7)
                        const customStack = args[1];
                        try {
                            const parsedStack = (0, _LogBoxSymbolication.parseErrorStack)(customStack);
                            const symbolicatedStack = parsedStack.map((line)=>{
                                const mapped = (0, _sourcemapsupport().mapSourcePosition)({
                                    source: line.file,
                                    line: line.lineNumber,
                                    column: line.column
                                });
                                const fallbackName = mapped.name ?? '<unknown>';
                                return {
                                    file: mapped.source,
                                    lineNumber: mapped.line,
                                    column: mapped.column,
                                    // Attempt to preserve the react component name if possible.
                                    methodName: line.methodName ? line.methodName === '<unknown>' ? fallbackName : line.methodName : fallbackName,
                                    arguments: line.arguments ?? []
                                };
                            });
                            // Replace args[1] with the formatted stack.
                            args[1] = '\n' + formatParsedStackLikeMetro(projectRoot, symbolicatedStack, true);
                        } catch  {
                            // If symbolication fails, log the original stack.
                            args.push('\n' + formatStackLikeMetro(projectRoot, customStack));
                        }
                    } else {
                        args.push('\n' + formatStackLikeMetro(projectRoot, stack));
                    }
                }
                logLikeMetro(originalFn, name, 'λ', ...args);
            } else {
                originalFn(...args);
            }
        }
        logWithStack.__polyfilled = true;
        return logWithStack;
    };
    [
        'trace',
        'info',
        'error',
        'warn',
        'log',
        'group',
        'groupCollapsed',
        'groupEnd',
        'debug'
    ].forEach((name)=>{
        // @ts-expect-error
        console[name] = augmentLog(name, console[name]);
    });
}
function formatStackLikeMetro(projectRoot, stack) {
    // Remove `Error: ` from the beginning of the stack trace.
    // Dim traces that match `INTERNAL_CALLSITES_REGEX`
    const stackTrace = _stacktraceparser().parse(stack);
    return formatParsedStackLikeMetro(projectRoot, stackTrace);
}
function formatParsedStackLikeMetro(projectRoot, stackTrace, isComponentStack = false) {
    // Remove `Error: ` from the beginning of the stack trace.
    // Dim traces that match `INTERNAL_CALLSITES_REGEX`
    return stackTrace.filter((line)=>line.file && // Ignore unsymbolicated stack frames. It's not clear how this is possible but it sometimes happens when the graph changes.
        !/^https?:\/\//.test(line.file) && (isComponentStack ? true : line.file !== '<anonymous>')).map((line)=>{
        // Use the same regex we use in Metro config to filter out traces:
        const isCollapsed = _metroconfig().INTERNAL_CALLSITES_REGEX.test(line.file);
        if (!isComponentStack && isCollapsed && !_env.env.EXPO_DEBUG) {
            return null;
        }
        // If a file is collapsed, print it with dim styling.
        const style = isCollapsed ? _chalk().default.dim : _chalk().default.gray;
        // Use the `at` prefix to match Node.js
        let fileName = line.file;
        if (fileName.startsWith(_path().default.sep)) {
            fileName = _path().default.relative(projectRoot, fileName);
        }
        if (line.lineNumber != null) {
            fileName += `:${line.lineNumber}`;
            if (line.column != null) {
                fileName += `:${line.column}`;
            }
        }
        return style(`  ${line.methodName} (${fileName})`);
    }).filter(Boolean).join('\n');
}
const augmentLogs = (0, _fn.memoize)(augmentLogsInternal);

//# sourceMappingURL=serverLogLikeMetro.js.map