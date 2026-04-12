/**
 * Copyright © 2023 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "exportStandaloneServerAsync", {
    enumerable: true,
    get: function() {
        return exportStandaloneServerAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
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
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _nodechild_process() {
    const data = require("node:child_process");
    _nodechild_process = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _settings = require("../../api/settings");
const _log = require("../../log");
const _xcrun = require("../../start/platforms/ios/xcrun");
const _dir = require("../../utils/dir");
const _env = require("../../utils/env");
const _errors = require("../../utils/errors");
const _exportStaticAsync = require("../exportStaticAsync");
const _publicFolder = require("../publicFolder");
const _saveAssets = require("../saveAssets");
const _xcodeCompilerLogger = require("./xcodeCompilerLogger");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:export:server');
async function exportStandaloneServerAsync(projectRoot, devServer, { exp, pkg, files, options }) {
    var _exp_extra_router, _exp_extra, _exp_extra1;
    if (!options.eager) {
        await tryRemovingGeneratedOriginAsync(projectRoot, exp);
    }
    (0, _xcodeCompilerLogger.logInXcode)('Exporting server');
    // Store the server output in the project's .expo directory.
    const serverOutput = _path().default.join(projectRoot, '.expo/server', options.platform);
    // Remove the previous server output to prevent stale files.
    await (0, _dir.removeAsync)(serverOutput);
    // Export the API routes for server rendering the React Server Components.
    await (0, _exportStaticAsync.exportApiRoutesStandaloneAsync)(devServer, {
        files,
        platform: 'web',
        apiRoutesOnly: true
    });
    const publicPath = _path().default.resolve(projectRoot, _env.env.EXPO_PUBLIC_FOLDER);
    // Copy over public folder items
    await (0, _publicFolder.copyPublicFolderAsync)(publicPath, serverOutput);
    // Copy over the server output on top of the public folder.
    await (0, _saveAssets.persistMetroFilesAsync)(files, serverOutput);
    [
        ...files.entries()
    ].forEach(([key, value])=>{
        if (value.targetDomain === 'server') {
            // Delete server resources to prevent them from being exposed in the binary.
            files.delete(key);
        }
    });
    // TODO: Deprecate this in favor of a built-in prop that users should avoid setting.
    const userDefinedServerUrl = (_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_router = _exp_extra.router) == null ? void 0 : _exp_extra_router.origin;
    let serverUrl = userDefinedServerUrl;
    const shouldSkipServerDeployment = (()=>{
        if (!options.eager) {
            (0, _xcodeCompilerLogger.logInXcode)('Skipping server deployment because the script is not running in eager mode.');
            return true;
        }
        // Add an opaque flag to disable server deployment.
        if (_env.env.EXPO_NO_DEPLOY) {
            (0, _xcodeCompilerLogger.warnInXcode)('Skipping server deployment because environment variable EXPO_NO_DEPLOY is set.');
            return true;
        }
        // Can't safely deploy from Xcode since the PATH isn't set up correctly. We could amend this in the future and allow users who customize the PATH to deploy from Xcode.
        if ((0, _xcodeCompilerLogger.isExecutingFromXcodebuild)()) {
            // TODO: Don't warn when the eager bundle has been run.
            (0, _xcodeCompilerLogger.warnInXcode)('Skipping server deployment because the build is running from an Xcode run script. Build with Expo CLI or EAS Build to deploy the server automatically.');
            return true;
        }
        return false;
    })();
    // Deploy the server output to a hosting provider.
    const deployedServerUrl = shouldSkipServerDeployment ? false : await runServerDeployCommandAsync(projectRoot, {
        distDirectory: serverOutput,
        deployScript: getServerDeploymentScript(pkg.scripts, options.platform)
    });
    if (!deployedServerUrl) {
        return;
    }
    if (serverUrl) {
        (0, _xcodeCompilerLogger.logInXcode)(`Using custom server URL: ${serverUrl} (ignoring deployment URL: ${deployedServerUrl})`);
    }
    // If the user-defined server URL is not defined, use the deployed server URL.
    // This allows for overwriting the server URL in the project's native files.
    serverUrl ||= deployedServerUrl;
    // If the user hasn't manually defined the server URL, write the deployed server URL to the app.json.
    if (userDefinedServerUrl) {
        _log.Log.log('Skip automatically linking server origin to native container');
        return;
    }
    _log.Log.log('Writing generated server URL to app.json');
    // NOTE: Is is it possible to assert that the config needs to be modifiable before building the app?
    const modification = await (0, _config().modifyConfigAsync)(projectRoot, {
        extra: {
            ...exp.extra ?? {},
            router: {
                ...((_exp_extra1 = exp.extra) == null ? void 0 : _exp_extra1.router) ?? {},
                generatedOrigin: serverUrl
            }
        }
    }, {
        skipSDKVersionRequirement: true
    });
    if (modification.type !== 'success') {
        throw new _errors.CommandError(`Failed to write generated server origin to app.json because the file is dynamic and does not extend the static config. The client will not be able to make server requests to API routes or static files. You can disable server linking with EXPO_NO_DEPLOY=1 or by disabling server output in the app.json.`);
    }
}
async function dumpDeploymentLogs(projectRoot, logs, name = 'deploy') {
    const outputPath = _path().default.join(projectRoot, `.expo/logs/${name}.log`);
    await _fs().default.promises.mkdir(_path().default.dirname(outputPath), {
        recursive: true
    });
    debug('Dumping server deployment logs to: ' + outputPath);
    await _fs().default.promises.writeFile(outputPath, logs);
    return outputPath;
}
function getCommandBin(command) {
    try {
        return (0, _nodechild_process().execSync)(`command -v ${command}`, {
            stdio: 'pipe'
        }).toString().trim();
    } catch  {
        return null;
    }
}
async function runServerDeployCommandAsync(projectRoot, { distDirectory, deployScript }) {
    const logOfflineError = ()=>{
        const manualScript = deployScript ? `npm run ${deployScript.scriptName}` : `npx eas deploy --export-dir ${distDirectory}`;
        (0, _xcodeCompilerLogger.logMetroErrorInXcode)(projectRoot, _chalk().default.red`Running CLI in offline mode, skipping server deployment. Deploy manually with: ${manualScript}`);
    };
    if (_env.env.EXPO_OFFLINE) {
        logOfflineError();
        return false;
    }
    // TODO: Only allow EAS deployments when staging is enabled, this is because the feature is still staging-only.
    if (!_env.env.EXPO_UNSTABLE_DEPLOY_SERVER) {
        return false;
    }
    if (!_env.env.EAS_BUILD) {
        // This check helps avoid running EAS if the user isn't a user of EAS.
        // We only need to run it when building outside of EAS.
        const globalBin = getCommandBin('eas');
        if (!globalBin) {
            // This should never happen from EAS Builds.
            // Possible to happen when building locally with `npx expo run`
            (0, _xcodeCompilerLogger.logMetroErrorInXcode)(projectRoot, `eas-cli is not installed globally, skipping server deployment. Install EAS CLI with 'npm install -g eas-cli'.`);
            return false;
        }
        debug('Found eas-cli:', globalBin);
    }
    let json;
    try {
        let results;
        const spawnOptions = {
            cwd: projectRoot,
            // Ensures that errors can be caught.
            stdio: 'pipe'
        };
        // TODO: Support absolute paths in EAS CLI
        const exportDir = _path().default.relative(projectRoot, distDirectory);
        if (deployScript) {
            (0, _xcodeCompilerLogger.logInXcode)(`Using custom server deploy script: ${deployScript.scriptName}`);
            // Amend the path to try and make the custom scripts work.
            results = await (0, _spawnasync().default)('npm', [
                'run',
                deployScript.scriptName,
                `--export-dir=${exportDir}`
            ], spawnOptions);
        } else {
            (0, _xcodeCompilerLogger.logInXcode)('Deploying server to link with client');
            // results = DEPLOYMENT_SUCCESS_FIXTURE;
            results = await (0, _spawnasync().default)('npx', [
                'eas-cli',
                'deploy',
                '--non-interactive',
                '--json',
                `--export-dir=${exportDir}`
            ], spawnOptions);
            debug('Server deployment stdout:', results.stdout);
            // Send stderr to stderr. stdout is parsed as JSON.
            if (results.stderr) {
                process.stderr.write(results.stderr);
            }
        }
        const logPath = await dumpDeploymentLogs(projectRoot, results.output.join('\n'));
        try {
            // {
            //   "dashboardUrl": "https://staging.expo.dev/projects/6460c11c-e1bc-4084-882a-fd9f57b825b1/hosting/deployments",
            //   "identifier": "8a1pwbv6c5",
            //   "url": "https://sep30--8a1pwbv6c5.staging.expo.app"
            // }
            json = JSON.parse(results.stdout.trim());
        } catch  {
            (0, _xcodeCompilerLogger.logMetroErrorInXcode)(projectRoot, `Failed to parse server deployment JSON output. Check the logs for more information: ${logPath}`);
            return false;
        }
    } catch (error) {
        if ((0, _xcrun.isSpawnResultError)(error)) {
            const output = error.output.join('\n').trim() || error.toString();
            _log.Log.log(_chalk().default.dim('An error occurred while deploying server. Logs stored at: ' + await dumpDeploymentLogs(projectRoot, output, 'deploy-error')));
            // Likely a server offline or network error.
            if (output.match(/ENOTFOUND/)) {
                logOfflineError();
                // Print the raw error message to help provide more context.
                _log.Log.log(_chalk().default.dim(output));
                // Prevent any other network requests (unlikely for this command).
                (0, _settings.disableNetwork)();
                return false;
            }
            (0, _xcodeCompilerLogger.logInXcode)(output);
            if (output.match(/spawn eas ENOENT/)) {
                // EAS not installed.
                (0, _xcodeCompilerLogger.logMetroErrorInXcode)(projectRoot, `Server deployment failed because eas-cli cannot be accessed from the build script's environment (ENOENT). Install EAS CLI with 'npm install -g eas-cli'.`);
                return false;
            }
            if (error.stderr.match(/Must configure EAS project by running/)) {
                // EAS not configured, this can happen when building a project locally before building in EAS.
                // User must run `eas init`, `eas deploy`, or `eas build` first.
                // TODO: Should we fail the build here or just warn users?
                (0, _xcodeCompilerLogger.logMetroErrorInXcode)(projectRoot, `Skipping server deployment because EAS is not configured. Run 'eas init' before trying again, or disable server output in the project.`);
                return false;
            }
        }
        // Throw unhandled server deployment errors.
        throw error;
    }
    // Assert json format
    assertDeploymentJsonOutput(json);
    // Warn about the URL not being valid. This should never happen, but might be possible with third-parties.
    if (!canParseURL(json.url)) {
        (0, _xcodeCompilerLogger.warnInXcode)(`The server deployment URL is not a valid URL: ${json.url}`);
    }
    if (json.dashboardUrl) {
        (0, _xcodeCompilerLogger.logInXcode)(`Server dashboard: ${json.dashboardUrl}`);
    }
    (0, _xcodeCompilerLogger.logInXcode)(`Server deployed to: ${json.url}`);
    return json.url;
}
function canParseURL(url) {
    try {
        // eslint-disable-next-line no-new
        new URL(url);
        return true;
    } catch  {
        return false;
    }
}
function assertDeploymentJsonOutput(json) {
    if (!json || typeof json !== 'object' || typeof json.url !== 'string') {
        throw new Error('JSON output of server deployment command are not in the expected format: { url: "https://..." }');
    }
}
function getServerDeploymentScript(scripts, platform) {
    // Users can overwrite the default deployment script with:
    // { scripts: { "native:deploy": "eas deploy --json --non-interactive" } }
    // A quick search on GitHub showed that `native:deploy` is not used in any public repos yet.
    // https://github.com/search?q=%22native%3Adeploy%22+path%3Apackage.json&type=code
    const DEFAULT_SCRIPT_NAME = 'native:deploy';
    const scriptNames = [
        // DEFAULT_SCRIPT_NAME + ':' + platform,
        DEFAULT_SCRIPT_NAME
    ];
    for (const scriptName of scriptNames){
        if (scripts == null ? void 0 : scripts[scriptName]) {
            return {
                scriptName,
                script: scripts[scriptName]
            };
        }
    }
    return null;
}
/** We can try to remove the generated origin from the manifest when running outside of eager mode. Bundling is the last operation to run so the config will already be embedded with the origin. */ async function tryRemovingGeneratedOriginAsync(projectRoot, exp) {
    var _exp_extra_router, _exp_extra, _exp_extra1;
    if (_env.env.CI) {
        // Skip in CI since nothing is committed.
        return;
    }
    if (((_exp_extra = exp.extra) == null ? void 0 : (_exp_extra_router = _exp_extra.router) == null ? void 0 : _exp_extra_router.generatedOrigin) == null) {
        debug('No generated origin needs removing');
        return;
    }
    const modification = await (0, _config().modifyConfigAsync)(projectRoot, {
        extra: {
            ...exp.extra ?? {},
            router: {
                ...((_exp_extra1 = exp.extra) == null ? void 0 : _exp_extra1.router) ?? {},
                generatedOrigin: undefined
            }
        }
    }, {
        skipSDKVersionRequirement: true
    });
    if (modification.type !== 'success') {
        debug('Could not remove generated origin from manifest');
    } else {
        debug('Generated origin has been removed from manifest');
    }
}

//# sourceMappingURL=exportServer.js.map