/**
 * Copyright © 2022 650 Industries.
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
    fetchManifest: function() {
        return fetchManifest;
    },
    inflateManifest: function() {
        return inflateManifest;
    }
});
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _router = require("./router");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getExpoRouteManifestBuilderAsync(projectRoot) {
    return require((0, _resolvefrom().default)(projectRoot, 'expo-router/build/routes-manifest')).createRoutesManifest;
}
async function fetchManifest(projectRoot, options) {
    const getManifest = getExpoRouteManifestBuilderAsync(projectRoot);
    const paths = (0, _router.getRoutePaths)(options.appDir);
    // Get the serialized manifest
    const jsonManifest = getManifest(paths, options);
    if (!jsonManifest) {
        return null;
    }
    if (!jsonManifest.htmlRoutes || !jsonManifest.apiRoutes) {
        throw new Error('Routes manifest is malformed: ' + JSON.stringify(jsonManifest, null, 2));
    }
    if (!options.asJson) {
        // @ts-expect-error
        return inflateManifest(jsonManifest);
    }
    // @ts-expect-error
    return jsonManifest;
}
function inflateManifest(json) {
    var _json_htmlRoutes, _json_apiRoutes, _json_notFoundRoutes, _json_redirects, _json_rewrites;
    return {
        ...json,
        middleware: json.middleware,
        htmlRoutes: (_json_htmlRoutes = json.htmlRoutes) == null ? void 0 : _json_htmlRoutes.map((value)=>{
            return {
                ...value,
                namedRegex: new RegExp(value.namedRegex)
            };
        }),
        apiRoutes: (_json_apiRoutes = json.apiRoutes) == null ? void 0 : _json_apiRoutes.map((value)=>{
            return {
                ...value,
                namedRegex: new RegExp(value.namedRegex)
            };
        }),
        notFoundRoutes: (_json_notFoundRoutes = json.notFoundRoutes) == null ? void 0 : _json_notFoundRoutes.map((value)=>{
            return {
                ...value,
                namedRegex: new RegExp(value.namedRegex)
            };
        }),
        redirects: (_json_redirects = json.redirects) == null ? void 0 : _json_redirects.map((value)=>{
            return {
                ...value,
                namedRegex: new RegExp(value.namedRegex)
            };
        }),
        rewrites: (_json_rewrites = json.rewrites) == null ? void 0 : _json_rewrites.map((value)=>{
            return {
                ...value,
                namedRegex: new RegExp(value.namedRegex)
            };
        })
    };
}

//# sourceMappingURL=fetchRouterManifest.js.map