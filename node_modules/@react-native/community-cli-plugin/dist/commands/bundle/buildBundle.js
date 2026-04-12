"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.unstable_buildBundleWithConfig = exports.default = void 0;
var _loadMetroConfig = _interopRequireDefault(
  require("../../utils/loadMetroConfig")
);
var _parseKeyValueParamArray = _interopRequireDefault(
  require("../../utils/parseKeyValueParamArray")
);
var _saveAssets = _interopRequireDefault(require("./saveAssets"));
var _fs = require("fs");
var _metro = require("metro");
var _path = _interopRequireDefault(require("path"));
var _util = require("util");
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
async function buildBundle(_argv, ctx, args, bundleImpl) {
  const config = await (0, _loadMetroConfig.default)(ctx, {
    maxWorkers: args.maxWorkers,
    resetCache: args.resetCache,
    config: args.config,
  });
  return buildBundleWithConfig(args, config, bundleImpl);
}
async function buildBundleWithConfig(args, config, bundleImpl) {
  const customResolverOptions = (0, _parseKeyValueParamArray.default)(
    args.resolverOption ?? []
  );
  if (config.resolver.platforms.indexOf(args.platform) === -1) {
    console.error(
      `${(0, _util.styleText)("red", "error")}: Invalid platform ${
        args.platform ? `"${(0, _util.styleText)("bold", args.platform)}" ` : ""
      }selected.`
    );
    console.info(
      `Available platforms are: ${config.resolver.platforms
        .map((x) => `"${(0, _util.styleText)("bold", x)}"`)
        .join(
          ", "
        )}. If you are trying to bundle for an out-of-tree platform, it may not be installed.`
    );
    throw new Error("Bundling failed");
  }
  process.env.NODE_ENV = args.dev ? "development" : "production";
  let sourceMapUrl = args.sourcemapOutput;
  if (sourceMapUrl != null && !args.sourcemapUseAbsolutePath) {
    sourceMapUrl = _path.default.basename(sourceMapUrl);
  }
  const runBuildOptions = {
    assets: args.assetsDest != null,
    bundleOut: args.bundleOutput,
    customResolverOptions,
    dev: args.dev,
    entry: args.entryFile,
    minify: args.minify !== undefined ? args.minify : !args.dev,
    output: bundleImpl,
    platform: args.platform,
    sourceMap: args.sourcemapOutput != null,
    sourceMapOut: args.sourcemapOutput,
    sourceMapUrl,
    unstable_transformProfile: args.unstableTransformProfile,
  };
  await _fs.promises.mkdir(_path.default.dirname(args.bundleOutput), {
    recursive: true,
    mode: 0o755,
  });
  const result = await (0, _metro.runBuild)(config, runBuildOptions);
  if (args.assetsDest == null) {
    console.warn("Warning: Assets destination folder is not set, skipping...");
    return;
  }
  if (result.assets == null) {
    throw new Error("Assets missing from Metro's runBuild result");
  }
  const outputAssets = result.assets;
  await (0, _saveAssets.default)(
    outputAssets,
    args.platform,
    args.assetsDest,
    args.assetCatalogDest
  );
}
const unstable_buildBundleWithConfig = (exports.unstable_buildBundleWithConfig =
  buildBundleWithConfig);
var _default = (exports.default = buildBundle);
