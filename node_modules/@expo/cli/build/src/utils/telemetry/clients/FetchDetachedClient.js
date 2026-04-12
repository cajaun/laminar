"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FetchDetachedClient", {
    enumerable: true,
    get: function() {
        return FetchDetachedClient;
    }
});
function _nodechild_process() {
    const data = require("node:child_process");
    _nodechild_process = function() {
        return data;
    };
    return data;
}
function _nodefs() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:fs"));
    _nodefs = function() {
        return data;
    };
    return data;
}
function _nodepath() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:path"));
    _nodepath = function() {
        return data;
    };
    return data;
}
const _createTempPath = require("../../createTempPath");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:telemetry:client:detached');
class FetchDetachedClient {
    abort() {
        return this.records;
    }
    record(record) {
        this.records.push(...record.map((record)=>({
                ...record,
                originalTimestamp: record.sentAt
            })));
    }
    async flush() {
        try {
            if (!this.records.length) {
                return debug('No records to flush, skipping...');
            }
            const file = (0, _createTempPath.createTempFilePath)('expo-telemetry.json');
            const data = JSON.stringify({
                records: this.records
            });
            this.records = [];
            await _nodefs().default.promises.mkdir(_nodepath().default.dirname(file), {
                recursive: true
            });
            await _nodefs().default.promises.writeFile(file, data);
            const child = (0, _nodechild_process().spawn)(process.execPath, [
                require.resolve('./flushFetchDetached'),
                file
            ], {
                detached: true,
                windowsHide: true,
                shell: false,
                stdio: 'ignore'
            });
            child.unref();
        } catch (error) {
            // This could fail if any direct or indirect imports change during an upgrade to the `expo` dependency via `npx expo install --fix`,
            // since this file may no longer be present after the upgrade, but before the process under the old Expo CLI version is terminated.
            debug('Exception while initiating detached flush:', error);
        }
        debug('Detached flush started');
    }
    constructor(){
        /** This client should be used for short-lived commands */ this.strategy = 'detached';
        /** All recorded telemetry events */ this.records = [];
    }
}

//# sourceMappingURL=FetchDetachedClient.js.map