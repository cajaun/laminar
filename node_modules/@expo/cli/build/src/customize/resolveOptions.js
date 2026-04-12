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
const _variadic = require("../utils/variadic");
async function resolveArgsAsync(argv) {
    const { variadic, extras, flags } = (0, _variadic.parseVariadicArguments)(argv);
    (0, _variadic.assertUnexpectedObjectKeys)([], flags);
    return {
        // Variadic arguments like `npx expo install react react-dom` -> ['react', 'react-dom']
        variadic,
        options: {},
        extras
    };
}

//# sourceMappingURL=resolveOptions.js.map