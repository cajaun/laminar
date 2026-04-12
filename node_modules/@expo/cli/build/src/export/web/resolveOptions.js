"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveOptionsAsync", {
    enumerable: true,
    get: function() {
        return resolveOptionsAsync;
    }
});
async function resolveOptionsAsync(args) {
    return {
        clear: !!args['--clear'],
        dev: !!args['--dev']
    };
}

//# sourceMappingURL=resolveOptions.js.map