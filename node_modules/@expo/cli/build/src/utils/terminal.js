/** @returns the environment variable indicating the default terminal program to use. */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getUserTerminal", {
    enumerable: true,
    get: function() {
        return getUserTerminal;
    }
});
function getUserTerminal() {
    return process.env.REACT_TERMINAL || (process.platform === 'darwin' ? process.env.TERM_PROGRAM : process.env.TERM);
}

//# sourceMappingURL=terminal.js.map