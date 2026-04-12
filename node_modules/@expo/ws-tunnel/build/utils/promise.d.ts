export type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;
export type PromiseReject = (reason?: any) => void;
export declare function withResolvers<T>(): {
    resolve: PromiseResolve<T>;
    reject: PromiseReject;
    promise: Promise<T>;
};
