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
    exportApiRoutesStandaloneAsync: function() {
        return exportApiRoutesStandaloneAsync;
    },
    exportFromServerAsync: function() {
        return exportFromServerAsync;
    },
    getFilesToExportFromServerAsync: function() {
        return getFilesToExportFromServerAsync;
    },
    getHtmlFiles: function() {
        return getHtmlFiles;
    },
    getPathVariations: function() {
        return getPathVariations;
    },
    injectScriptTags: function() {
        return injectScriptTags;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _matchers() {
    const data = require("expo-router/build/matchers");
    _matchers = function() {
        return data;
    };
    return data;
}
function _url() {
    const data = require("expo-router/build/utils/url");
    _url = function() {
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
function _util() {
    const data = require("util");
    _util = function() {
        return data;
    };
    return data;
}
const _favicon = require("./favicon");
const _persistMetroAssets = require("./persistMetroAssets");
const _saveAssets = require("./saveAssets");
const _log = require("../log");
const _metroErrorInterface = require("../start/server/metro/metroErrorInterface");
const _router = require("../start/server/metro/router");
const _serializeHtml = require("../start/server/metro/serializeHtml");
const _link = require("../utils/link");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:export:generateStaticRoutes');
function injectScriptTags(html, scriptTags) {
    const scriptTagsHtml = scriptTags.map((tag)=>tag.platform === 'web' ? `<script src="${tag.src}"></script>` : `<script type="type/expo" src="${tag.src}" data-platform="${tag.platform}"></script>`).join('\n');
    html = html.replace('</head>', `${scriptTagsHtml}\n</head>`);
    return html;
}
/** Match `(page)` -> `page` */ function matchGroupName(name) {
    var _name_match;
    return (_name_match = name.match(/^\(([^/]+?)\)$/)) == null ? void 0 : _name_match[1];
}
async function getFilesToExportFromServerAsync(projectRoot, { manifest, serverManifest, renderAsync, // Servers can handle group routes automatically and therefore
// don't require the build-time generation of every possible group
// variation.
exportServer, // name : contents
files = new Map() }) {
    if (!exportServer && serverManifest) {
        // When we're not exporting a `server` output, we provide a `_expo/.routes.json` for
        // EAS Hosting to recognize the `headers` and `redirects` configs
        const subsetServerManifest = {
            headers: serverManifest.headers,
            redirects: serverManifest.redirects
        };
        files.set('_expo/.routes.json', {
            contents: JSON.stringify(subsetServerManifest, null, 2),
            targetDomain: 'client'
        });
    }
    await Promise.all(getHtmlFiles({
        manifest,
        includeGroupVariations: !exportServer
    }).map(async ({ route, filePath, pathname })=>{
        // Rewrite routes should not be statically generated
        if (route.type === 'rewrite') {
            return;
        }
        try {
            const targetDomain = exportServer ? 'server' : 'client';
            files.set(filePath, {
                contents: '',
                targetDomain
            });
            const data = await renderAsync({
                route,
                filePath,
                pathname
            });
            files.set(filePath, {
                contents: data,
                routeId: pathname,
                targetDomain
            });
        } catch (e) {
            await (0, _metroErrorInterface.logMetroErrorAsync)({
                error: e,
                projectRoot
            });
            throw new Error('Failed to statically export route: ' + pathname);
        }
    }));
    return files;
}
function modifyRouteNodeInRuntimeManifest(manifest, callback) {
    const iterateScreens = (screens)=>{
        Object.values(screens).map((value)=>{
            if (typeof value !== 'string') {
                if (value._route) callback(value._route);
                iterateScreens(value.screens);
            }
        });
    };
    iterateScreens(manifest.screens);
}
// TODO: Do this earlier in the process.
function makeRuntimeEntryPointsAbsolute(manifest, appDir) {
    modifyRouteNodeInRuntimeManifest(manifest, (route)=>{
        if (Array.isArray(route.entryPoints)) {
            route.entryPoints = route.entryPoints.map((entryPoint)=>{
                // TODO(@hassankhan): ENG-16577
                if ((0, _url().shouldLinkExternally)(entryPoint)) {
                    return entryPoint;
                }
                if (entryPoint.startsWith('.')) {
                    return _path().default.resolve(appDir, entryPoint);
                } else if (!_path().default.isAbsolute(entryPoint)) {
                    return (0, _resolvefrom().default)(appDir, entryPoint);
                }
                return entryPoint;
            });
        }
    });
}
async function exportFromServerAsync(projectRoot, devServer, { outputDir, baseUrl, exportServer, includeSourceMaps, routerRoot, files = new Map(), exp, scriptTags }) {
    _log.Log.log(`Static rendering is enabled. ` + (0, _link.learnMore)('https://docs.expo.dev/router/reference/static-rendering/'));
    const platform = 'web';
    const isExporting = true;
    const appDir = _path().default.join(projectRoot, routerRoot);
    const injectFaviconTag = await (0, _favicon.getVirtualFaviconAssetsAsync)(projectRoot, {
        outputDir,
        baseUrl,
        files,
        exp
    });
    const [resources, { manifest, serverManifest, renderAsync }] = await Promise.all([
        devServer.getStaticResourcesAsync({
            includeSourceMaps
        }),
        devServer.getStaticRenderFunctionAsync()
    ]);
    makeRuntimeEntryPointsAbsolute(manifest, appDir);
    debug('Routes:\n', (0, _util().inspect)(manifest, {
        colors: true,
        depth: null
    }));
    await getFilesToExportFromServerAsync(projectRoot, {
        files,
        manifest,
        serverManifest,
        exportServer,
        async renderAsync ({ pathname, route }) {
            const template = await renderAsync(pathname);
            let html = await (0, _serializeHtml.serializeHtmlWithAssets)({
                isExporting,
                resources: resources.artifacts,
                template,
                baseUrl,
                route,
                hydrate: true
            });
            if (injectFaviconTag) {
                html = injectFaviconTag(html);
            }
            if (scriptTags) {
                // Inject script tags into the HTML.
                // <script type="type/expo" data-platform="ios" src="..." />
                html = injectScriptTags(html, scriptTags);
            }
            return html;
        }
    });
    (0, _saveAssets.getFilesFromSerialAssets)(resources.artifacts, {
        platform,
        includeSourceMaps,
        files,
        isServerHosted: true
    });
    if (resources.assets) {
        // TODO: Collect files without writing to disk.
        // NOTE(kitten): Re. above, this is now using `files` except for iOS catalog output, which isn't used here
        await (0, _persistMetroAssets.persistMetroAssetsAsync)(projectRoot, resources.assets, {
            files,
            platform,
            outputDirectory: outputDir,
            baseUrl
        });
    }
    if (exportServer) {
        const apiRoutes = await exportApiRoutesAsync({
            platform: 'web',
            server: devServer,
            manifest: serverManifest,
            // NOTE(kitten): For now, we always output source maps for API route exports
            includeSourceMaps: true
        });
        // Add the api routes to the files to export.
        for (const [route, contents] of apiRoutes){
            files.set(route, contents);
        }
    } else {
        warnPossibleInvalidExportType(appDir);
    }
    return files;
}
function getHtmlFiles({ manifest, includeGroupVariations }) {
    const htmlFiles = new Set();
    function traverseScreens(screens, route, baseUrl = '') {
        for (const [key, value] of Object.entries(screens)){
            let leaf = null;
            if (typeof value === 'string') {
                leaf = value;
            } else if (value.screens && Object.keys(value.screens).length === 0) {
                // Ensure the trailing index is accounted for.
                if (key === value.path + '/index') {
                    leaf = key;
                } else {
                    leaf = value.path;
                }
                route = value._route ?? null;
            }
            if (leaf != null) {
                let filePath = baseUrl + leaf;
                if (leaf === '') {
                    filePath = baseUrl === '' ? 'index' : baseUrl.endsWith('/') ? baseUrl + 'index' : baseUrl.slice(0, -1);
                } else if (// If the path is a collection of group segments leading to an index route, append `/index`.
                (0, _matchers().stripGroupSegmentsFromPath)(filePath) === '') {
                    filePath += '/index';
                }
                // This should never happen, the type of `string | object` originally comes from React Navigation.
                if (!route) {
                    throw new Error(`Internal error: Route not found for "${filePath}" while collecting static export paths.`);
                }
                if (includeGroupVariations) {
                    // TODO: Dedupe requests for alias routes.
                    addOptionalGroups(filePath, route);
                } else {
                    htmlFiles.add({
                        filePath,
                        route
                    });
                }
            } else if (typeof value === 'object' && (value == null ? void 0 : value.screens)) {
                // The __root slot has no path.
                const newPath = value.path ? baseUrl + value.path + '/' : baseUrl;
                traverseScreens(value.screens, value._route ?? null, newPath);
            }
        }
    }
    function addOptionalGroups(path, route) {
        const variations = getPathVariations(path);
        for (const variation of variations){
            htmlFiles.add({
                filePath: variation,
                route
            });
        }
    }
    traverseScreens(manifest.screens, null);
    return uniqueBy(Array.from(htmlFiles), (value)=>value.filePath).map((value)=>{
        const parts = value.filePath.split('/');
        // Replace `:foo` with `[foo]` and `*foo` with `[...foo]`
        const partsWithGroups = parts.map((part)=>{
            if (part === '*not-found') {
                return `+not-found`;
            } else if (part.startsWith(':')) {
                return `[${part.slice(1)}]`;
            } else if (part.startsWith('*')) {
                return `[...${part.slice(1)}]`;
            }
            return part;
        });
        const filePathLocation = partsWithGroups.join('/');
        const filePath = filePathLocation + '.html';
        return {
            ...value,
            filePath,
            pathname: filePathLocation.replace(/(\/?index)?$/, '')
        };
    });
}
function uniqueBy(array, key) {
    const seen = new Set();
    const result = [];
    for (const value of array){
        const id = key(value);
        if (!seen.has(id)) {
            seen.add(id);
            result.push(value);
        }
    }
    return result;
}
function getPathVariations(routePath) {
    const variations = new Set();
    const segments = routePath.split('/');
    function generateVariations(segments, current = '') {
        if (segments.length === 0) {
            if (current) variations.add(current);
            return;
        }
        const [head, ...rest] = segments;
        if (matchGroupName(head)) {
            const groups = head.slice(1, -1).split(',');
            if (groups.length > 1) {
                for (const group of groups){
                    // If there are multiple groups, recurse on each group.
                    generateVariations([
                        `(${group.trim()})`,
                        ...rest
                    ], current);
                }
                return;
            } else {
                // Start a fork where this group is included
                generateVariations(rest, current ? `${current}/(${groups[0]})` : `(${groups[0]})`);
            // This code will continue and add paths without this group included`
            }
        } else if (current) {
            current = `${current}/${head}`;
        } else {
            current = head;
        }
        generateVariations(rest, current);
    }
    generateVariations(segments);
    return Array.from(variations);
}
async function exportApiRoutesStandaloneAsync(devServer, { files = new Map(), platform, apiRoutesOnly, templateHtml }) {
    const { serverManifest, htmlManifest } = await devServer.getServerManifestAsync();
    const apiRoutes = await exportApiRoutesAsync({
        server: devServer,
        manifest: serverManifest,
        // NOTE(kitten): For now, we always output source maps for API route exports
        includeSourceMaps: true,
        platform,
        apiRoutesOnly
    });
    // Add the api routes to the files to export.
    for (const [route, contents] of apiRoutes){
        files.set(route, contents);
    }
    if (templateHtml && devServer.isReactServerComponentsEnabled) {
        // TODO: Export an HTML entry for each file. This is a temporary solution until we have SSR/SSG for RSC.
        await getFilesToExportFromServerAsync(devServer.projectRoot, {
            manifest: htmlManifest,
            serverManifest,
            exportServer: true,
            files,
            renderAsync: async ({ pathname, filePath })=>{
                files.set(filePath, {
                    contents: templateHtml,
                    routeId: pathname,
                    targetDomain: 'server'
                });
                return templateHtml;
            }
        });
    }
    return files;
}
async function exportApiRoutesAsync({ includeSourceMaps, server, platform, apiRoutesOnly, ...props }) {
    const { manifest, files } = await server.exportExpoRouterApiRoutesAsync({
        outputDir: '_expo/functions',
        prerenderManifest: props.manifest,
        includeSourceMaps,
        platform
    });
    // HACK: Clear out the HTML and 404 routes if we're only exporting API routes. This is used for native apps that are using API routes but haven't implemented web support yet.
    if (apiRoutesOnly) {
        manifest.htmlRoutes = [];
        manifest.notFoundRoutes = [];
    }
    files.set('_expo/routes.json', {
        contents: JSON.stringify(manifest, null, 2),
        targetDomain: 'server'
    });
    return files;
}
function warnPossibleInvalidExportType(appDir) {
    const apiRoutes = (0, _router.getApiRoutesForDirectory)(appDir);
    if (apiRoutes.length) {
        // TODO: Allow API Routes for native-only.
        _log.Log.warn(_chalk().default.yellow`Skipping export for API routes because \`web.output\` is not "server". You may want to remove the routes: ${apiRoutes.map((v)=>_path().default.relative(appDir, v)).join(', ')}`);
    }
    const middlewareFile = (0, _router.getMiddlewareForDirectory)(appDir);
    if (middlewareFile) {
        _log.Log.warn(_chalk().default.yellow`Skipping export for middleware because \`web.output\` is not "server". You may want to remove ${_path().default.relative(appDir, middlewareFile)}`);
    }
}

//# sourceMappingURL=exportStaticAsync.js.map