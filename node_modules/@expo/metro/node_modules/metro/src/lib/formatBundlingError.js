"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = formatBundlingError;
var _GraphNotFoundError = _interopRequireDefault(
  require("../IncrementalBundler/GraphNotFoundError"),
);
var _ResourceNotFoundError = _interopRequireDefault(
  require("../IncrementalBundler/ResourceNotFoundError"),
);
var _RevisionNotFoundError = _interopRequireDefault(
  require("../IncrementalBundler/RevisionNotFoundError"),
);
var _ModuleResolution = require("../node-haste/DependencyGraph/ModuleResolution");
var _codeFrame = require("@babel/code-frame");
var _errorStackParser = _interopRequireDefault(require("error-stack-parser"));
var _fs = _interopRequireDefault(require("fs"));
var _metroCore = require("metro-core");
var _serializeError = _interopRequireDefault(require("serialize-error"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function formatBundlingError(error) {
  if (error instanceof _metroCore.AmbiguousModuleResolutionError) {
    const he = error.hasteError;
    const message =
      "Ambiguous resolution: module '" +
      `${error.fromModulePath}\' tries to require \'${he.hasteName}\', but ` +
      "there are several files providing this module. You can delete or " +
      "fix them: \n\n" +
      Object.keys(he.duplicatesSet)
        .sort()
        .map((dupFilePath) => `${dupFilePath}`)
        .join("\n\n");
    return {
      type: "AmbiguousModuleResolutionError",
      message,
      errors: [
        {
          description: message,
        },
      ],
    };
  }
  if (
    error instanceof _ModuleResolution.UnableToResolveError ||
    (error instanceof Error &&
      (error.type === "TransformError" || error.type === "NotFoundError"))
  ) {
    return {
      ...(0, _serializeError.default)(error),
      type: error.type,
      errors: [
        {
          description: error.message,
          filename: error.filename,
          lineNumber: error.lineNumber,
        },
      ],
    };
  } else if (error instanceof _ResourceNotFoundError.default) {
    return {
      type: "ResourceNotFoundError",
      errors: [],
      message: error.message,
    };
  } else if (error instanceof _GraphNotFoundError.default) {
    return {
      type: "GraphNotFoundError",
      errors: [],
      message: error.message,
    };
  } else if (error instanceof _RevisionNotFoundError.default) {
    return {
      type: "RevisionNotFoundError",
      errors: [],
      message: error.message,
    };
  } else {
    const stack = _errorStackParser.default.parse(error);
    const fileName = stack[0].fileName;
    const column = stack[0].columnNumber;
    const line = stack[0].lineNumber;
    let codeFrame = "";
    try {
      codeFrame = (0, _codeFrame.codeFrameColumns)(
        _fs.default.readFileSync(fileName, "utf8"),
        {
          start: {
            column,
            line,
          },
        },
        {
          forceColor: true,
        },
      );
    } catch {}
    return {
      type: "InternalError",
      errors: [],
      message: `Metro has encountered an error: ${error.message}: ${fileName} (${line}:${column})\n\n${codeFrame}`,
    };
  }
}
