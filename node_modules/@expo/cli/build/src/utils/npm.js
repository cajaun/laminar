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
    downloadAndExtractNpmModuleAsync: function() {
        return downloadAndExtractNpmModuleAsync;
    },
    extractLocalNpmTarballAsync: function() {
        return extractLocalNpmTarballAsync;
    },
    extractNpmTarballAsync: function() {
        return extractNpmTarballAsync;
    },
    extractNpmTarballFromUrlAsync: function() {
        return extractNpmTarballFromUrlAsync;
    },
    getNpmUrlAsync: function() {
        return getNpmUrlAsync;
    },
    npmViewAsync: function() {
        return npmViewAsync;
    },
    sanitizeNpmPackageName: function() {
        return sanitizeNpmPackageName;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _crypto() {
    const data = /*#__PURE__*/ _interop_require_default(require("crypto"));
    _crypto = function() {
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
function _slugify() {
    const data = /*#__PURE__*/ _interop_require_default(require("slugify"));
    _slugify = function() {
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
function _tar() {
    const data = require("tar");
    _tar = function() {
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
const _createFileTransform = require("./createFileTransform");
const _dir = require("./dir");
const _errors = require("./errors");
const _client = require("../api/rest/client");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:utils:npm');
const cachedFetch = (0, _client.createCachedFetch)({
    cacheDirectory: 'template-cache'
});
function sanitizeNpmPackageName(name) {
    // https://github.com/npm/validate-npm-package-name/#naming-rules
    return applyKnownNpmPackageNameRules(name) || applyKnownNpmPackageNameRules((0, _slugify().default)(name)) || // If nothing is left use 'app' like we do in Xcode projects.
    'app';
}
function applyKnownNpmPackageNameRules(name) {
    // https://github.com/npm/validate-npm-package-name/#naming-rules
    // package name cannot start with '.' or '_'.
    while(/^(\.|_)/.test(name)){
        name = name.substring(1);
    }
    name = name.toLowerCase().replace(/[^a-zA-Z._\-/@]/g, '');
    return name// .replace(/![a-z0-9-._~]+/g, '')
    // Remove special characters
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') || null;
}
async function npmViewAsync(...props) {
    var _stdout;
    const cmd = [
        'view',
        ...props,
        '--json'
    ];
    const results = (_stdout = (await (0, _spawnasync().default)('npm', cmd)).stdout) == null ? void 0 : _stdout.trim();
    const cmdString = `npm ${cmd.join(' ')}`;
    debug('Run:', cmdString);
    if (!results) {
        return null;
    }
    try {
        return JSON.parse(results);
    } catch (error) {
        throw new Error(`Could not parse JSON returned from "${cmdString}".\n\n${results}\n\nError: ${error.message}`);
    }
}
async function getNpmUrlAsync(packageName) {
    const results = await npmViewAsync(packageName, 'dist');
    (0, _assert().default)(results, `Could not get npm url for package "${packageName}"`);
    // Fully qualified url returns an object.
    // Example:
    // 𝝠 npm view expo-template-bare-minimum@sdk-33 dist --json
    if (typeof results === 'object' && !Array.isArray(results)) {
        return results.tarball;
    }
    // When the tag is arbitrary, the tarball is an array, return the last value as it's the most recent.
    // Example:
    // 𝝠 npm view expo-template-bare-minimum@33 dist --json
    if (Array.isArray(results)) {
        const lastResult = results[results.length - 1];
        if (lastResult && typeof lastResult === 'object' && !Array.isArray(lastResult)) {
            return lastResult.tarball;
        }
    }
    throw new _errors.CommandError('Expected results of `npm view ...` to be an array or string. Instead found: ' + results);
}
// @ts-ignore
const pipeline = (0, _util().promisify)(_stream().Stream.pipeline);
async function downloadAndExtractNpmModuleAsync(npmName, props) {
    const url = await getNpmUrlAsync(npmName);
    debug('Fetch from URL:', url);
    return await extractNpmTarballFromUrlAsync(url, props);
}
async function extractLocalNpmTarballAsync(tarFilePath, props) {
    const readStream = _fs().default.createReadStream(tarFilePath);
    return await extractNpmTarballAsync(readStream, props);
}
async function createUrlStreamAsync(url) {
    const response = await cachedFetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Unexpected response: ${response.statusText}. From url: ${url}`);
    }
    return _stream().Readable.fromWeb(response.body);
}
async function extractNpmTarballFromUrlAsync(url, props) {
    return await extractNpmTarballAsync(await createUrlStreamAsync(url), props);
}
async function extractNpmTarballAsync(stream, props) {
    const { cwd, strip, name, fileList = [], filter } = props;
    await (0, _dir.ensureDirectoryAsync)(cwd);
    const hash = _crypto().default.createHash(props.checksumAlgorithm ?? 'md5');
    const transformStream = new (_stream()).PassThrough();
    transformStream.on('data', (chunk)=>{
        hash.update(chunk);
    });
    await pipeline(stream, transformStream, (0, _tar().extract)({
        cwd,
        filter,
        onentry: (0, _createFileTransform.createEntryResolver)(name),
        strip: strip ?? 1
    }, fileList));
    return hash.digest('hex');
}

//# sourceMappingURL=npm.js.map