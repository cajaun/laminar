"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.isResolvedDependency = isResolvedDependency;
function isResolvedDependency(dep) {
  return dep.absolutePath != null;
}
