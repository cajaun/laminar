"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getPlatformBundlers", {
    enumerable: true,
    get: function() {
        return getPlatformBundlers;
    }
});
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getPlatformBundlers(projectRoot, exp) {
    var _exp_web, _exp_ios, _exp_android;
    /**
   * SDK 50+: The web bundler is dynamic based upon the presence of the `@expo/webpack-config` package.
   */ let web = (_exp_web = exp.web) == null ? void 0 : _exp_web.bundler;
    if (!web) {
        const resolved = _resolvefrom().default.silent(projectRoot, '@expo/webpack-config/package.json');
        web = resolved ? 'webpack' : 'metro';
    }
    return {
        // @ts-expect-error: not on type yet
        ios: ((_exp_ios = exp.ios) == null ? void 0 : _exp_ios.bundler) ?? 'metro',
        // @ts-expect-error: not on type yet
        android: ((_exp_android = exp.android) == null ? void 0 : _exp_android.bundler) ?? 'metro',
        web
    };
}

//# sourceMappingURL=platformBundlers.js.map