"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = parseCustomResolverOptions;
const PREFIX = "resolver.";
function parseCustomResolverOptions(searchParams) {
  const customResolverOptions = Object.create(null);
  searchParams.forEach((value, key) => {
    if (key.startsWith(PREFIX)) {
      customResolverOptions[key.substring(PREFIX.length)] = value;
    }
  });
  return customResolverOptions;
}
