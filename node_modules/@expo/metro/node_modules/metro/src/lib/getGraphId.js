"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = getGraphId;
var _canonicalize = _interopRequireDefault(
  require("metro-core/private/canonicalize"),
);
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function getGraphId(
  entryFile,
  options,
  { shallow, lazy, unstable_allowRequireContext, resolverOptions },
) {
  return JSON.stringify(
    {
      entryFile,
      options: {
        customResolverOptions: resolverOptions.customResolverOptions ?? {},
        customTransformOptions: options.customTransformOptions ?? null,
        dev: options.dev,
        experimentalImportSupport: options.experimentalImportSupport || false,
        minify: options.minify,
        platform: options.platform != null ? options.platform : null,
        type: options.type,
        lazy,
        unstable_allowRequireContext,
        shallow,
        unstable_transformProfile:
          options.unstable_transformProfile || "default",
      },
    },
    _canonicalize.default,
  );
}
