"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.FileProcessor = void 0;
var _constants = _interopRequireDefault(require("../constants"));
var _worker = require("../worker");
var _jestWorker = require("jest-worker");
var _path = require("path");
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const debug = require("debug")("Metro:FileMap");
const NODE_MODULES = _path.sep + "node_modules" + _path.sep;
const MAX_FILES_PER_WORKER = 100;
class FileProcessor {
  #dependencyExtractor;
  #enableHastePackages;
  #hasteImplModulePath;
  #enableWorkerThreads;
  #maxFilesPerWorker;
  #maxWorkers;
  #perfLogger;
  #workerArgs;
  #inBandWorker;
  constructor(opts) {
    this.#dependencyExtractor = opts.dependencyExtractor;
    this.#enableHastePackages = opts.enableHastePackages;
    this.#enableWorkerThreads = opts.enableWorkerThreads;
    this.#hasteImplModulePath = opts.hasteImplModulePath;
    this.#maxFilesPerWorker = opts.maxFilesPerWorker ?? MAX_FILES_PER_WORKER;
    this.#maxWorkers = opts.maxWorkers;
    this.#workerArgs = {};
    this.#inBandWorker = new _worker.Worker(this.#workerArgs);
    this.#perfLogger = opts.perfLogger;
  }
  async processBatch(files, req) {
    const errors = [];
    const numWorkers = Math.min(
      this.#maxWorkers,
      Math.ceil(files.length / this.#maxFilesPerWorker),
    );
    const batchWorker = this.#getBatchWorker(numWorkers);
    if (req.maybeReturnContent) {
      throw new Error(
        "Batch processing does not support returning file contents",
      );
    }
    await Promise.all(
      files.map(([absolutePath, fileMetadata]) => {
        const maybeWorkerInput = this.#getWorkerInput(
          absolutePath,
          fileMetadata,
          req,
        );
        if (!maybeWorkerInput) {
          return null;
        }
        return batchWorker
          .processFile(maybeWorkerInput)
          .then((reply) => processWorkerReply(reply, fileMetadata))
          .catch((error) =>
            errors.push({
              absolutePath,
              error: normalizeWorkerError(error),
            }),
          );
      }),
    );
    await batchWorker.end();
    return {
      errors,
    };
  }
  processRegularFile(absolutePath, fileMetadata, req) {
    const workerInput = this.#getWorkerInput(absolutePath, fileMetadata, req);
    return workerInput
      ? {
          content: processWorkerReply(
            this.#inBandWorker.processFile(workerInput),
            fileMetadata,
          ),
        }
      : null;
  }
  #getWorkerInput(absolutePath, fileMetadata, req) {
    const computeSha1 =
      req.computeSha1 && fileMetadata[_constants.default.SHA1] == null;
    const { computeDependencies, maybeReturnContent } = req;
    if (absolutePath.includes(NODE_MODULES)) {
      if (computeSha1) {
        return {
          computeDependencies: false,
          computeSha1: true,
          dependencyExtractor: null,
          enableHastePackages: false,
          filePath: absolutePath,
          hasteImplModulePath: null,
          maybeReturnContent,
        };
      }
      return null;
    }
    return {
      computeDependencies,
      computeSha1,
      dependencyExtractor: this.#dependencyExtractor,
      enableHastePackages: this.#enableHastePackages,
      filePath: absolutePath,
      hasteImplModulePath: this.#hasteImplModulePath,
      maybeReturnContent,
    };
  }
  #getBatchWorker(numWorkers) {
    if (numWorkers <= 1) {
      return {
        processFile: async (message) => this.#inBandWorker.processFile(message),
        end: async () => {},
      };
    }
    const workerPath = require.resolve("../worker");
    debug(
      "Creating worker farm of %d worker %s",
      numWorkers,
      this.#enableWorkerThreads ? "threads" : "processes",
    );
    this.#perfLogger?.point("initWorkers_start");
    const jestWorker = new _jestWorker.Worker(workerPath, {
      exposedMethods: ["processFile"],
      maxRetries: 3,
      numWorkers,
      enableWorkerThreads: this.#enableWorkerThreads,
      forkOptions: {
        execArgv: [],
      },
      setupArgs: [this.#workerArgs],
    });
    this.#perfLogger?.point("initWorkers_end");
    this.#perfLogger = null;
    return jestWorker;
  }
  async end() {}
}
exports.FileProcessor = FileProcessor;
function processWorkerReply(metadata, fileMetadata) {
  fileMetadata[_constants.default.VISITED] = 1;
  const metadataId = metadata.id;
  if (metadataId != null) {
    fileMetadata[_constants.default.ID] = metadataId;
  }
  fileMetadata[_constants.default.DEPENDENCIES] = metadata.dependencies
    ? metadata.dependencies.join(_constants.default.DEPENDENCY_DELIM)
    : "";
  if (metadata.sha1 != null) {
    fileMetadata[_constants.default.SHA1] = metadata.sha1;
  }
  return metadata.content;
}
function normalizeWorkerError(mixedError) {
  if (
    mixedError == null ||
    typeof mixedError !== "object" ||
    mixedError.message == null ||
    mixedError.stack == null
  ) {
    const error = new Error(mixedError);
    error.stack = "";
    return error;
  }
  return mixedError;
}
