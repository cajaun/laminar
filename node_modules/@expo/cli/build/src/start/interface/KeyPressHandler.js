"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KeyPressHandler", {
    enumerable: true,
    get: function() {
        return KeyPressHandler;
    }
});
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _errors = require("../../utils/errors");
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
const CTRL_C = '\u0003';
const debug = require('debug')('expo:start:interface:keyPressHandler');
class KeyPressHandler {
    constructor(onPress){
        this.onPress = onPress;
        this.isInterceptingKeyStrokes = false;
        this.isHandlingKeyPress = false;
        this.handleKeypress = async (key)=>{
            // Prevent sending another event until the previous event has finished.
            if (this.isHandlingKeyPress && key !== CTRL_C) {
                return;
            }
            this.isHandlingKeyPress = true;
            try {
                debug(`Key pressed: ${key}`);
                await this.onPress(key);
            } catch (error) {
                await (0, _errors.logCmdError)(error);
            } finally{
                this.isHandlingKeyPress = false;
            }
        };
    }
    /** Start observing interaction pause listeners. */ createInteractionListener() {
        // Support observing prompts.
        let wasIntercepting = false;
        const listener = ({ pause })=>{
            if (pause) {
                // Track if we were already intercepting key strokes before pausing, so we can
                // resume after pausing.
                wasIntercepting = this.isInterceptingKeyStrokes;
                this.stopInterceptingKeyStrokes();
            } else if (wasIntercepting) {
                // Only start if we were previously intercepting.
                this.startInterceptingKeyStrokes();
            }
        };
        return listener;
    }
    /** Start intercepting all key strokes and passing them to the input `onPress` method. */ startInterceptingKeyStrokes() {
        if (this.isInterceptingKeyStrokes) {
            return;
        }
        this.isInterceptingKeyStrokes = true;
        const { stdin } = process;
        // TODO: This might be here because of an old Node version.
        if (!stdin.setRawMode) {
            _log.warn('Using a non-interactive terminal, keyboard commands are disabled.');
            return;
        }
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        stdin.on('data', this.handleKeypress);
    }
    /** Stop intercepting all key strokes. */ stopInterceptingKeyStrokes() {
        if (!this.isInterceptingKeyStrokes) {
            return;
        }
        this.isInterceptingKeyStrokes = false;
        const { stdin } = process;
        stdin.removeListener('data', this.handleKeypress);
        // TODO: This might be here because of an old Node version.
        if (!stdin.setRawMode) {
            _log.warn('Using a non-interactive terminal, keyboard commands are disabled.');
            return;
        }
        stdin.setRawMode(false);
        stdin.resume();
    }
}

//# sourceMappingURL=KeyPressHandler.js.map