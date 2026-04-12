"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "customizeAsync", {
    enumerable: true,
    get: function() {
        return customizeAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
const _generate = require("./generate");
const _router = require("../start/server/metro/router");
const _platformBundlers = require("../start/server/platformBundlers");
const _findUp = require("../utils/findUp");
const _nodeEnv = require("../utils/nodeEnv");
async function customizeAsync(files, options, extras) {
    var _exp_web;
    (0, _nodeEnv.setNodeEnv)('development');
    // Locate the project root based on the process current working directory.
    // This enables users to run `npx expo customize` from a subdirectory of the project.
    const projectRoot = (0, _findUp.findUpProjectRootOrAssert)(process.cwd());
    require('@expo/env').load(projectRoot);
    // Get the static path (defaults to 'web/')
    // Doesn't matter if expo is installed or which mode is used.
    const { exp } = (0, _config().getConfig)(projectRoot, {
        skipSDKVersionRequirement: true
    });
    const routerRoot = (0, _router.getRouterDirectoryModuleIdWithManifest)(projectRoot, exp);
    // Create the destination resolution props which are used in both
    // the query and select functions.
    const props = {
        webStaticPath: ((_exp_web = exp.web) == null ? void 0 : _exp_web.staticPath) ?? (0, _platformBundlers.getPlatformBundlers)(projectRoot, exp).web === 'webpack' ? 'web' : 'public',
        appDirPath: routerRoot
    };
    // If the user provided files, we'll generate them without prompting.
    if (files.length) {
        return (0, _generate.queryAndGenerateAsync)(projectRoot, {
            files,
            props,
            extras
        });
    }
    // Otherwise, we'll prompt the user to select which files to generate.
    await (0, _generate.selectAndGenerateAsync)(projectRoot, {
        props,
        extras
    });
}

//# sourceMappingURL=customizeAsync.js.map