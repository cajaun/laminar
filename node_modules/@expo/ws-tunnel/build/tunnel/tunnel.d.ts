export interface TunnelOptions {
    /** The main URL of the ws tunnel service */
    apiUrl?: string;
    /** The (unique) session identifier */
    session: string;
    /** The maximum amount of times the connection can be retried when establishing connection */
    maxReconnect?: number;
    /**
     * Event handler to inform uses based on tunnel status changes.
     *   - connecting, when the tunnel is trying to connect for the first time
     *   - connected, when the tunnel is active and ready
     *   - reconnecting, when the tunnel is trying to re-establish a lost connection
     *   - disconnected, when the tunnel failed to re-establish a lost connection
     */
    onStatusChange?: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected') => void;
}
/**
 * Create a new tunnel instance.
 * Note, this doesn't start the tunnel itself yet.
 */
export declare function createTunnel(): {
    start({ apiUrl, session, maxReconnect, onStatusChange, }: TunnelOptions): Promise<string>;
    stop(): void;
};
