/**
 * Copyright © 2023 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
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
    getFilesFromSerialAssets: function() {
        return getFilesFromSerialAssets;
    },
    persistMetroFilesAsync: function() {
        return persistMetroFilesAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
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
function _prettybytes() {
    const data = /*#__PURE__*/ _interop_require_default(require("pretty-bytes"));
    _prettybytes = function() {
        return data;
    };
    return data;
}
const _log = require("../log");
const _env = require("../utils/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const BLT = '\u203A';
async function persistMetroFilesAsync(files, outputDir) {
    if (!files.size) {
        return;
    }
    await _fs().default.promises.mkdir(_path().default.join(outputDir), {
        recursive: true
    });
    // Test fixtures:
    // Log.log(
    //   JSON.stringify(
    //     Object.fromEntries([...files.entries()].map(([k, v]) => [k, { ...v, contents: '' }]))
    //   )
    // );
    const assetEntries = [];
    const apiRouteEntries = [];
    const middlewareEntries = [];
    const routeEntries = [];
    const rscEntries = [];
    const remainingEntries = [];
    let hasServerOutput = false;
    for (const asset of files.entries()){
        hasServerOutput = hasServerOutput || asset[1].targetDomain === 'server';
        if (asset[1].assetId) assetEntries.push(asset);
        else if (asset[1].routeId != null) routeEntries.push(asset);
        else if (asset[1].middlewareId != null) middlewareEntries.push(asset);
        else if (asset[1].apiRouteId != null) apiRouteEntries.push(asset);
        else if (asset[1].rscId != null) rscEntries.push(asset);
        else remainingEntries.push(asset);
    }
    const groups = groupBy(assetEntries, ([, { assetId }])=>assetId);
    const contentSize = (contents)=>{
        const length = typeof contents === 'string' ? Buffer.byteLength(contents, 'utf8') : contents.length;
        return length;
    };
    const sizeStr = (contents)=>{
        const length = contentSize(contents);
        const size = _chalk().default.gray`(${(0, _prettybytes().default)(length)})`;
        return size;
    };
    // TODO: If any Expo Router is used, then use a new style which is more simple:
    // `chalk.gray(/path/to/) + chalk.cyan('route')`
    // | index.html (1.2kb)
    // | /path
    //   | other.html (1.2kb)
    const isExpoRouter = routeEntries.length;
    // Phase out printing all the assets as users can simply check the file system for more info.
    const showAdditionalInfo = !isExpoRouter || _env.env.EXPO_DEBUG;
    const assetGroups = [
        ...groups.entries()
    ].sort((a, b)=>a[0].localeCompare(b[0]));
    if (showAdditionalInfo) {
        if (assetGroups.length) {
            const totalAssets = assetGroups.reduce((sum, [, assets])=>sum + assets.length, 0);
            _log.Log.log('');
            _log.Log.log(_chalk().default.bold`${BLT} Assets (${totalAssets}):`);
            for (const [assetId, assets] of assetGroups){
                const averageContentSize = assets.reduce((sum, [, { contents }])=>sum + contentSize(contents), 0) / assets.length;
                _log.Log.log(assetId, _chalk().default.gray(`(${[
                    assets.length > 1 ? `${assets.length} variations` : '',
                    `${(0, _prettybytes().default)(averageContentSize)}`
                ].filter(Boolean).join(' | ')})`));
            }
        }
    }
    const bundles = new Map();
    const other = [];
    remainingEntries.forEach(([filepath, asset])=>{
        if (!filepath.match(/_expo\/static\//)) {
            other.push([
                filepath,
                asset
            ]);
        } else {
            var _filepath_match;
            const platform = ((_filepath_match = filepath.match(/_expo\/static\/js\/([^/]+)\//)) == null ? void 0 : _filepath_match[1]) ?? 'web';
            if (!bundles.has(platform)) bundles.set(platform, []);
            bundles.get(platform).push([
                filepath,
                asset
            ]);
        }
    });
    [
        ...bundles.entries()
    ].forEach(([platform, assets])=>{
        _log.Log.log('');
        _log.Log.log(_chalk().default.bold`${BLT} ${platform} bundles (${assets.length}):`);
        const allAssets = assets.sort((a, b)=>a[0].localeCompare(b[0]));
        while(allAssets.length){
            const [filePath, asset] = allAssets.shift();
            _log.Log.log(filePath, sizeStr(asset.contents));
            if (filePath.match(/\.(js|hbc)$/)) {
                // Get source map
                const sourceMapIndex = allAssets.findIndex(([fp])=>fp === filePath + '.map');
                if (sourceMapIndex !== -1) {
                    const [sourceMapFilePath, sourceMapAsset] = allAssets.splice(sourceMapIndex, 1)[0];
                    _log.Log.log(_chalk().default.gray(sourceMapFilePath), sizeStr(sourceMapAsset.contents));
                }
            }
        }
    });
    if (showAdditionalInfo && other.length) {
        _log.Log.log('');
        _log.Log.log(_chalk().default.bold`${BLT} Files (${other.length}):`);
        for (const [filePath, asset] of other.sort((a, b)=>a[0].localeCompare(b[0]))){
            _log.Log.log(filePath, sizeStr(asset.contents));
        }
    }
    if (rscEntries.length) {
        _log.Log.log('');
        _log.Log.log(_chalk().default.bold`${BLT} React Server Components (${rscEntries.length}):`);
        for (const [filePath, assets] of rscEntries.sort((a, b)=>a[0].length - b[0].length)){
            const id = assets.rscId;
            _log.Log.log('/' + (id === '' ? _chalk().default.gray(' (index)') : id), sizeStr(assets.contents), _chalk().default.gray(filePath));
        }
    }
    if (routeEntries.length) {
        _log.Log.log('');
        _log.Log.log(_chalk().default.bold`${BLT} Static routes (${routeEntries.length}):`);
        for (const [, assets] of routeEntries.sort((a, b)=>a[0].length - b[0].length)){
            const id = assets.routeId;
            _log.Log.log('/' + (id === '' ? _chalk().default.gray(' (index)') : id), sizeStr(assets.contents));
        }
    }
    if (apiRouteEntries.length) {
        const apiRoutesWithoutSourcemaps = apiRouteEntries.filter((route)=>!route[0].endsWith('.map'));
        _log.Log.log('');
        _log.Log.log(_chalk().default.bold`${BLT} API routes (${apiRoutesWithoutSourcemaps.length}):`);
        for (const [apiRouteFilename, assets] of apiRoutesWithoutSourcemaps.sort((a, b)=>a[0].length - b[0].length)){
            const id = assets.apiRouteId;
            const hasSourceMap = apiRouteEntries.find(([filename, route])=>filename !== apiRouteFilename && route.apiRouteId === assets.apiRouteId && filename.endsWith('.map'));
            _log.Log.log(id === '' ? _chalk().default.gray(' (index)') : id, sizeStr(assets.contents), hasSourceMap ? _chalk().default.gray(`(source map ${sizeStr(hasSourceMap[1].contents)})`) : '');
        }
    }
    if (middlewareEntries.length) {
        const middlewareWithoutSourcemaps = middlewareEntries.filter((route)=>!route[0].endsWith('.map'));
        _log.Log.log('');
        _log.Log.log(_chalk().default.bold`${BLT} Middleware:`);
        for (const [middlewareFilename, assets] of middlewareWithoutSourcemaps.sort((a, b)=>a[0].length - b[0].length)){
            const id = assets.middlewareId;
            const hasSourceMap = middlewareEntries.find(([filename, route])=>filename !== middlewareFilename && route.middlewareId === assets.middlewareId && filename.endsWith('.map'));
            _log.Log.log(id, sizeStr(assets.contents), hasSourceMap ? _chalk().default.gray(`(source map ${sizeStr(hasSourceMap[1].contents)})`) : '');
        }
    }
    // Decouple logging from writing for better performance.
    await Promise.all([
        ...files.entries()
    ].sort(([a], [b])=>a.localeCompare(b)).map(async ([file, { contents, targetDomain }])=>{
        // NOTE: Only use `targetDomain` if we have at least one server asset
        const domain = hasServerOutput && targetDomain || '';
        const outputPath = _path().default.join(outputDir, domain, file);
        await _fs().default.promises.mkdir(_path().default.dirname(outputPath), {
            recursive: true
        });
        await _fs().default.promises.writeFile(outputPath, contents);
    }));
    _log.Log.log('');
}
function groupBy(array, key) {
    const map = new Map();
    array.forEach((item)=>{
        const group = key(item);
        const list = map.get(group) ?? [];
        list.push(item);
        map.set(group, list);
    });
    return map;
}
function getFilesFromSerialAssets(resources, { includeSourceMaps, files = new Map(), platform, isServerHosted = platform === 'web' }) {
    resources.forEach((resource)=>{
        if (resource.type === 'css-external') {
            return;
        }
        files.set(resource.filename, {
            contents: resource.source,
            originFilename: resource.originFilename,
            targetDomain: isServerHosted ? 'client' : undefined
        });
    });
    return files;
}

//# sourceMappingURL=saveAssets.js.map