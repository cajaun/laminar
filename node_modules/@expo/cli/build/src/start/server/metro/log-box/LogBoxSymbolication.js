/**
 * Copyright (c) 650 Industries.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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
    deleteStack: function() {
        return deleteStack;
    },
    parseErrorStack: function() {
        return parseErrorStack;
    },
    symbolicate: function() {
        return symbolicate;
    }
});
function _stacktraceparser() {
    const data = require("stacktrace-parser");
    _stacktraceparser = function() {
        return data;
    };
    return data;
}
const cache = new Map();
/**
 * Sanitize because sometimes `symbolicateStackTrace` gives us invalid values.
 */ const sanitize = ({ stack: maybeStack, codeFrame })=>{
    if (!Array.isArray(maybeStack)) {
        throw new Error('Expected stack to be an array.');
    }
    const stack = [];
    for (const maybeFrame of maybeStack){
        var _maybeFrame_arguments;
        let collapse = false;
        if ('collapse' in maybeFrame) {
            if (typeof maybeFrame.collapse !== 'boolean') {
                throw new Error('Expected stack frame `collapse` to be a boolean.');
            }
            collapse = maybeFrame.collapse;
        }
        stack.push({
            arguments: ((_maybeFrame_arguments = maybeFrame.arguments) == null ? void 0 : _maybeFrame_arguments.map((arg)=>String(arg))) ?? [],
            column: maybeFrame.column,
            file: maybeFrame.file,
            lineNumber: maybeFrame.lineNumber,
            methodName: maybeFrame.methodName,
            collapse
        });
    }
    return {
        stack,
        codeFrame
    };
};
function deleteStack(stack) {
    cache.delete(stack);
}
function symbolicate(stack) {
    let promise = cache.get(stack);
    if (promise == null) {
        promise = symbolicateStackTrace(stack).then(sanitize);
        cache.set(stack, promise);
    }
    return promise;
}
async function symbolicateStackTrace(stack) {
    const baseUrl = typeof window === 'undefined' ? process.env.EXPO_DEV_SERVER_ORIGIN : window.location.protocol + '//' + window.location.host;
    return fetch(baseUrl + '/symbolicate', {
        method: 'POST',
        body: JSON.stringify({
            stack
        })
    }).then((res)=>res.json());
}
function parseErrorStack(stack) {
    if (stack == null) {
        return [];
    }
    if (Array.isArray(stack)) {
        return stack;
    }
    return (0, _stacktraceparser().parse)(stack).map((frame)=>{
        var _frame_arguments;
        // Add back support for Hermes native calls:
        // `    at apply (native)`
        // Which are parsed to:
        // {
        //   "file": null,
        //   "methodName": "apply",
        //   "arguments": ["native"],
        //   "lineNumber": null,
        //   "column": null,
        //   "collapse": false
        // },
        // https://github.com/facebook/react-native/blob/f0ad39446404bb6e027d0c486b579c312f35180a/packages/react-native/Libraries/Core/Devtools/parseHermesStack.js#L70
        if (frame.file == null && ((_frame_arguments = frame.arguments) == null ? void 0 : _frame_arguments.length) === 1 && frame.arguments[0] === 'native') {
            // Use `<native>` to match the `<anonymous>` and `<unknown>` used by other runtimes.
            frame.file = '<native>';
            frame.arguments = [];
        }
        // frame.file will mostly look like `http://localhost:8081/index.bundle?platform=web&dev=true&hot=false`
        return {
            ...frame,
            column: frame.column != null ? frame.column - 1 : null
        };
    });
}

//# sourceMappingURL=LogBoxSymbolication.js.map