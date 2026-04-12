"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getValidBinaryPathAsync", {
    enumerable: true,
    get: function() {
        return getValidBinaryPathAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}
function _glob() {
    const data = require("glob");
    _glob = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _createTempPath = require("../../utils/createTempPath");
const _errors = require("../../utils/errors");
const _plist = require("../../utils/plist");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:run:ios:binary');
async function getValidBinaryPathAsync(input, props) {
    const resolved = _path().default.resolve(input);
    if (!_fs().default.existsSync(resolved)) {
        throw new _errors.CommandError(`The path to the iOS binary does not exist: ${resolved}`);
    }
    // If the file is an ipa then move it to a temp directory and extract the app binary.
    if (resolved.endsWith('.ipa')) {
        const outputPath = (0, _createTempPath.createTempDirectoryPath)();
        debug('Extracting IPA:', resolved, outputPath);
        const appDir = await extractIpaAsync(resolved, outputPath);
        if (props.isSimulator) {
            assertProvisionedForSimulator(appDir);
        } else {
        // TODO: Assert provisioned for devices in the future (this is difficult).
        }
        return appDir;
    }
    return resolved;
}
async function extractIpaAsync(ipaPath, outputPath) {
    // Create the output directory if it does not exist
    if (!_fs().default.existsSync(outputPath)) {
        _fs().default.mkdirSync(outputPath, {
            recursive: true
        });
    }
    // Use the unzip command to extract the IPA file
    try {
        await (0, _spawnasync().default)('unzip', [
            '-o',
            ipaPath,
            '-d',
            outputPath
        ]);
    } catch (error) {
        throw new Error(`Error extracting IPA: ${error.message}`);
    }
    const appBinPaths = await (0, _glob().glob)('Payload/*.app', {
        cwd: outputPath,
        absolute: true,
        maxDepth: 2
    });
    if (appBinPaths.length === 0) {
        throw new Error('No .app directory found in the IPA');
    }
    return appBinPaths[0];
}
async function assertProvisionedForSimulator(appPath) {
    const provisionPath = _path().default.join(appPath, 'embedded.mobileprovision');
    if (!_fs().default.existsSync(provisionPath)) {
        // This can often result in false positives.
        debug('No embedded.mobileprovision file found. Likely provisioned for simulator.');
        return;
    }
    const provisionData = _fs().default.readFileSync(provisionPath, 'utf8');
    const start = provisionData.indexOf('<?xml');
    const end = provisionData.indexOf('</plist>') + 8;
    const plistData = provisionData.substring(start, end);
    const parsedData = await (0, _plist.parsePlistAsync)(plistData);
    const platforms = parsedData['ProvisionsAllDevices'];
    if (platforms) {
        throw new _errors.CommandError('The app binary is provisioned for devices, and cannot be run on simulators.');
    }
}

//# sourceMappingURL=validateExternalBinary.js.map