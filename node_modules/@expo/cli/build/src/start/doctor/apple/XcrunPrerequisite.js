"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "XcrunPrerequisite", {
    enumerable: true,
    get: function() {
        return XcrunPrerequisite;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
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
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
const _delay = require("../../../utils/delay");
const _errors = require("../../../utils/errors");
const _prompts = require("../../../utils/prompts");
const _Prerequisite = require("../Prerequisite");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function isXcrunInstalledAsync() {
    try {
        (0, _child_process().execSync)('xcrun --version', {
            stdio: 'ignore'
        });
        return true;
    } catch  {
        return false;
    }
}
class XcrunPrerequisite extends _Prerequisite.Prerequisite {
    static #_ = this.instance = new XcrunPrerequisite();
    /**
   * Ensure Xcode CLI is installed.
   */ async assertImplementation() {
        if (await isXcrunInstalledAsync()) {
            // Run this second to ensure the Xcode version check is run.
            return;
        }
        async function pendingAsync() {
            if (!await isXcrunInstalledAsync()) {
                await (0, _delay.delayAsync)(100);
                return await pendingAsync();
            }
        }
        // This prompt serves no purpose accept informing the user what to do next, we could just open the App Store but it could be confusing if they don't know what's going on.
        const confirm = await (0, _prompts.confirmAsync)({
            initial: true,
            message: (0, _chalk().default)`Xcode {bold Command Line Tools} needs to be installed (requires {bold sudo}), continue?`
        });
        if (confirm) {
            try {
                await (0, _spawnasync().default)('sudo', [
                    'xcode-select',
                    '--install'
                ]);
                // Most likely the user will cancel the process, but if they don't this will continue checking until the CLI is available.
                return await pendingAsync();
            } catch  {
            // TODO: Figure out why this might get called (cancel early, network issues, server problems)
            // TODO: Handle me
            }
        }
        throw new _errors.AbortCommandError();
    }
}

//# sourceMappingURL=XcrunPrerequisite.js.map