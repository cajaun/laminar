import type { ReadableStreamReadResult, StreamPipeOptions } from 'node:stream/web';
export declare function bodyToChunks(stream: ReadableStream<Uint8Array>, options?: StreamPipeOptions): AsyncGenerator<ReadableStreamReadResult<Uint8Array>>;
