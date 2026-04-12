"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _nodefs() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:fs"));
    _nodefs = function() {
        return data;
    };
    return data;
}
const _FetchClient = require("./FetchClient");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const telemetryFile = process.argv[2];
flush().catch(()=>_nodefs().default.promises.unlink(telemetryFile)).finally(()=>process.exit(0));
async function flush() {
    if (!telemetryFile) return;
    let json;
    let data;
    try {
        json = await _nodefs().default.promises.readFile(telemetryFile, 'utf8');
        data = JSON.parse(json);
    } catch (error) {
        if (error.code === 'ENOENT') return;
        throw error;
    }
    if (data.records.length) {
        const client = new _FetchClient.FetchClient();
        await client.record(data.records);
        await client.flush();
    }
    await _nodefs().default.promises.unlink(telemetryFile);
}

//# sourceMappingURL=flushFetchDetached.js.map