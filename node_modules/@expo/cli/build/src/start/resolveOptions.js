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
    resolveHostType: function() {
        return resolveHostType;
    },
    resolveOptionsAsync: function() {
        return resolveOptionsAsync;
    },
    resolvePortsAsync: function() {
        return resolvePortsAsync;
    },
    resolveSchemeAsync: function() {
        return resolveSchemeAsync;
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
const _detectDevClient = require("./detectDevClient");
const _log = require("../log");
const _env = require("../utils/env");
const _errors = require("../utils/errors");
const _port = require("../utils/port");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function resolveOptionsAsync(projectRoot, args) {
    if (args['--dev-client'] && args['--go']) {
        throw new _errors.CommandError('BAD_ARGS', 'Cannot use both --dev-client and --go together.');
    }
    const host = resolveHostType({
        host: args['--host'],
        offline: args['--offline'],
        lan: args['--lan'],
        localhost: args['--localhost'],
        tunnel: args['--tunnel']
    });
    if (args['--https']) {
        _log.Log.warn((0, _chalk().default)`{bold --https} option is deprecated in favor of {bold --tunnel}`);
    }
    // User can force the default target by passing either `--dev-client` or `--go`. They can also
    // swap between them during development by pressing `s`.
    const isUserDefinedDevClient = !!args['--dev-client'] || (args['--go'] == null ? false : !args['--go']);
    // If the user didn't specify `--dev-client` or `--go` we check if they have the dev client package
    // in their package.json.
    const isAutoDevClient = args['--dev-client'] == null && args['--go'] == null && (0, _detectDevClient.hasDirectDevClientDependency)(projectRoot);
    const isDevClient = isAutoDevClient || isUserDefinedDevClient;
    const scheme = await resolveSchemeAsync(projectRoot, {
        scheme: args['--scheme'],
        devClient: isDevClient
    });
    return {
        privateKeyPath: args['--private-key-path'] ?? null,
        android: !!args['--android'],
        web: !!args['--web'],
        ios: !!args['--ios'],
        offline: !!args['--offline'],
        clear: !!args['--clear'],
        dev: !args['--no-dev'],
        https: !!args['--https'],
        maxWorkers: args['--max-workers'],
        port: args['--port'],
        minify: !!args['--minify'],
        devClient: isDevClient,
        scheme,
        host
    };
}
async function resolveSchemeAsync(projectRoot, options) {
    if (typeof options.scheme === 'string') {
        // Use the custom scheme
        return options.scheme ?? null;
    }
    if (options.devClient || (0, _detectDevClient.canResolveDevClient)(projectRoot)) {
        const { getOptionalDevClientSchemeAsync } = require('../utils/scheme');
        // Attempt to find the scheme or warn the user how to setup a custom scheme
        const resolvedScheme = await getOptionalDevClientSchemeAsync(projectRoot);
        if (!resolvedScheme.scheme) {
            if (resolvedScheme.resolution === 'shared') {
                // This can happen if one of the native projects has no URI schemes defined in it.
                // Normally, this should never happen.
                _log.Log.warn((0, _chalk().default)`Could not find a shared URI scheme for the dev client between the local {bold /ios} and {bold /android} directories. App launches (QR code, interstitial, terminal keys) may not work as expected. You can configure a custom scheme using the {bold --scheme} option, or by running {bold npx expo prebuild} to regenerate the native directories with URI schemes.`);
            } else if ([
                'ios',
                'android'
            ].includes(resolvedScheme.resolution)) {
                _log.Log.warn((0, _chalk().default)`The {bold /${resolvedScheme.resolution}} project does not contain any URI schemes. Expo CLI will not be able to use links to launch the project. You can configure a custom URI scheme using the {bold --scheme} option.`);
            }
        }
        return resolvedScheme.scheme;
    } else {
        // Ensure this is reset when users don't use `--scheme`, `--dev-client` and don't have the `expo-dev-client` package installed.
        return null;
    }
}
function resolveHostType(options) {
    if ([
        options.offline,
        options.host,
        options.lan,
        options.localhost,
        options.tunnel
    ].filter((i)=>i).length > 1) {
        throw new _errors.CommandError('BAD_ARGS', 'Specify at most one of: --offline, --host, --tunnel, --lan, --localhost');
    }
    if (options.offline) {
        // Force `lan` in offline mode.
        return 'lan';
    } else if (options.host) {
        _assert().default.match(options.host, /^(lan|tunnel|localhost)$/);
        return options.host;
    } else if (options.tunnel) {
        return 'tunnel';
    } else if (options.lan) {
        return 'lan';
    } else if (options.localhost) {
        return 'localhost';
    }
    // If no option is provided, and we are running in Stackblitz, enable tunnel by default
    if ((0, _env.envIsWebcontainer)()) {
        return 'tunnel';
    }
    return 'lan';
}
async function resolvePortsAsync(projectRoot, options, settings) {
    const multiBundlerSettings = {};
    if (settings.webOnly) {
        const webpackPort = await (0, _port.resolvePortAsync)(projectRoot, {
            defaultPort: options.port,
            // Default web port
            fallbackPort: 19006
        });
        if (!webpackPort) {
            throw new _errors.AbortCommandError();
        }
        multiBundlerSettings.webpackPort = webpackPort;
    } else {
        const fallbackPort = process.env.RCT_METRO_PORT ? parseInt(process.env.RCT_METRO_PORT, 10) : 8081;
        const metroPort = await (0, _port.resolvePortAsync)(projectRoot, {
            defaultPort: options.port,
            fallbackPort
        });
        if (!metroPort) {
            throw new _errors.AbortCommandError();
        }
        multiBundlerSettings.metroPort = metroPort;
    }
    return multiBundlerSettings;
}

//# sourceMappingURL=resolveOptions.js.map