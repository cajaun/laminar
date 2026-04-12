import { WebSocket, type RawData } from 'ws';
export type { WebSocket, RawData };
export declare function createWebSocket(url: URL | string): WebSocket;
