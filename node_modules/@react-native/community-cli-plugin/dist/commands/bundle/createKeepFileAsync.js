"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _assetPathUtils = _interopRequireDefault(require("./assetPathUtils"));
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
async function createKeepFileAsync(assets, outputDirectory) {
  if (!assets.length) {
    return;
  }
  const assetsList = [];
  for (const asset of assets) {
    const prefix = _assetPathUtils.default.drawableFileTypes.has(asset.type)
      ? "drawable"
      : "raw";
    assetsList.push(
      `@${prefix}/${_assetPathUtils.default.getResourceIdentifier(asset)}`
    );
  }
  const keepPath = _path.default.join(outputDirectory, "raw/keep.xml");
  const content = `<resources xmlns:tools="http://schemas.android.com/tools" tools:keep="${assetsList.join(
    ","
  )}" />\n`;
  await _fs.default.promises.mkdir(_path.default.dirname(keepPath), {
    recursive: true,
  });
  await _fs.default.promises.writeFile(keepPath, content);
}
var _default = (exports.default = createKeepFileAsync);
