import { RequestID } from './identifiers';
export declare enum MessageType {
    Request = 1,
    RequestAbort = 2,
    RequestBodyChunk = 3,
    Response = 4,
    ResponseAbort = 5,
    ResponseBodyChunk = 6,
    WebSocketConnect = 7,
    WebSocketMessage = 8,
    WebSocketClose = 9
}
export declare const enum RequestMethodCode {
    GET = 1,
    HEAD = 2,
    POST = 3,
    PUT = 4,
    PATCH = 5,
    DELETE = 6,
    OPTIONS = 7
}
export type RequestMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export interface MessageShape {
    type: MessageType;
    id: RequestID;
}
export interface RequestMessage extends MessageShape {
    type: MessageType.Request;
    id: RequestID;
    hasContent: boolean;
    method: RequestMethod;
    url: string;
    headers: Headers;
}
export interface RequestAbortMessage extends MessageShape {
    type: MessageType.RequestAbort;
    id: RequestID;
    errored: boolean;
}
export interface RequestBodyChunkMessage extends MessageShape {
    type: MessageType.RequestBodyChunk;
    id: RequestID;
    end: boolean;
    data: Uint8Array | null;
}
export interface ResponseMessage extends MessageShape {
    type: MessageType.Response;
    id: RequestID;
    hasContent: boolean;
    status: number;
    headers: Headers;
}
export interface ResponseAbortMessage extends MessageShape {
    type: MessageType.ResponseAbort;
    id: RequestID;
    errored: boolean;
}
export interface ResponseBodyChunkMessage extends MessageShape {
    type: MessageType.ResponseBodyChunk;
    id: RequestID;
    end: boolean;
    data: Uint8Array | null;
}
export interface WebSocketConnectMessage extends MessageShape {
    type: MessageType.WebSocketConnect;
    id: RequestID;
    url: string;
}
export interface WebSocketMessageMessage extends MessageShape {
    type: MessageType.WebSocketMessage;
    id: RequestID;
    data: Uint8Array | string | null;
}
export interface WebSocketCloseMessage extends MessageShape {
    type: MessageType.WebSocketClose;
    id: RequestID;
}
export type Message = RequestMessage | RequestAbortMessage | RequestBodyChunkMessage | ResponseMessage | ResponseAbortMessage | ResponseBodyChunkMessage | WebSocketConnectMessage | WebSocketMessageMessage | WebSocketCloseMessage;
