/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  rootDir: "../..",
  roots: ["<rootDir>/packages/laminar"],
  watchman: false,
  testMatch: ["<rootDir>/packages/laminar/test/**/*.test.ts?(x)"],
  setupFilesAfterEnv: [
    "<rootDir>/packages/laminar/test/support/jest.setup.ts",
  ],
  collectCoverageFrom: [
    "packages/laminar/src/**/*.{ts,tsx}",
    "!packages/laminar/src/declarations.d.ts",
    "!packages/laminar/src/types.ts",
  ],
  coverageDirectory: "<rootDir>/packages/laminar/coverage",
  coverageReporters: ["text", "json-summary", "lcov"],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 100,
      lines: 95,
      statements: 95,
    },
  },
  clearMocks: true,
  restoreMocks: true,
};
