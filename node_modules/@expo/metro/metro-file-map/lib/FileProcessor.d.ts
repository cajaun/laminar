/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 * @oncall react_native
 */

import type { FileMetadata, PerfLogger } from "../flow-types";
export interface ProcessFileRequest {
  /**
   * Populate metadata[H.SHA1] with the SHA1 of the file's contents.
   */
  readonly computeSha1: boolean;
  /**
   * Populate metadata[H.DEPENDENCIES] with unresolved dependency specifiers
   * using the dependencyExtractor provided to the constructor.
   */
  readonly computeDependencies: boolean;
  /**
   * Only if processing has already required reading the file's contents, return
   * the contents as a Buffer - null otherwise. Not supported for batches.
   */
  readonly maybeReturnContent: boolean;
}
export interface MaybeCodedError extends Error {
  code?: string;
}
export declare class FileProcessor {
  constructor(opts: {
    readonly dependencyExtractor?: null | string;
    readonly enableHastePackages: boolean;
    readonly enableWorkerThreads: boolean;
    readonly hasteImplModulePath?: null | string;
    readonly maxFilesPerWorker?: null | undefined | number;
    readonly maxWorkers: number;
    readonly perfLogger?: null | PerfLogger;
  });
  processBatch(files: ReadonlyArray<[string, FileMetadata]>, req: ProcessFileRequest): Promise<{
    errors: Array<{
      absolutePath: string;
      error: MaybeCodedError;
    }>;
  }>;
  processRegularFile(absolutePath: string, fileMetadata: FileMetadata, req: ProcessFileRequest): null | undefined | {
    content?: null | Buffer;
  };
  end(): Promise<void>;
}