"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AsyncNgrok", {
    enumerable: true,
    get: function() {
        return AsyncNgrok;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _crypto() {
    const data = /*#__PURE__*/ _interop_require_default(require("crypto"));
    _crypto = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _slugify() {
    const data = /*#__PURE__*/ _interop_require_default(require("slugify"));
    _slugify = function() {
        return data;
    };
    return data;
}
const _UserSettings = require("../../api/user/UserSettings");
const _user = require("../../api/user/user");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
const _delay = require("../../utils/delay");
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
const _NgrokResolver = require("../doctor/ngrok/NgrokResolver");
const _adbReverse = require("../platforms/android/adbReverse");
const _settings = require("../project/settings");
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
const debug = require('debug')('expo:start:server:ngrok');
const NGROK_CONFIG = {
    authToken: '5W1bR67GNbWcXqmxZzBG1_56GezNeaX6sSRvn8npeQ8',
    domain: 'exp.direct'
};
const TUNNEL_TIMEOUT = 10 * 1000;
class AsyncNgrok {
    constructor(projectRoot, port){
        this.projectRoot = projectRoot;
        this.port = port;
        this.serverUrl = null;
        this.resolver = new _NgrokResolver.NgrokResolver(projectRoot);
    }
    getActiveUrl() {
        return this.serverUrl;
    }
    /** Exposed for testing. */ async _getIdentifyingUrlSegmentsAsync() {
        const user = await (0, _user.getUserAsync)();
        if ((user == null ? void 0 : user.__typename) === 'Robot') {
            throw new _errors.CommandError('NGROK_ROBOT', 'Cannot use ngrok with a robot user.');
        }
        const username = (0, _user.getActorDisplayName)(user);
        return [
            // NOTE: https://github.com/expo/expo/pull/16556#discussion_r822944286
            await this.getProjectRandomnessAsync(),
            // Strip out periods from the username to avoid subdomain issues with SSL certificates.
            (0, _slugify().default)(username, {
                remove: /\./
            }),
            // Use the port to distinguish between multiple tunnels (webpack, metro).
            String(this.port)
        ];
    }
    /** Exposed for testing. */ async _getProjectHostnameAsync() {
        return `${(await this._getIdentifyingUrlSegmentsAsync()).join('-')}.${NGROK_CONFIG.domain}`;
    }
    /** Exposed for testing. */ async _getProjectSubdomainAsync() {
        return (await this._getIdentifyingUrlSegmentsAsync()).join('-');
    }
    /** Start ngrok on the given port for the project. */ async startAsync({ timeout } = {}) {
        // Ensure the instance is loaded first, this can linger so we should run it before the timeout.
        await this.resolver.resolveAsync({
            // For now, prefer global install since the package has native code (harder to install) and doesn't change very often.
            prefersGlobalInstall: true
        });
        // NOTE(EvanBacon): If the user doesn't have ADB installed,
        // then skip attempting to reverse the port.
        if ((0, _adbReverse.hasAdbReverseAsync)()) {
            // Ensure ADB reverse is running.
            if (!await (0, _adbReverse.startAdbReverseAsync)([
                this.port
            ])) {
                // TODO: Better error message.
                throw new _errors.CommandError('NGROK_ADB', `Cannot start tunnel URL because \`adb reverse\` failed for the connected Android device(s).`);
            }
        }
        this.serverUrl = await this._connectToNgrokAsync({
            timeout
        });
        debug('Tunnel URL:', this.serverUrl);
        _log.log('Tunnel ready.');
    }
    /** Stop the ngrok process if it's running. */ async stopAsync() {
        var _this_resolver_get_kill, _this_resolver_get;
        debug('Stopping Tunnel');
        await ((_this_resolver_get = this.resolver.get()) == null ? void 0 : (_this_resolver_get_kill = _this_resolver_get.kill) == null ? void 0 : _this_resolver_get_kill.call(_this_resolver_get));
        this.serverUrl = null;
    }
    /** Exposed for testing. */ async _connectToNgrokAsync(options = {}, attempts = 0) {
        // Attempt to stop any hanging processes, this increases the chances of a successful connection.
        await this.stopAsync();
        // Get the instance quietly or assert otherwise.
        const instance = await this.resolver.resolveAsync({
            shouldPrompt: false,
            autoInstall: false
        });
        // TODO(Bacon): Consider dropping the timeout functionality:
        // https://github.com/expo/expo/pull/16556#discussion_r822307373
        const results = await (0, _delay.resolveWithTimeout)(()=>this.connectToNgrokInternalAsync(instance, attempts), {
            timeout: options.timeout ?? TUNNEL_TIMEOUT,
            errorMessage: 'ngrok tunnel took too long to connect.'
        });
        if (typeof results === 'string') {
            return results;
        }
        // Wait 100ms and then try again
        await (0, _delay.delayAsync)(100);
        return this._connectToNgrokAsync(options, attempts + 1);
    }
    async _getConnectionPropsAsync() {
        const userDefinedSubdomain = _env.env.EXPO_TUNNEL_SUBDOMAIN;
        if (userDefinedSubdomain) {
            const subdomain = typeof userDefinedSubdomain === 'string' ? userDefinedSubdomain : await this._getProjectSubdomainAsync();
            debug('Subdomain:', subdomain);
            return {
                subdomain
            };
        } else {
            const hostname = await this._getProjectHostnameAsync();
            debug('Hostname:', hostname);
            return {
                hostname
            };
        }
    }
    async connectToNgrokInternalAsync(instance, attempts = 0) {
        try {
            // Global config path.
            const configPath = _path().join((0, _UserSettings.getSettingsDirectory)(), 'ngrok.yml');
            debug('Global config path:', configPath);
            const urlProps = await this._getConnectionPropsAsync();
            const url = await instance.connect({
                ...urlProps,
                authtoken: NGROK_CONFIG.authToken,
                configPath,
                onStatusChange (status) {
                    if (status === 'closed') {
                        _log.error(_chalk().default.red('Tunnel connection has been closed. This is often related to intermittent connection issues between the dev server and ngrok. Restart the dev server to try connecting to ngrok again.') + _chalk().default.gray('\nCheck the Ngrok status page for outages: https://status.ngrok.com/'));
                    } else if (status === 'connected') {
                        _log.log('Tunnel connected.');
                    }
                },
                port: this.port
            });
            return url;
        } catch (error) {
            const assertNgrok = ()=>{
                if ((0, _NgrokResolver.isNgrokClientError)(error)) {
                    var _error_body_details;
                    throw new _errors.CommandError('NGROK_CONNECT', [
                        error.body.msg,
                        (_error_body_details = error.body.details) == null ? void 0 : _error_body_details.err,
                        _chalk().default.gray('Check the Ngrok status page for outages: https://status.ngrok.com/')
                    ].filter(Boolean).join('\n\n'));
                }
                throw new _errors.CommandError('NGROK_CONNECT', error.toString() + _chalk().default.gray('\nCheck the Ngrok status page for outages: https://status.ngrok.com/'));
            };
            // Attempt to connect 3 times
            if (attempts >= 2) {
                assertNgrok();
            }
            // Attempt to fix the issue
            if ((0, _NgrokResolver.isNgrokClientError)(error) && error.body.error_code === 103) {
                // Assert early if a custom subdomain is used since it cannot
                // be changed and retried. If the tunnel subdomain is a boolean
                // then we can reset the randomness and try again.
                if (typeof _env.env.EXPO_TUNNEL_SUBDOMAIN === 'string') {
                    assertNgrok();
                }
                // Change randomness to avoid conflict if killing ngrok doesn't help
                await this._resetProjectRandomnessAsync();
            }
            return false;
        }
    }
    async getProjectRandomnessAsync() {
        const { urlRandomness: randomness } = await _settings.ProjectSettings.readAsync(this.projectRoot);
        if (randomness && /^[A-Za-z0-9]/.test(randomness)) {
            return randomness;
        }
        return await this._resetProjectRandomnessAsync();
    }
    async _resetProjectRandomnessAsync() {
        let randomness;
        do {
            randomness = _crypto().default.randomBytes(5).toString('base64url');
        }while (randomness.startsWith('_')); // _ is an invalid character for a hostname
        await _settings.ProjectSettings.setAsync(this.projectRoot, {
            urlRandomness: randomness
        });
        debug('Resetting project randomness:', randomness);
        return randomness;
    }
}

//# sourceMappingURL=AsyncNgrok.js.map