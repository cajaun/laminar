/** `lodash.memoize` */ "use strict";
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
    guardAsync: function() {
        return guardAsync;
    },
    memoize: function() {
        return memoize;
    }
});
function memoize(fn) {
    const cache = new Map();
    return (...args)=>{
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
function guardAsync(fn) {
    let invoked = false;
    let returnValue;
    const guard = async (...args)=>{
        if (!invoked) {
            invoked = true;
            returnValue = await fn(...args);
        }
        return returnValue;
    };
    return guard;
}

//# sourceMappingURL=fn.js.map