/**
 * Copyright © 2023 650 Industries.
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Based on the community asset persisting for Metro but with base path and web support:
 * https://github.com/facebook/react-native/blob/d6e0bc714ad4d215ede4949d3c4f44af6dea5dd3/packages/community-cli-plugin/src/commands/bundle/saveAssets.js#L1
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
    drawableFileTypes: function() {
        return drawableFileTypes;
    },
    getAssetLocalPath: function() {
        return getAssetLocalPath;
    },
    stripAssetPrefix: function() {
        return stripAssetPrefix;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getAssetLocalPath(asset, { baseUrl, scale, platform }) {
    if (platform === 'android') {
        return getAssetLocalPathAndroid(asset, {
            baseUrl,
            scale
        });
    }
    return getAssetLocalPathDefault(asset, {
        baseUrl,
        scale
    });
}
function getAssetLocalPathAndroid(asset, { baseUrl, scale }) {
    const androidFolder = getAndroidResourceFolderName(asset, scale);
    const fileName = getResourceIdentifier(asset);
    return _path().default.join(androidFolder, `${fileName}.${asset.type}`);
}
function getAssetLocalPathDefault(asset, { baseUrl, scale }) {
    const suffix = scale === 1 ? '' : `@${scale}x`;
    const fileName = `${asset.name}${suffix}.${asset.type}`;
    const adjustedHttpServerLocation = stripAssetPrefix(asset.httpServerLocation, baseUrl);
    return _path().default.join(// Assets can have relative paths outside of the project root.
    // Replace `../` with `_` to make sure they don't end up outside of
    // the expected assets directory.
    adjustedHttpServerLocation.replace(/^\/+/g, '').replace(/\.\.\//g, '_'), fileName);
}
function stripAssetPrefix(path, baseUrl) {
    path = path.replace(/\/assets\?export_path=(.*)/, '$1');
    // TODO: Windows?
    if (baseUrl) {
        return path.replace(/^\/+/g, '').replace(new RegExp(`^${baseUrl.replace(/^\/+/g, '').replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')}`, 'g'), '');
    }
    return path;
}
/**
 * FIXME: using number to represent discrete scale numbers is fragile in essence because of
 * floating point numbers imprecision.
 */ function getAndroidAssetSuffix(scale) {
    switch(scale){
        case 0.75:
            return 'ldpi';
        case 1:
            return 'mdpi';
        case 1.5:
            return 'hdpi';
        case 2:
            return 'xhdpi';
        case 3:
            return 'xxhdpi';
        case 4:
            return 'xxxhdpi';
        default:
            return null;
    }
}
const drawableFileTypes = new Set([
    'gif',
    'jpeg',
    'jpg',
    'png',
    'webp',
    'xml'
]);
function getAndroidResourceFolderName(asset, scale) {
    if (!drawableFileTypes.has(asset.type)) {
        return 'raw';
    }
    const suffix = getAndroidAssetSuffix(scale);
    if (!suffix) {
        throw new Error(`Asset "${JSON.stringify(asset)}" does not use a supported Android resolution suffix`);
    }
    return `drawable-${suffix}`;
}
function getResourceIdentifier(asset) {
    const folderPath = getBaseUrl(asset);
    return `${folderPath}/${asset.name}`.toLowerCase().replace(/\//g, '_') // Encode folder structure in file name
    .replace(/([^a-z0-9_])/g, '') // Remove illegal chars
    .replace(/^assets_/, ''); // Remove "assets_" prefix
}
function getBaseUrl(asset) {
    let baseUrl = asset.httpServerLocation;
    if (baseUrl[0] === '/') {
        baseUrl = baseUrl.substring(1);
    }
    return baseUrl;
}

//# sourceMappingURL=metroAssetLocalPath.js.map