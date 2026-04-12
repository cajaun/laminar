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
    showLoginPromptAsync: function() {
        return showLoginPromptAsync;
    },
    tryGetUserAsync: function() {
        return tryGetUserAsync;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
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
const _otp = require("./otp");
const _user = require("./user");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
const _link = require("../../utils/link");
const _prompts = /*#__PURE__*/ _interop_require_wildcard(require("../../utils/prompts"));
const _client = require("../rest/client");
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
async function showLoginPromptAsync({ printNewLine = false, otp, ...options } = {}) {
    if (_env.env.EXPO_OFFLINE) {
        throw new _errors.CommandError('OFFLINE', 'Cannot authenticate in offline-mode');
    }
    const hasCredentials = options.username && options.password;
    const sso = options.sso;
    if (printNewLine) {
        _log.log();
    }
    if (sso) {
        await (0, _user.ssoLoginAsync)();
        return;
    }
    _log.log(hasCredentials ? `Logging in to EAS with email or username (exit and run 'npx expo login --help' for other login options)` : `Log in to EAS with email or username (exit and run 'npx expo login --help' for other login options)`);
    let username = options.username;
    let password = options.password;
    if (!hasCredentials) {
        const resolved = await (0, _prompts.default)([
            !options.username && {
                type: 'text',
                name: 'username',
                message: 'Email or username'
            },
            !options.password && {
                type: 'password',
                name: 'password',
                message: 'Password'
            }
        ].filter(Boolean), {
            nonInteractiveHelp: `Use the EXPO_TOKEN environment variable to authenticate in CI (${(0, _link.learnMore)('https://docs.expo.dev/accounts/programmatic-access/')})`
        });
        username ??= resolved.username;
        password ??= resolved.password;
    }
    // This is just for the types.
    (0, _assert().default)(username && password);
    try {
        await (0, _user.loginAsync)({
            username,
            password,
            otp
        });
    } catch (e) {
        if (e instanceof _client.ApiV2Error && e.expoApiV2ErrorCode === 'ONE_TIME_PASSWORD_REQUIRED') {
            await (0, _otp.retryUsernamePasswordAuthWithOTPAsync)(username, password, e.expoApiV2ErrorMetadata);
        } else {
            throw e;
        }
    }
}
async function tryGetUserAsync() {
    const user = await (0, _user.getUserAsync)().catch(()=>null);
    if (user) {
        return user;
    }
    const choices = [
        {
            title: 'Log in',
            value: true
        },
        {
            title: 'Proceed anonymously',
            value: false
        }
    ];
    const value = await (0, _prompts.selectAsync)((0, _chalk().default)`\n\nIt is recommended to log in with your Expo account before proceeding. \n{dim ${(0, _link.learnMore)('https://expo.fyi/unverified-app-expo-go')}}\n`, choices, {
        nonInteractiveHelp: `Use the EXPO_TOKEN environment variable to authenticate in CI (${(0, _link.learnMore)('https://docs.expo.dev/accounts/programmatic-access/')})`
    });
    if (value) {
        await showLoginPromptAsync({
            printNewLine: true
        });
        return await (0, _user.getUserAsync)() ?? null;
    }
    return null;
}

//# sourceMappingURL=actions.js.map