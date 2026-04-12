"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "expoLint", {
    enumerable: true,
    get: function() {
        return expoLint;
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
const expoLint = async (argv)=>{
    const args = (0, _args.assertWithOptionsArgs)({
        // Other options are parsed manually.
        '--help': Boolean,
        '--no-cache': Boolean,
        '--fix': Boolean,
        '--quiet': Boolean,
        '--no-ignore': Boolean,
        // Aliases
        '-h': '--help'
    }, {
        argv,
        // Allow other options, we'll throw an error if unexpected values are passed.
        permissive: true
    });
    if (args['--help']) {
        (0, _args.printHelp)((0, _chalk().default)`Lint all files in {bold /src}, {bold /app}, {bold /components} directories with ESLint`, (0, _chalk().default)`npx expo lint {dim [path...] -- [eslint options]}`, [
            (0, _chalk().default)`[path...]                  List of files and directories to lint`,
            (0, _chalk().default)`--ext {dim <string>}             Additional file extensions to lint. {dim Default: .js, .jsx, .ts, .tsx, .mjs, .cjs}`,
            (0, _chalk().default)`--config {dim <path>}            Custom ESLint config file`,
            `--no-cache                 Check all files, instead of changes between runs`,
            `--fix                      Automatically fix problems`,
            (0, _chalk().default)`--fix-type {dim <string>}        Specify the types of fixes to apply. {dim Example: problem, suggestion, layout}`,
            `--no-ignore                Disable use of ignore files and patterns`,
            (0, _chalk().default)`--ignore-pattern {dim <string>}  Patterns of files to ignore`,
            `--quiet                    Only report errors`,
            (0, _chalk().default)`--max-warnings {dim <number>}    Number of warnings to trigger nonzero exit code`,
            `-h, --help                 Usage info`
        ].join('\n'), [
            '',
            (0, _chalk().default)`  Additional options can be passed to {bold npx eslint} by using {bold --}`,
            (0, _chalk().default)`    {dim $} npx expo lint -- --no-error-on-unmatched-pattern`,
            (0, _chalk().default)`    {dim >} npx eslint --no-error-on-unmatched-pattern {dim ...}`,
            ''
        ].join('\n'));
    }
    // Load modules after the help prompt so `npx expo lint -h` shows as fast as possible.
    const { lintAsync } = require('./lintAsync');
    const { logCmdError } = require('../utils/errors');
    const { resolveArgsAsync } = require('./resolveOptions');
    const { variadic, options, extras } = await resolveArgsAsync(process.argv.slice(3)).catch(logCmdError);
    return lintAsync(variadic, options, extras).catch(logCmdError);
};

//# sourceMappingURL=index.js.map