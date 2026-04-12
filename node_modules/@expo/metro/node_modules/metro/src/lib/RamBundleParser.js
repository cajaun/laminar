"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _magicNumber = _interopRequireDefault(
  require("../shared/output/RamBundle/magic-number"),
);
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const SIZEOF_UINT32 = 4;
const HEADER_SIZE = 3;
class RamBundleParser {
  constructor(buffer) {
    this._buffer = buffer;
    if (this._readPosition(0) !== _magicNumber.default) {
      throw new Error("File is not a RAM bundle file");
    }
    this._numModules = this._readPosition(1);
    this._startupCodeLength = this._readPosition(2);
    this._startOffset = (HEADER_SIZE + this._numModules * 2) * SIZEOF_UINT32;
  }
  _readPosition(pos) {
    return this._buffer.readUInt32LE(pos * SIZEOF_UINT32);
  }
  getStartupCode() {
    const start = this._startOffset;
    const end = start + this._startupCodeLength - 1;
    return this._buffer.toString("utf8", start, end);
  }
  getModule(id) {
    const moduleOffset = this._readPosition(HEADER_SIZE + id * 2);
    const moduleLength = this._readPosition(HEADER_SIZE + id * 2 + 1);
    const start = this._startOffset + moduleOffset;
    const end = start + moduleLength - 1;
    return this._buffer.toString("utf8", start, end);
  }
}
exports.default = RamBundleParser;
