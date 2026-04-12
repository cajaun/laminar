/** Accepts a package name (scoped or unscoped) and optionally with a specifier */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "parsePackageSpecifier", {
    enumerable: true,
    get: function() {
        return parsePackageSpecifier;
    }
});
function parsePackageSpecifier(specifier) {
    let idx = -1;
    if (specifier[0] === '@') {
        idx = specifier.indexOf('/', 1);
        if (idx === -1 || specifier.length - 1 <= idx) {
            return null;
        }
    }
    idx = specifier.indexOf('@', idx + 1);
    const packageName = idx > -1 ? specifier.slice(0, idx) : specifier;
    return packageName.length > 0 ? packageName : null;
}

//# sourceMappingURL=parsePackageSpecifier.js.map