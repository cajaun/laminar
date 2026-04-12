// note(Simek): https://github.com/react-native-community/directory/blob/main/pages/api/libraries/check.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "checkPackagesCompatibility", {
    enumerable: true,
    get: function() {
        return checkPackagesCompatibility;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
const _log = require("../../log");
const _fetch = require("../../utils/fetch");
const _link = require("../../utils/link");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const ERROR_MESSAGE = 'Unable to fetch compatibility data from React Native Directory. Skipping check.';
async function checkPackagesCompatibility(packages) {
    try {
        const packagesToCheck = packages.filter((packageName)=>!packageName.startsWith('@expo/') && !packageName.startsWith('@expo-google-fonts/'));
        if (!packagesToCheck.length) {
            return;
        }
        const response = await (0, _fetch.fetch)('https://reactnative.directory/api/libraries/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                packages: packagesToCheck
            })
        });
        if (!response.ok) {
            _log.Log.log(_chalk().default.gray(ERROR_MESSAGE));
        }
        const packageMetadata = await response.json();
        const incompatiblePackages = packagesToCheck.filter((packageName)=>{
            var _packageMetadata_packageName;
            return ((_packageMetadata_packageName = packageMetadata[packageName]) == null ? void 0 : _packageMetadata_packageName.newArchitecture) === 'unsupported';
        });
        if (incompatiblePackages.length) {
            _log.Log.warn(_chalk().default.yellow(`${_chalk().default.bold('Warning')}: ${formatPackageNames(incompatiblePackages)} do${incompatiblePackages.length > 1 ? '' : 'es'} not support the New Architecture. ${(0, _link.learnMore)('https://docs.expo.dev/guides/new-architecture/')}`));
        }
    } catch  {
        _log.Log.log(_chalk().default.gray(ERROR_MESSAGE));
    }
}
function formatPackageNames(incompatiblePackages) {
    if (incompatiblePackages.length === 1) {
        return incompatiblePackages.join();
    }
    const lastPackage = incompatiblePackages.pop();
    return `${incompatiblePackages.join(', ')} and ${lastPackage}`;
}

//# sourceMappingURL=checkPackagesCompatibility.js.map