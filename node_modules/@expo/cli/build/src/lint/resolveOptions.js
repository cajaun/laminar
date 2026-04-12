"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveArgsAsync", {
    enumerable: true,
    get: function() {
        return resolveArgsAsync;
    }
});
const _errors = require("../utils/errors");
const _resolveArgs = require("../utils/resolveArgs");
const _variadic = require("../utils/variadic");
function splitCommaSeparatedList(argName, list) {
    if (list == null) return [];
    (0, _resolveArgs.assertNonBooleanArg)(argName, list);
    if (typeof list === 'string') {
        return list.split(',').map((item)=>item.trim());
    }
    if (Array.isArray(list)) {
        return list.map((item)=>splitCommaSeparatedList(argName, item)).flat();
    }
    if (typeof list === 'boolean') {
        throw new _errors.CommandError(`Expected a string input for arg ${argName}`);
    }
    throw new _errors.CommandError(`Expected a string or an array for arg ${argName}, but got: ${typeof list}`);
}
function resolveOptions(options) {
    return {
        ...options,
        ext: splitCommaSeparatedList('--ext', options.ext),
        fixType: splitCommaSeparatedList('--fix-type', options.fixType),
        config: options.config
    };
}
async function resolveArgsAsync(argv) {
    const knownFlags = [
        '--ext',
        '--config',
        '--no-cache',
        '--fix',
        '--fix-type',
        '--no-ignore',
        '--ignore-pattern',
        '--quiet',
        '--max-warnings'
    ];
    const { variadic, extras, flags } = (0, _variadic.parseVariadicArguments)(argv, [
        // Just non-boolean flags
        '--ext',
        '--config',
        '--fix-type',
        '--ignore-pattern',
        '--max-warnings'
    ]);
    (0, _variadic.assertUnexpectedVariadicFlags)(knownFlags, {
        variadic,
        extras,
        flags
    }, 'npx expo lint');
    const config = flags['--config'];
    assertSingleStringInput('--config', config);
    return {
        // Variadic arguments like `npx expo install react react-dom` -> ['react', 'react-dom']
        variadic,
        options: resolveOptions({
            ext: splitCommaSeparatedList('--ext', flags['--ext']),
            config: assertSingleStringInput('--config', config),
            cache: !getBooleanArg('--no-cache', flags['--no-cache']),
            fix: !!getBooleanArg('--fix', flags['--fix']),
            fixType: splitCommaSeparatedList('--fix-type', flags['--fix-type']),
            ignore: !getBooleanArg('--no-ignore', flags['--no-ignore']),
            ignorePattern: splitCommaSeparatedList('--ignore-pattern', flags['--ignore-pattern']),
            quiet: !!getBooleanArg('--quiet', flags['--quiet']),
            maxWarnings: Number(flags['--max-warnings']) ?? -1
        }),
        extras
    };
}
function assertSingleStringInput(argName, arg) {
    if (!arg) {
        return arg;
    }
    (0, _resolveArgs.assertNonBooleanArg)(argName, arg);
    if (Array.isArray(arg) && arg.length > 1) {
        throw new _errors.CommandError('BAD_ARGS', `Too many values provided for arg ${argName}. Provide only one of: ${arg.join(', ')}`);
    }
    return arg;
}
function getBooleanArg(argName, arg) {
    if (arg == null) {
        return undefined;
    }
    if (typeof arg === 'boolean') {
        return arg;
    }
    if (typeof arg === 'string') {
        if (arg === 'true' || arg === '1' || arg === '') {
            return true;
        }
        if (arg === 'false' || arg === '0') {
            return false;
        }
    }
    if (Array.isArray(arg)) {
        if (arg.length > 1) {
            throw new _errors.CommandError('BAD_ARGS', `Too many ${argName} args provided.`);
        } else {
            return getBooleanArg(argName, arg[0]);
        }
    }
    throw new _errors.CommandError('BAD_ARGS', `Expected a boolean input for arg ${argName}`);
}

//# sourceMappingURL=resolveOptions.js.map