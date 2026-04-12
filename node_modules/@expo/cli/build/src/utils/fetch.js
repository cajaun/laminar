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
    Headers: function() {
        return Headers;
    },
    fetch: function() {
        return fetch;
    }
});
const fetch = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch : require('undici').fetch;
const Headers = typeof globalThis.Headers !== 'undefined' ? globalThis.Headers : require('undici').Headers;

//# sourceMappingURL=fetch.js.map