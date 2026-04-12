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
    canResolveDevClient: function() {
        return canResolveDevClient;
    },
    hasDirectDevClientDependency: function() {
        return hasDirectDevClientDependency;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
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
function hasDirectDevClientDependency(projectRoot) {
    const { dependencies = {}, devDependencies = {} } = (0, _config().getPackageJson)(projectRoot);
    return !!dependencies['expo-dev-client'] || !!devDependencies['expo-dev-client'];
}
function canResolveDevClient(projectRoot) {
    try {
        // we check if `expo-dev-launcher` is installed instead of `expo-dev-client`
        // because someone could install only launcher.
        (0, _resolvefrom().default)(projectRoot, 'expo-dev-launcher');
        return true;
    } catch  {
        return false;
    }
}

//# sourceMappingURL=detectDevClient.js.map