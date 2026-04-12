"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SecurityBinPrerequisite", {
    enumerable: true,
    get: function() {
        return SecurityBinPrerequisite;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
const _Prerequisite = require("./Prerequisite");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class SecurityBinPrerequisite extends _Prerequisite.Prerequisite {
    static #_ = this.instance = new SecurityBinPrerequisite();
    async assertImplementation() {
        try {
            // make sure we can run security
            await (0, _spawnasync().default)('which', [
                'security'
            ]);
        } catch  {
            throw new _Prerequisite.PrerequisiteCommandError('SECURITY_BIN', "Cannot code sign project because the CLI `security` is not available on your computer.\nEnsure it's installed and try again.");
        }
    }
}

//# sourceMappingURL=SecurityBinPrerequisite.js.map