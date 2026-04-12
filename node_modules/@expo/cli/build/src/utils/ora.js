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
    getAllSpinners: function() {
        return getAllSpinners;
    },
    logNewSection: function() {
        return logNewSection;
    },
    ora: function() {
        return ora;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _ora() {
    const data = /*#__PURE__*/ _interop_require_default(require("ora"));
    _ora = function() {
        return data;
    };
    return data;
}
const _env = require("./env");
const _interactive = require("./interactive");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const logReal = console.log;
const infoReal = console.info;
const warnReal = console.warn;
const errorReal = console.error;
const runningSpinners = [];
function getAllSpinners() {
    return runningSpinners;
}
function ora(options) {
    const inputOptions = typeof options === 'string' ? {
        text: options
    } : options || {};
    const disabled = !(0, _interactive.isInteractive)() || _env.env.EXPO_DEBUG;
    const spinner = (0, _ora().default)({
        // Ensure our non-interactive mode emulates CI mode.
        isEnabled: !disabled,
        // In non-interactive mode, send the stream to stdout so it prevents looking like an error.
        stream: disabled ? process.stdout : process.stderr,
        ...inputOptions
    });
    const oraStart = spinner.start.bind(spinner);
    const oraStop = spinner.stop.bind(spinner);
    const oraStopAndPersist = spinner.stopAndPersist.bind(spinner);
    const logWrap = (method, args)=>{
        oraStop();
        method(...args);
        spinner.start();
    };
    const wrapNativeLogs = ()=>{
        console.log = (...args)=>logWrap(logReal, args);
        console.info = (...args)=>logWrap(infoReal, args);
        console.warn = (...args)=>logWrap(warnReal, args);
        console.error = (...args)=>logWrap(errorReal, args);
        runningSpinners.push(spinner);
    };
    const resetNativeLogs = ()=>{
        console.log = logReal;
        console.info = infoReal;
        console.warn = warnReal;
        console.error = errorReal;
        const index = runningSpinners.indexOf(spinner);
        if (index >= 0) {
            runningSpinners.splice(index, 1);
        }
    };
    spinner.start = (text)=>{
        wrapNativeLogs();
        return oraStart(text);
    };
    spinner.stopAndPersist = (options)=>{
        const result = oraStopAndPersist(options);
        resetNativeLogs();
        return result;
    };
    spinner.stop = ()=>{
        const result = oraStop();
        resetNativeLogs();
        return result;
    };
    // Always make the central logging module aware of the current spinner
    // Log.setSpinner(spinner);
    return spinner;
}
function logNewSection(title) {
    const spinner = ora(_chalk().default.bold(title));
    // Prevent the spinner from clashing with debug logs
    spinner.start();
    return spinner;
}

//# sourceMappingURL=ora.js.map