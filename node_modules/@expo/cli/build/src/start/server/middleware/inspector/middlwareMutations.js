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
    prependMiddleware: function() {
        return prependMiddleware;
    },
    replaceMiddlewareWith: function() {
        return replaceMiddlewareWith;
    }
});
function prependMiddleware(app, middleware) {
    app.use(middleware);
    app.stack.unshift(app.stack.pop());
}
function replaceMiddlewareWith(app, sourceMiddleware, targetMiddleware) {
    const item = app.stack.find((middleware)=>middleware.handle === sourceMiddleware);
    if (item) {
        item.handle = targetMiddleware;
    }
}

//# sourceMappingURL=middlwareMutations.js.map