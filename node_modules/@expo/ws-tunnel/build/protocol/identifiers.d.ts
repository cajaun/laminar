export type RequestID = number & {
    /** Marker to indicate that a `IdentifierSeed` may not be created directly */
    readonly _opaque: unique symbol;
};
export declare const nextRequestID: (previousRequestId: RequestID | undefined | null) => RequestID;
