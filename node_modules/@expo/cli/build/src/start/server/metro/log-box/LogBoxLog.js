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
Object.defineProperty(exports, "LogBoxLog", {
    enumerable: true,
    get: function() {
        return LogBoxLog;
    }
});
const _LogBoxSymbolication = /*#__PURE__*/ _interop_require_wildcard(require("./LogBoxSymbolication"));
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
function componentStackToStack(componentStack) {
    return componentStack.map((stack)=>{
        var _stack_location, _stack_location1;
        return {
            file: stack.fileName,
            methodName: stack.content,
            lineNumber: ((_stack_location = stack.location) == null ? void 0 : _stack_location.row) ?? 0,
            column: ((_stack_location1 = stack.location) == null ? void 0 : _stack_location1.column) ?? 0,
            arguments: []
        };
    });
}
class LogBoxLog {
    constructor(data){
        this.symbolicated = {
            stack: {
                error: null,
                stack: null,
                status: 'NONE'
            },
            component: {
                error: null,
                stack: null,
                status: 'NONE'
            }
        };
        this.callbacks = new Map();
        this.componentStackCache = null;
        this.level = data.level;
        this.type = data.type ?? 'error';
        this.message = data.message;
        this.stack = data.stack;
        this.category = data.category;
        this.componentStack = data.componentStack;
        this.codeFrame = data.codeFrame;
        this.isComponentError = data.isComponentError;
        this.count = 1;
        this.symbolicated = data.symbolicated ?? this.symbolicated;
    }
    incrementCount() {
        this.count += 1;
    }
    getAvailableStack(type) {
        if (this.symbolicated[type].status === 'COMPLETE') {
            return this.symbolicated[type].stack;
        }
        return this.getStack(type);
    }
    flushCallbacks(type) {
        const callbacks = this.callbacks.get(type);
        const status = this.symbolicated[type].status;
        if (callbacks) {
            for (const callback of callbacks){
                callback(status);
            }
            callbacks.clear();
        }
    }
    pushCallback(type, callback) {
        let callbacks = this.callbacks.get(type);
        if (!callbacks) {
            callbacks = new Set();
            this.callbacks.set(type, callbacks);
        }
        callbacks.add(callback);
    }
    retrySymbolicate(type, callback) {
        this._symbolicate(type, true, callback);
    }
    symbolicate(type, callback) {
        this._symbolicate(type, false, callback);
    }
    _symbolicate(type, retry, callback) {
        if (callback) {
            this.pushCallback(type, callback);
        }
        const status = this.symbolicated[type].status;
        if (status === 'COMPLETE') {
            return this.flushCallbacks(type);
        }
        if (retry) {
            _LogBoxSymbolication.deleteStack(this.getStack(type));
            this.handleSymbolicate(type);
        } else {
            if (status === 'NONE') {
                this.handleSymbolicate(type);
            }
        }
    }
    getStack(type) {
        if (type === 'component') {
            if (this.componentStackCache == null) {
                this.componentStackCache = componentStackToStack(this.componentStack);
            }
            return this.componentStackCache;
        }
        return this.stack;
    }
    handleSymbolicate(type) {
        var _this_componentStack;
        if (type === 'component' && !((_this_componentStack = this.componentStack) == null ? void 0 : _this_componentStack.length)) {
            return;
        }
        if (this.symbolicated[type].status !== 'PENDING') {
            this.updateStatus(type, null, null, null);
            _LogBoxSymbolication.symbolicate(this.getStack(type)).then((data)=>{
                this.updateStatus(type, null, data == null ? void 0 : data.stack, data == null ? void 0 : data.codeFrame);
            }, (error)=>{
                this.updateStatus(type, error, null, null);
            });
        }
    }
    updateStatus(type, error, stack, codeFrame) {
        const lastStatus = this.symbolicated[type].status;
        if (error != null) {
            this.symbolicated[type] = {
                error,
                stack: null,
                status: 'FAILED'
            };
        } else if (stack != null) {
            if (codeFrame) {
                this.codeFrame = codeFrame;
            }
            this.symbolicated[type] = {
                error: null,
                stack,
                status: 'COMPLETE'
            };
        } else {
            this.symbolicated[type] = {
                error: null,
                stack: null,
                status: 'PENDING'
            };
        }
        const status = this.symbolicated[type].status;
        if (lastStatus !== status) {
            if ([
                'COMPLETE',
                'FAILED'
            ].includes(status)) {
                this.flushCallbacks(type);
            }
        }
    }
}

//# sourceMappingURL=LogBoxLog.js.map