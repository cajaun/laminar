#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoInstall", {
    enumerable: true,
    get: function() {
        return expoInstall;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _args = require("../utils/args");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const expoInstall = async (argv)=>{
    const args = (0, _args.assertWithOptionsArgs)({
        // Other options are parsed manually.
        '--help': Boolean,
        '--json': Boolean,
        // Aliases
        '-h': '--help'
    }, {
        argv,
        // Allow other options, we'll throw an error if unexpected values are passed.
        permissive: true
    });
    if (args['--help']) {
        (0, _args.printHelp)(`Install a module or other package to a project`, `npx expo install`, [
            `--check     Check which installed packages need to be updated`,
            '--dev       Save the dependencies as devDependencies',
            `--fix       Automatically update any invalid package versions`,
            (0, _chalk().default)`--npm       Use npm to install dependencies. {dim Default when package-lock.json exists}`,
            (0, _chalk().default)`--yarn      Use Yarn to install dependencies. {dim Default when yarn.lock exists}`,
            (0, _chalk().default)`--bun       Use bun to install dependencies. {dim Default when bun.lock or bun.lockb exists}`,
            (0, _chalk().default)`--pnpm      Use pnpm to install dependencies. {dim Default when pnpm-lock.yaml exists}`,
            `-h, --help  Usage info`,
            `--json      Output dependency information in JSON format with --check flag`
        ].join('\n'), [
            '',
            (0, _chalk().default)`  Additional options can be passed to the underlying install command by using {bold --}`,
            (0, _chalk().default)`    {dim $} npx expo install react -- --verbose`,
            (0, _chalk().default)`    {dim >} yarn add react --verbose`,
            ''
        ].join('\n'));
    }
    // Load modules after the help prompt so `npx expo install -h` shows as fast as possible.
    const { installAsync } = require('./installAsync');
    const { logCmdError } = require('../utils/errors');
    const { resolveArgsAsync } = require('./resolveOptions');
    const { variadic, options, extras } = await resolveArgsAsync(process.argv.slice(3)).catch(logCmdError);
    return installAsync(variadic, options, extras).catch(logCmdError);
};

//# sourceMappingURL=index.js.map