/**
 * Copyright © 2022 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createRouteHandlerMiddleware", {
    enumerable: true,
    get: function() {
        return createRouteHandlerMiddleware;
    }
});
function _http() {
    const data = require("expo-server/adapter/http");
    _http = function() {
        return data;
    };
    return data;
}
function _resolve() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve"));
    _resolve = function() {
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
const _fetchRouterManifest = require("./fetchRouterManifest");
const _metroErrorInterface = require("./metroErrorInterface");
const _router = require("./router");
const _errors = require("../../../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:server:metro');
const resolveAsync = (0, _util().promisify)(_resolve().default);
function createRouteHandlerMiddleware(projectRoot, options) {
    if (!_resolvefrom().default.silent(projectRoot, 'expo-router')) {
        throw new _errors.CommandError(`static and server rendering requires the expo-router package to be installed in your project. Either install the expo-router package or change 'web.output' to 'single' in your app.json.`);
    }
    return (0, _http().createRequestHandler)({
        build: ''
    }, {
        async getRoutesManifest () {
            const manifest = await (0, _fetchRouterManifest.fetchManifest)(projectRoot, options);
            debug('manifest', manifest);
            // NOTE: no app dir if null
            // TODO: Redirect to 404 page
            return manifest ?? {
                // Support the onboarding screen if there's no manifest
                htmlRoutes: [
                    {
                        file: 'index.js',
                        page: '/index',
                        routeKeys: {},
                        namedRegex: /^\/(?:index)?\/?$/i
                    }
                ],
                apiRoutes: [],
                notFoundRoutes: [],
                redirects: [],
                rewrites: []
            };
        },
        async getHtml (request) {
            try {
                const { content } = await options.getStaticPageAsync(request.url);
                return content;
            } catch (error) {
                // Forward the Metro server response as-is. It won't be pretty, but at least it will be accurate.
                try {
                    return new Response(await (0, _metroErrorInterface.getErrorOverlayHtmlAsync)({
                        error,
                        projectRoot,
                        routerRoot: options.routerRoot
                    }), {
                        status: 500,
                        headers: {
                            'Content-Type': 'text/html'
                        }
                    });
                } catch (staticError) {
                    debug('Failed to render static error overlay:', staticError);
                    // Fallback error for when Expo Router is misconfigured in the project.
                    return new Response('<span><h3>Internal Error:</h3><b>Project is not setup correctly for static rendering (check terminal for more info):</b><br/>' + error.message + '<br/><br/>' + staticError.message + '</span>', {
                        status: 500,
                        headers: {
                            'Content-Type': 'text/html'
                        }
                    });
                }
            }
        },
        async handleRouteError (error) {
            // NOTE(@kitten): ExpoError is currently not exposed by expo-server just yet
            if (error && typeof error === 'object' && error.name === 'ExpoError') {
                // TODO(@krystofwoldrich): Can we show code snippet of the handler?
                // NOTE(@krystofwoldrich): Removing stack since to avoid confusion. The error is not in the server code.
                delete error.stack;
            }
            const htmlServerError = await (0, _metroErrorInterface.getErrorOverlayHtmlAsync)({
                error,
                projectRoot,
                routerRoot: options.routerRoot
            });
            return new Response(htmlServerError, {
                status: 500,
                headers: {
                    'Content-Type': 'text/html'
                }
            });
        },
        async getApiRoute (route) {
            var _exp_web;
            const { exp } = options.config;
            if (((_exp_web = exp.web) == null ? void 0 : _exp_web.output) !== 'server') {
                (0, _router.warnInvalidWebOutput)();
            }
            const resolvedFunctionPath = await resolveAsync(route.file, {
                extensions: [
                    '.js',
                    '.jsx',
                    '.ts',
                    '.tsx'
                ],
                basedir: options.appDir
            });
            try {
                debug(`Bundling API route at: ${resolvedFunctionPath}`);
                return await options.bundleApiRoute(resolvedFunctionPath);
            } catch (error) {
                return new Response('Failed to load API Route: ' + resolvedFunctionPath + '\n\n' + error.message, {
                    status: 500,
                    headers: {
                        'Content-Type': 'text/html'
                    }
                });
            }
        },
        async getMiddleware (route) {
            var _exp_web;
            const { exp } = options.config;
            if (!options.unstable_useServerMiddleware) {
                return {
                    default: ()=>{
                        throw new _errors.CommandError('Server middleware is not enabled. Add unstable_useServerMiddleware: true to your `expo-router` plugin config.');
                    }
                };
            }
            if (((_exp_web = exp.web) == null ? void 0 : _exp_web.output) !== 'server') {
                (0, _router.warnInvalidMiddlewareOutput)();
                return {
                    default: ()=>{
                        console.warn('Server middleware is only supported when web.output is set to "server" in your app config');
                    }
                };
            }
            const resolvedFunctionPath = await resolveAsync(route.file, {
                extensions: [
                    '.js',
                    '.jsx',
                    '.ts',
                    '.tsx'
                ],
                basedir: options.appDir
            });
            try {
                var _middlewareModule_unstable_settings;
                debug(`Bundling middleware at: ${resolvedFunctionPath}`);
                const middlewareModule = await options.bundleApiRoute(resolvedFunctionPath);
                if ((_middlewareModule_unstable_settings = middlewareModule.unstable_settings) == null ? void 0 : _middlewareModule_unstable_settings.matcher) {
                    var _middlewareModule_unstable_settings1;
                    (0, _router.warnInvalidMiddlewareMatcherSettings)((_middlewareModule_unstable_settings1 = middlewareModule.unstable_settings) == null ? void 0 : _middlewareModule_unstable_settings1.matcher);
                }
                return middlewareModule;
            } catch (error) {
                return new Response('Failed to load middleware: ' + resolvedFunctionPath + '\n\n' + error.message, {
                    status: 500,
                    headers: {
                        'Content-Type': 'text/html'
                    }
                });
            }
        }
    });
}

//# sourceMappingURL=createServerRouteMiddleware.js.map