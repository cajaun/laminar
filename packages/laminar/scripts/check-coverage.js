const fs = require("node:fs");
const path = require("node:path");

const summaryPath = path.resolve(__dirname, "../coverage/coverage-summary.json");
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const modelMarker = `${path.sep}src${path.sep}model${path.sep}`;
const modelFiles = Object.entries(summary).filter(
  ([filePath]) => filePath !== "total" && filePath.includes(modelMarker)
);

if (modelFiles.length === 0) {
  throw new Error("Model coverage ratchet found no src/model files.");
}

const thresholds = {
  statements: 95,
  branches: 90,
  functions: 100,
  lines: 95,
};
const failures = [];

for (const [metric, threshold] of Object.entries(thresholds)) {
  const aggregate = modelFiles.reduce(
    (result, [, metrics]) => ({
      covered: result.covered + metrics[metric].covered,
      total: result.total + metrics[metric].total,
    }),
    { covered: 0, total: 0 }
  );
  const percentage =
    aggregate.total === 0 ? 100 : (aggregate.covered / aggregate.total) * 100;

  if (percentage + Number.EPSILON < threshold) {
    failures.push(
      `${metric}: ${percentage.toFixed(2)}% is below ${threshold}%`
    );
  }
}

if (failures.length > 0) {
  throw new Error(`Model coverage ratchet failed:\n${failures.join("\n")}`);
}

console.log(
  `Model coverage ratchet passed for ${modelFiles.length} source files.`
);
