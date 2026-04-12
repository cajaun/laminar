"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = getAppendScripts;
var _getInlineSourceMappingURL = _interopRequireDefault(
  require("../DeltaBundler/Serializers/helpers/getInlineSourceMappingURL"),
);
var _sourceMapString = require("../DeltaBundler/Serializers/sourceMapString");
var _CountingSet = _interopRequireDefault(require("./CountingSet"));
var _countLines = _interopRequireDefault(require("./countLines"));
var _nullthrows = _interopRequireDefault(require("nullthrows"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function getAppendScripts(entryPoint, modules, options) {
  const output = [];
  if (options.runModule) {
    const paths = [...options.runBeforeMainModule, entryPoint];
    for (const path of paths) {
      if (modules.some((module) => module.path === path)) {
        const code = options.getRunModuleStatement(
          options.createModuleId(path),
          options.globalPrefix,
        );
        output.push({
          path: `require-${path}`,
          dependencies: new Map(),
          getSource: () => Buffer.from(""),
          inverseDependencies: new _CountingSet.default(),
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
        });
      }
    }
  }
  if (options.inlineSourceMap || options.sourceMapUrl) {
    const sourceMappingURL = options.inlineSourceMap
      ? (0, _getInlineSourceMappingURL.default)(
          (0, _sourceMapString.sourceMapString)(modules, {
            processModuleFilter: () => true,
            excludeSource: false,
            shouldAddToIgnoreList: options.shouldAddToIgnoreList,
            getSourceUrl: options.getSourceUrl,
          }),
        )
      : (0, _nullthrows.default)(options.sourceMapUrl);
    const code = `//# sourceMappingURL=${sourceMappingURL}`;
    output.push({
      path: "source-map",
      dependencies: new Map(),
      getSource: () => Buffer.from(""),
      inverseDependencies: new _CountingSet.default(),
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
    });
  }
  if (options.sourceUrl) {
    const code = `//# sourceURL=${options.sourceUrl}`;
    output.push({
      path: "source-url",
      dependencies: new Map(),
      getSource: () => Buffer.from(""),
      inverseDependencies: new _CountingSet.default(),
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
    });
  }
  return output;
}
