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
    addDomBundleToMetadataAsync: function() {
        return addDomBundleToMetadataAsync;
    },
    exportDomComponentAsync: function() {
        return exportDomComponentAsync;
    },
    transformDomEntryForMd5Filename: function() {
        return transformDomEntryForMd5Filename;
    },
    transformNativeBundleForMd5Filename: function() {
        return transformNativeBundleForMd5Filename;
    }
});
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
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
function _url() {
    const data = /*#__PURE__*/ _interop_require_default(require("url"));
    _url = function() {
        return data;
    };
    return data;
}
const _saveAssets = require("./saveAssets");
const _serializeHtml = require("../start/server/metro/serializeHtml");
const _DomComponentsMiddleware = require("../start/server/middleware/DomComponentsMiddleware");
const _env = require("../utils/env");
const _filePath = require("../utils/filePath");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:export:exportDomComponents');
async function exportDomComponentAsync({ filePath, projectRoot, dev, devServer, isHermes, includeSourceMaps, exp, files, useMd5Filename = false }) {
    var _exp_experiments;
    const virtualEntry = (0, _filePath.toPosixPath)((0, _resolvefrom().default)(projectRoot, 'expo/dom/entry.js'));
    debug('Bundle DOM Component:', filePath);
    // MUST MATCH THE BABEL PLUGIN!
    const hash = _crypto().default.createHash('md5').update(filePath).digest('hex');
    const outputName = `${_DomComponentsMiddleware.DOM_COMPONENTS_BUNDLE_DIR}/${hash}.html`;
    const generatedEntryPath = (0, _filePath.toPosixPath)(filePath.startsWith('file://') ? _url().default.fileURLToPath(filePath) : filePath);
    const baseUrl = `/${_DomComponentsMiddleware.DOM_COMPONENTS_BUNDLE_DIR}`;
    // The relative import path will be used like URI so it must be POSIX.
    const relativeImport = './' + _path().default.posix.relative(_path().default.dirname(virtualEntry), generatedEntryPath);
    // Run metro bundler and create the JS bundles/source maps.
    const bundle = await devServer.legacySinglePageExportBundleAsync({
        platform: 'web',
        domRoot: encodeURI(relativeImport),
        splitChunks: !_env.env.EXPO_NO_BUNDLE_SPLITTING,
        mainModuleName: (0, _filePath.resolveRealEntryFilePath)(projectRoot, virtualEntry),
        mode: dev ? 'development' : 'production',
        engine: isHermes ? 'hermes' : undefined,
        serializerIncludeMaps: includeSourceMaps,
        bytecode: false,
        reactCompiler: !!((_exp_experiments = exp.experiments) == null ? void 0 : _exp_experiments.reactCompiler),
        baseUrl: './',
        useMd5Filename,
        // Minify may be false because it's skipped on native when Hermes is enabled, default to true.
        minify: true
    });
    if (useMd5Filename) {
        for (const artifact of bundle.artifacts){
            const md5 = _crypto().default.createHash('md5').update(artifact.source).digest('hex');
            artifact.filename = `${md5}.${artifact.type}`;
        }
    }
    const html = await (0, _serializeHtml.serializeHtmlWithAssets)({
        isExporting: true,
        resources: bundle.artifacts,
        template: (0, _DomComponentsMiddleware.getDomComponentHtml)(),
        baseUrl: './'
    });
    const serialAssets = bundle.artifacts.map((a)=>{
        return {
            ...a,
            filename: _path().default.join(baseUrl, a.filename)
        };
    });
    (0, _saveAssets.getFilesFromSerialAssets)(serialAssets, {
        includeSourceMaps,
        files,
        platform: 'web'
    });
    files.set(outputName, {
        contents: html
    });
    return {
        bundle,
        htmlOutputName: outputName
    };
}
function addDomBundleToMetadataAsync(bundle) {
    const assetsMetadata = [];
    for (const artifact of bundle.artifacts){
        if (artifact.type === 'map') {
            continue;
        }
        assetsMetadata.push({
            path: `${_DomComponentsMiddleware.DOM_COMPONENTS_BUNDLE_DIR}/${artifact.filename}`,
            ext: artifact.type
        });
    }
    return assetsMetadata;
}
function transformDomEntryForMd5Filename({ files, htmlOutputName }) {
    const htmlContent = files.get(htmlOutputName);
    (0, _assert().default)(htmlContent);
    const htmlMd5 = _crypto().default.createHash('md5').update(htmlContent.contents.toString()).digest('hex');
    const htmlMd5Filename = `${_DomComponentsMiddleware.DOM_COMPONENTS_BUNDLE_DIR}/${htmlMd5}.html`;
    files.set(htmlMd5Filename, htmlContent);
    files.delete(htmlOutputName);
    return [
        {
            path: htmlMd5Filename,
            ext: 'html'
        }
    ];
}
function transformNativeBundleForMd5Filename({ domComponentReference, nativeBundle, files, htmlOutputName }) {
    const htmlContent = files.get(htmlOutputName);
    (0, _assert().default)(htmlContent);
    const htmlMd5 = _crypto().default.createHash('md5').update(htmlContent.contents.toString()).digest('hex');
    const hash = _crypto().default.createHash('md5').update(domComponentReference).digest('hex');
    for (const artifact of nativeBundle.artifacts){
        if (artifact.type !== 'js') {
            continue;
        }
        const assetEntity = files.get(artifact.filename);
        (0, _assert().default)(assetEntity);
        if (Buffer.isBuffer(assetEntity.contents)) {
            const searchBuffer = Buffer.from(`${hash}.html`, 'utf8');
            const replaceBuffer = Buffer.from(`${htmlMd5}.html`, 'utf8');
            (0, _assert().default)(searchBuffer.length === replaceBuffer.length);
            let index = assetEntity.contents.indexOf(searchBuffer, 0);
            while(index !== -1){
                replaceBuffer.copy(assetEntity.contents, index);
                index = assetEntity.contents.indexOf(searchBuffer, index + searchBuffer.length);
            }
        } else {
            const search = `${hash}.html`;
            const replace = `${htmlMd5}.html`;
            (0, _assert().default)(search.length === replace.length);
            assetEntity.contents = assetEntity.contents.toString().replaceAll(search, replace);
        }
    }
} //#endregion `npx export` for updates

//# sourceMappingURL=exportDomComponents.js.map