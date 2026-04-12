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

type ProcessBatch<TItem, TResult> = (batch: Array<TItem>) => Promise<Array<TResult>>;
export interface BatchProcessorOptions {
  maximumDelayMs: number;
  maximumItems: number;
  concurrency: number;
}
export interface QueueItem<TItem, TResult> {
  item: TItem;
  reject: (error: any) => any;
  resolve: (result: TResult) => any;
}
/**
 * We batch items together trying to minimize their processing, for example as
 * network queries. For that we wait a small moment before processing a batch.
 * We limit also the number of items we try to process in a single batch so that
 * if we have many items pending in a short amount of time, we can start
 * processing right away.
 */
declare class BatchProcessor<TItem, TResult> {
  _currentProcessCount: number;
  _options: BatchProcessorOptions;
  _processBatch: ProcessBatch<TItem, TResult>;
  _queue: Array<QueueItem<TItem, TResult>>;
  _timeoutHandle: null | undefined | NodeJS.Timeout;
  constructor(options: BatchProcessorOptions, processBatch: ProcessBatch<TItem, TResult>);
  _onBatchFinished(): void;
  _onBatchResults(jobs: Array<QueueItem<TItem, TResult>>, results: Array<TResult>): void;
  _onBatchError(jobs: Array<QueueItem<TItem, TResult>>, error: any): void;
  _processQueue(): void;
  _processQueueOnceReady(): void;
  queue(item: TItem): Promise<TResult>;
  getQueueLength(): number;
}
export default BatchProcessor;