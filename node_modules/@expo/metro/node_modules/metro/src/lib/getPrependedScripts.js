"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = getPrependedScripts;
var _CountingSet = _interopRequireDefault(require("./CountingSet"));
var _countLines = _interopRequireDefault(require("./countLines"));
var _getPreludeCode = _interopRequireDefault(require("./getPreludeCode"));
var transformHelpers = _interopRequireWildcard(require("./transformHelpers"));
var defaults = _interopRequireWildcard(
  require("metro-config/private/defaults/defaults"),
);
function _getRequireWildcardCache(e) {
  if ("function" != typeof WeakMap) return null;
  var r = new WeakMap(),
    t = new WeakMap();
  return (_getRequireWildcardCache = function (e) {
    return e ? t : r;
  })(e);
}
function _interopRequireWildcard(e, r) {
  if (!r && e && e.__esModule) return e;
  if (null === e || ("object" != typeof e && "function" != typeof e))
    return { default: e };
  var t = _getRequireWildcardCache(r);
  if (t && t.has(e)) return t.get(e);
  var n = { __proto__: null },
    a = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var u in e)
    if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
      var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
      i && (i.get || i.set) ? Object.defineProperty(n, u, i) : (n[u] = e[u]);
    }
  return ((n.default = e), t && t.set(e, n), n);
}
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
async function getPrependedScripts(
  config,
  options,
  resolverOptions,
  bundler,
  deltaBundler,
) {
  const polyfillModuleNames = config.serializer
    .getPolyfills({
      platform: options.platform,
    })
    .concat(config.serializer.polyfillModuleNames);
  const transformOptions = {
    ...options,
    type: "script",
  };
  const dependencies = await deltaBundler.getDependencies(
    [defaults.moduleSystem, ...polyfillModuleNames],
    {
      resolve: await transformHelpers.getResolveDependencyFn(
        bundler,
        options.platform,
        resolverOptions,
      ),
      transform: await transformHelpers.getTransformFn(
        [defaults.moduleSystem, ...polyfillModuleNames],
        bundler,
        deltaBundler,
        config,
        transformOptions,
        resolverOptions,
      ),
      unstable_allowRequireContext:
        config.transformer.unstable_allowRequireContext,
      transformOptions,
      onProgress: null,
      lazy: false,
      unstable_enablePackageExports:
        config.resolver.unstable_enablePackageExports,
      shallow: false,
    },
  );
  return [
    _getPrelude({
      dev: options.dev,
      globalPrefix: config.transformer.globalPrefix,
      requireCycleIgnorePatterns: config.resolver.requireCycleIgnorePatterns,
    }),
    ...dependencies.values(),
  ];
}
function _getPrelude({ dev, globalPrefix, requireCycleIgnorePatterns }) {
  const code = (0, _getPreludeCode.default)({
    isDev: dev,
    globalPrefix,
    requireCycleIgnorePatterns,
  });
  const name = "__prelude__";
  return {
    dependencies: new Map(),
    getSource: () => Buffer.from(code),
    inverseDependencies: new _CountingSet.default(),
    path: name,
    output: [
      {
        type: "js/script/virtual",
        data: {
          code,
          lineCount: (0, _countLines.default)(code),
          map: [],
        },
      },
    ],
  };
}
