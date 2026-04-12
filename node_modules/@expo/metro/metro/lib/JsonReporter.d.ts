import type { Writable } from "node:stream";
export interface SerializedError {
  message: string;
  stack: string;
  errors?: ReadonlyArray<SerializedError>;
  cause?: SerializedError;
}
export type SerializedEvent<TEvent extends {
  [$$Key$$: string]: any;
}> = any;
declare class JsonReporter<TEvent extends {
  [$$Key$$: string]: any;
}> {
  _stream: Writable;
  constructor(stream: Writable);
  update(event: TEvent): void;
}
export default JsonReporter;