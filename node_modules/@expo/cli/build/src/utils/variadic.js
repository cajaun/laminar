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
    assertUnexpectedObjectKeys: function() {
        return assertUnexpectedObjectKeys;
    },
    assertUnexpectedVariadicFlags: function() {
        return assertUnexpectedVariadicFlags;
    },
    parseVariadicArguments: function() {
        return parseVariadicArguments;
    }
});
const _errors = require("../utils/errors");
const debug = require('debug')('expo:utils:variadic');
function parseVariadicArguments(argv, strFlags = []) {
    const variadic = [];
    const parsedFlags = {};
    let i = 0;
    while(i < argv.length){
        const arg = argv[i];
        if (!arg.startsWith('-')) {
            variadic.push(arg);
        } else if (arg === '--') {
            break;
        } else {
            const flagIndex = strFlags.indexOf(arg.split('=')[0]);
            if (flagIndex !== -1) {
                // Handle flags that expect a value
                const [flag, value] = arg.split('=');
                if (value !== undefined) {
                    // If the flag has a value inline (e.g., --flag=value)
                    if (parsedFlags[flag] === undefined) {
                        parsedFlags[flag] = value;
                    } else if (Array.isArray(parsedFlags[flag])) {
                        parsedFlags[flag].push(value);
                    } else {
                        parsedFlags[flag] = [
                            parsedFlags[flag],
                            value
                        ];
                    }
                } else {
                    const nextArg = argv[i + 1];
                    if (nextArg && !nextArg.startsWith('-')) {
                        if (parsedFlags[arg] === undefined) {
                            parsedFlags[arg] = nextArg;
                        } else if (Array.isArray(parsedFlags[arg])) {
                            parsedFlags[arg].push(nextArg);
                        } else {
                            parsedFlags[arg] = [
                                parsedFlags[arg],
                                nextArg
                            ];
                        }
                        i++; // Skip the next argument since it's part of the current flag
                    } else {
                        if (parsedFlags[arg] === undefined) {
                            parsedFlags[arg] = true; // Flag without a value
                        } else if (Array.isArray(parsedFlags[arg])) {
                            parsedFlags[arg].push(true);
                        } else {
                            parsedFlags[arg] = [
                                parsedFlags[arg],
                                true
                            ];
                        }
                    }
                }
            } else {
                if (parsedFlags[arg] === undefined) {
                    parsedFlags[arg] = true; // Unknown flag
                } else if (Array.isArray(parsedFlags[arg])) {
                    parsedFlags[arg].push(true);
                } else {
                    parsedFlags[arg] = [
                        parsedFlags[arg],
                        true
                    ];
                }
            }
        }
        i++;
    }
    // Everything after `--` that is not an option is passed to the underlying install command.
    const extras = [];
    const extraOperator = argv.indexOf('--');
    if (extraOperator > -1 && argv.length > extraOperator + 1) {
        const extraArgs = argv.slice(extraOperator + 1);
        if (extraArgs.includes('--')) {
            throw new _errors.CommandError('BAD_ARGS', 'Unexpected multiple --');
        }
        extras.push(...extraArgs);
        debug('Extra arguments: ' + extras.join(', '));
    }
    debug(`Parsed arguments (variadic: %O, flags: %O, extra: %O)`, variadic, parsedFlags, extras);
    return {
        variadic,
        flags: parsedFlags,
        extras
    };
}
function assertUnexpectedObjectKeys(keys, obj) {
    const unexpectedKeys = Object.keys(obj).filter((key)=>!keys.includes(key));
    if (unexpectedKeys.length > 0) {
        throw new _errors.CommandError('BAD_ARGS', `Unexpected: ${unexpectedKeys.join(', ')}`);
    }
}
function assertUnexpectedVariadicFlags(expectedFlags, { extras, flags, variadic }, prefixCommand = '') {
    const unexpectedFlags = Object.keys(flags).filter((key)=>!expectedFlags.includes(key));
    if (unexpectedFlags.length > 0) {
        const intendedFlags = Object.entries(flags).filter(([key])=>expectedFlags.includes(key)).map(([key])=>key);
        const cmd = [
            prefixCommand,
            ...variadic,
            ...intendedFlags,
            '--',
            ...extras.concat(unexpectedFlags)
        ].join(' ');
        throw new _errors.CommandError('BAD_ARGS', `Unexpected: ${unexpectedFlags.join(', ')}\nDid you mean: ${cmd.trim()}`);
    }
}

//# sourceMappingURL=variadic.js.map