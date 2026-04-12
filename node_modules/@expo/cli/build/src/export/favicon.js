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
    getFaviconFromExpoConfigAsync: function() {
        return getFaviconFromExpoConfigAsync;
    },
    getUserDefinedFaviconFile: function() {
        return getUserDefinedFaviconFile;
    },
    getVirtualFaviconAssetsAsync: function() {
        return getVirtualFaviconAssetsAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
function _imageutils() {
    const data = require("@expo/image-utils");
    _imageutils = function() {
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _publicFolder = require("./publicFolder");
const _log = require("../log");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:favicon');
function getUserDefinedFaviconFile(projectRoot) {
    return (0, _publicFolder.getUserDefinedFile)(projectRoot, [
        './favicon.ico'
    ]);
}
async function getVirtualFaviconAssetsAsync(projectRoot, { baseUrl, outputDir, files, exp }) {
    const existing = getUserDefinedFaviconFile(projectRoot);
    if (existing) {
        debug('Using user-defined favicon.ico file.');
        return null;
    }
    const data = await getFaviconFromExpoConfigAsync(projectRoot, {
        exp
    });
    if (!data) {
        return null;
    }
    await Promise.all([
        data
    ].map(async (asset)=>{
        const assetPath = _path().default.join(outputDir, asset.path);
        if (files) {
            debug('Storing asset for persisting: ' + assetPath);
            files == null ? void 0 : files.set(asset.path, {
                contents: asset.source,
                targetDomain: 'client'
            });
        } else {
            debug('Writing asset to disk: ' + assetPath);
            await _fs().default.promises.writeFile(assetPath, asset.source);
        }
    }));
    function injectFaviconTag(html) {
        if (!html.includes('</head>')) {
            return html;
        }
        return html.replace('</head>', `<link rel="icon" href="${baseUrl}/favicon.ico" /></head>`);
    }
    return injectFaviconTag;
}
async function getFaviconFromExpoConfigAsync(projectRoot, { force = false, exp = (0, _config().getConfig)(projectRoot).exp } = {}) {
    var _exp_web;
    const src = ((_exp_web = exp.web) == null ? void 0 : _exp_web.favicon) ?? null;
    if (!src) {
        return null;
    }
    const dims = [
        16,
        32,
        48
    ];
    const cacheType = 'favicon';
    const size = dims[dims.length - 1];
    try {
        const { source } = await (0, _imageutils().generateImageAsync)({
            projectRoot,
            cacheType
        }, {
            resizeMode: 'contain',
            src,
            backgroundColor: 'transparent',
            width: size,
            height: size,
            name: `favicon-${size}.png`
        });
        const faviconBuffer = await (0, _imageutils().generateFaviconAsync)(source, dims);
        return {
            source: faviconBuffer,
            path: 'favicon.ico'
        };
    } catch (error) {
        // Check for ENOENT
        if (!force && error.code === 'ENOENT') {
            _log.Log.warn(`Favicon source file in Expo config (web.favicon) does not exist: ${src}`);
            return null;
        }
        throw error;
    }
}

//# sourceMappingURL=favicon.js.map