"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _chalk = _interopRequireDefault(require("chalk"));
var _util = _interopRequireDefault(require("util"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const groupStack = [];
let collapsedGuardTimer;
var _default = (terminal, level, ...data) => {
  const logFunction = console[level] && level !== "trace" ? level : "log";
  const color =
    level === "error"
      ? _chalk.default.inverse.red
      : level === "warn"
        ? _chalk.default.inverse.yellow
        : _chalk.default.inverse.white;
  if (level === "group") {
    groupStack.push(level);
  } else if (level === "groupCollapsed") {
    groupStack.push(level);
    clearTimeout(collapsedGuardTimer);
    collapsedGuardTimer = setTimeout(() => {
      if (groupStack.includes("groupCollapsed")) {
        terminal.log(
          _chalk.default.inverse.yellow.bold(" WARN "),
          "Expected `console.groupEnd` to be called after `console.groupCollapsed`.",
        );
        groupStack.length = 0;
      }
    }, 3000);
    return;
  } else if (level === "groupEnd") {
    groupStack.pop();
    if (!groupStack.length) {
      clearTimeout(collapsedGuardTimer);
    }
    return;
  }
  if (!groupStack.includes("groupCollapsed")) {
    const lastItem = data[data.length - 1];
    if (typeof lastItem === "string") {
      data[data.length - 1] = lastItem.trimEnd();
    }
    terminal.log(
      color.bold(` ${logFunction.toUpperCase()} `) +
        "".padEnd(groupStack.length * 2, " "),
      _util.default.format(...data),
    );
  }
};
exports.default = _default;
