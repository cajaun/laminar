"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "pageIsSupported", {
    enumerable: true,
    get: function() {
        return pageIsSupported;
    }
});
function pageIsSupported(page) {
    var _page_reactNative;
    // @ts-expect-error No good way to filter this properly in TypeScript
    const capabilities = page.capabilities ?? ((_page_reactNative = page.reactNative) == null ? void 0 : _page_reactNative.capabilities) ?? {};
    return page.title === 'React Native Experimental (Improved Chrome Reloads)' || capabilities.nativePageReloads === true;
}

//# sourceMappingURL=pageIsSupported.js.map