// See: https://github.com/facebook/metro/blob/v0.83.2/packages/metro/src/lib/CountingSet.js

export interface ReadOnlyCountingSet<T> extends Iterable<T> {
  get size(): number;
  has(item: T): boolean;
  [Symbol.iterator](): Iterator<T>; // NOTE(cedric): Flow doesn't like this, and causes failures when converting to TSD
  count(item: T): number;
  forEach<ThisT>(
    callbackFn: (this: ThisT, value: T, key: T, set: ReadOnlyCountingSet<T>) => any,
    // NOTE: Should be optional, but Flow seems happy to infer undefined here
    // which is what we want.
    thisArg: ThisT
  ): void;
}

/**
 * A Set that only deletes a given item when the number of delete(item) calls
 * matches the number of add(item) calls. Iteration and `size` are in terms of
 * *unique* items.
 */
export default class CountingSet<T> implements ReadOnlyCountingSet<T> {
  constructor(items?: Iterable<T>);
  has(item: T): boolean;
  add(item: T): void;
  delete(item: T): void;
  keys(): Iterator<T>;
  values(): Iterator<T>;
  entries(): Iterator<[T, T]>;
  [Symbol.iterator](): Iterator<T>; // NOTE(cedric): Flow doesn't like this, and causes failures when converting to TSD
  get size(): number;
  count(item: T): number;
  clear(): void;
  forEach<ThisT>(
    callbackFn: (this: ThisT, value: T, key: T, set: CountingSet<T>) => any,
    thisArg: ThisT
  ): void;
  /**
   * For Jest purposes. Ideally a custom serializer would be enough, but in
   * practice there is hardcoded magic for Set in toEqual (etc) that we cannot
   * extend to custom collection classes. Instead let's assume values are
   * sortable ( = strings) and make this look like an array with some stable
   * order.
   */
  toJSON(): any;
}
