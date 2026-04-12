"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerAsync", {
    enumerable: true,
    get: function() {
        return registerAsync;
    }
});
const _env = require("../utils/env");
const _errors = require("../utils/errors");
const _interactive = require("../utils/interactive");
const _link = require("../utils/link");
const _open = require("../utils/open");
const _ora = require("../utils/ora");
async function registerAsync() {
    if (!(0, _interactive.isInteractive)()) {
        throw new _errors.CommandError('NON_INTERACTIVE', `Cannot register an account in CI. Use the EXPO_TOKEN environment variable to authenticate in CI (${(0, _link.learnMore)('https://docs.expo.dev/accounts/programmatic-access/')})`);
    } else if (_env.env.EXPO_OFFLINE) {
        throw new _errors.CommandError('OFFLINE', `Cannot register an account in offline-mode`);
    }
    const registrationUrl = `https://expo.dev/signup`;
    const failedMessage = `Unable to open a web browser. Register an account at: ${registrationUrl}`;
    const spinner = (0, _ora.ora)(`Opening ${registrationUrl}`).start();
    try {
        const opened = await (0, _open.openBrowserAsync)(registrationUrl);
        if (opened) {
            spinner.succeed(`Opened ${registrationUrl}`);
        } else {
            spinner.fail(failedMessage);
        }
    } catch (error) {
        spinner.fail(failedMessage);
        throw error;
    }
}

//# sourceMappingURL=registerAsync.js.map