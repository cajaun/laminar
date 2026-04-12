"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = parseCustomTransformOptions;
const PREFIX = "transform.";
function parseCustomTransformOptions(searchParams) {
  const customTransformOptions = Object.create(null);
  searchParams.forEach((value, key) => {
    if (key.startsWith(PREFIX)) {
      customTransformOptions[key.substring(PREFIX.length)] = value;
    }
  });
  return customTransformOptions;
}
