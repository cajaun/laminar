"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isInteractive", {
    enumerable: true,
    get: function() {
        return isInteractive;
    }
});
const _env = require("./env");
function isInteractive() {
    return !_env.env.CI && process.stdout.isTTY;
}

//# sourceMappingURL=interactive.js.map