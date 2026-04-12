"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = parseJsonBody;
const CONTENT_TYPE = "application/json";
const SIZE_LIMIT = 100 * 1024 * 1024;
function parseJsonBody(req, options = {}) {
  const { strict = true } = options;
  return new Promise((resolve, reject) => {
    if (strict) {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes(CONTENT_TYPE)) {
        reject(new Error(`Invalid content type, expected ${CONTENT_TYPE}`));
        return;
      }
    }
    let size = 0;
    let data = "";
    req.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > SIZE_LIMIT) {
        req.destroy();
        reject(new Error("Request body size exceeds size limit (100MB)"));
        return;
      }
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
  });
}
