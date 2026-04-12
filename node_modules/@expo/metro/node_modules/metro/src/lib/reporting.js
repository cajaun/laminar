"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.logError = logError;
exports.logInfo = logInfo;
exports.logWarning = logWarning;
exports.nullReporter = void 0;
var _chalk = _interopRequireDefault(require("chalk"));
var _util = _interopRequireDefault(require("util"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
function logWarning(terminal, format, ...args) {
  const str = _util.default.format(format, ...args);
  terminal.log("%s %s", _chalk.default.yellow.inverse.bold(" WARN "), str);
}
function logError(terminal, format, ...args) {
  terminal.log(
    "%s %s",
    _chalk.default.red.inverse.bold(" ERROR "),
    _util.default.format(
      _chalk.default.supportsColor
        ? format
        : _util.default.stripVTControlCharacters(format),
      ...args,
    ),
  );
}
function logInfo(terminal, format, ...args) {
  const str = _util.default.format(format, ...args);
  terminal.log("%s %s", _chalk.default.cyan.inverse.bold(" INFO "), str);
}
const nullReporter = (exports.nullReporter = {
  update() {},
});
