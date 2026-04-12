"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "XcodeDeveloperDiskImagePrerequisite", {
    enumerable: true,
    get: function() {
        return XcodeDeveloperDiskImagePrerequisite;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _promises() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
    _promises = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../../log"));
const _Prerequisite = require("../Prerequisite");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const ERROR_CODE = 'XCODE_DEVELOPER_DISK_IMAGE';
async function getXcodePathAsync() {
    try {
        const { stdout } = await (0, _spawnasync().default)('xcode-select', [
            '-p'
        ]);
        if (stdout) {
            return stdout.trim();
        }
    } catch (error) {
        _log.debug(`Could not find Xcode path: %O`, error);
    }
    throw new _Prerequisite.PrerequisiteCommandError(ERROR_CODE, 'Unable to locate Xcode.');
}
class XcodeDeveloperDiskImagePrerequisite extends _Prerequisite.Prerequisite {
    static #_ = this.instance = new XcodeDeveloperDiskImagePrerequisite();
    async assertImplementation({ version }) {
        const xcodePath = await getXcodePathAsync();
        // Like "11.2 (15C107)"
        const versions = await _promises().default.readdir(`${xcodePath}/Platforms/iPhoneOS.platform/DeviceSupport/`);
        const prefix = version.match(/\d+\.\d+/);
        if (prefix === null) {
            throw new _Prerequisite.PrerequisiteCommandError(ERROR_CODE, `Invalid iOS version: ${version}`);
        }
        for (const directory of versions){
            if (directory.includes(prefix[0])) {
                return `${xcodePath}/Platforms/iPhoneOS.platform/DeviceSupport/${directory}/DeveloperDiskImage.dmg`;
            }
        }
        throw new _Prerequisite.PrerequisiteCommandError(ERROR_CODE, `Unable to find Developer Disk Image path for SDK ${version}.`);
    }
}

//# sourceMappingURL=XcodeDeveloperDiskImagePrerequisite.js.map