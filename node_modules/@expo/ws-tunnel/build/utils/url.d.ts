/**
 * Create the private URL for the socket itself.
 * This includes a special flag for the tunnel service to mark this socket as the tunnel source.
 */
export declare function createSocketUrl(apiUrl: string, sessionId?: string): import("url").URL;
/**
 * Create the exposed tunnel URL from the actual socket URL.
 * This is visible for the user and may connect clients or other sockets.
 */
export declare function createTunnelUrl(socketUrl: string): import("url").URL;
