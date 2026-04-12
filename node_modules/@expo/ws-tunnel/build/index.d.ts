import { type TunnelOptions } from './tunnel/tunnel';
export type { TunnelOptions as WsTunnelOptions } from './tunnel/tunnel';
export declare function startAsync(options: TunnelOptions): Promise<string>;
export declare function stopAsync(): Promise<void>;
