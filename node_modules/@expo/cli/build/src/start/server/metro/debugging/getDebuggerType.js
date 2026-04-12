/** Known compatible debuggers that require specific workarounds */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getDebuggerType", {
    enumerable: true,
    get: function() {
        return getDebuggerType;
    }
});
// Patterns to test against user agents
const CHROME_USER_AGENT = /chrome/i;
const VSCODE_USER_AGENT = /vscode/i;
function getDebuggerType(userAgent) {
    if (userAgent && CHROME_USER_AGENT.test(userAgent)) return 'chrome';
    if (userAgent && VSCODE_USER_AGENT.test(userAgent)) return 'vscode';
    return 'unknown';
}

//# sourceMappingURL=getDebuggerType.js.map