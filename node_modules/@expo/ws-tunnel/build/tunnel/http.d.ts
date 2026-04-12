import { WebSocket } from 'ws';
import { RequestBodyChunkMessage, RequestMessage, RequestAbortMessage } from '../protocol';
export declare function handleProxiedRequest(tunnel: WebSocket, url: URL, message: RequestMessage): Promise<void>;
export declare function pushProxiedRequestBodyChunk(message: RequestBodyChunkMessage): Promise<void>;
export declare function abortProxiedRequest(message: RequestAbortMessage): Promise<void>;
