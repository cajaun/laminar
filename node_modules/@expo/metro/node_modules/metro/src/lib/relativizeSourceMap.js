"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = relativizeSourceMapInline;
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function relativizeSourceMapInline(sourceMap, sourcesRoot) {
  if (sourceMap.mappings === undefined) {
    for (let i = 0; i < sourceMap.sections.length; i++) {
      relativizeSourceMapInline(sourceMap.sections[i].map, sourcesRoot);
    }
  } else {
    for (let i = 0; i < sourceMap.sources.length; i++) {
      sourceMap.sources[i] = _path.default.relative(
        sourcesRoot,
        sourceMap.sources[i],
      );
    }
  }
}
