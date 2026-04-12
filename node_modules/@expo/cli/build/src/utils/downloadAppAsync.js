"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "downloadAppAsync", {
    enumerable: true,
    get: function() {
        return downloadAppAsync;
    }
});
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
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
function _stream() {
    const data = require("stream");
    _stream = function() {
        return data;
    };
    return data;
}
function _undici() {
    const data = require("undici");
    _undici = function() {
        return data;
    };
    return data;
}
function _util() {
    const data = require("util");
    _util = function() {
        return data;
    };
    return data;
}
const _createTempPath = require("./createTempPath");
const _dir = require("./dir");
const _errors = require("./errors");
const _tar = require("./tar");
const _client = require("../api/rest/client");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:utils:downloadAppAsync');
const TIMER_DURATION = 30000;
const pipeline = (0, _util().promisify)(_stream().Stream.pipeline);
async function downloadAsync({ url, outputPath, cacheDirectory, onProgress }) {
    let fetchInstance = _client.fetchAsync;
    if (cacheDirectory) {
        // Reconstruct the cached fetch since caching could be disabled.
        fetchInstance = (0, _client.createCachedFetch)({
            // We'll use a 1 week cache for versions so older values get flushed out eventually.
            ttl: 1000 * 60 * 60 * 24 * 7,
            // Users can also nuke their `~/.expo` directory to clear the cache.
            cacheDirectory
        });
    }
    debug(`Downloading ${url} to ${outputPath}`);
    const res = await fetchInstance(url, {
        onProgress,
        dispatcher: new (_undici()).Agent({
            connectTimeout: TIMER_DURATION
        })
    });
    if (!res.ok || !res.body) {
        throw new _errors.CommandError('FILE_DOWNLOAD', `Unexpected response: ${res.statusText}. From url: ${url}`);
    }
    return pipeline(_stream().Readable.fromWeb(res.body), _fs().default.createWriteStream(outputPath));
}
async function downloadAppAsync({ url, outputPath, extract = false, cacheDirectory, onProgress }) {
    if (extract) {
        // For iOS we download the ipa to a file then pass that file into the extractor.
        // In the future we should just pipe the `res.body -> tar.extract` directly.
        // I tried this and it created some weird errors where observing the data stream
        // would corrupt the file causing tar to fail with `TAR_BAD_ARCHIVE`.
        const tmpPath = (0, _createTempPath.createTempFilePath)(_path().default.basename(outputPath));
        await downloadAsync({
            url,
            outputPath: tmpPath,
            cacheDirectory,
            onProgress
        });
        debug(`Extracting ${tmpPath} to ${outputPath}`);
        await (0, _dir.ensureDirectoryAsync)(outputPath);
        await (0, _tar.extractAsync)(tmpPath, outputPath);
    } else {
        await (0, _dir.ensureDirectoryAsync)(_path().default.dirname(outputPath));
        await downloadAsync({
            url,
            outputPath,
            cacheDirectory,
            onProgress
        });
    }
}

//# sourceMappingURL=downloadAppAsync.js.map