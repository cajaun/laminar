"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "evaluateJsFromCdpAsync", {
    enumerable: true,
    get: function() {
        return evaluateJsFromCdpAsync;
    }
});
function _ws() {
    const data = require("ws");
    _ws = function() {
        return data;
    };
    return data;
}
const debug = require('debug')('expo:start:server:middleware:inspector:CdpClient');
function evaluateJsFromCdpAsync(webSocketDebuggerUrl, source, timeoutMs = 2000) {
    const REQUEST_ID = 0;
    let timeoutHandle;
    return new Promise((resolve, reject)=>{
        let settled = false;
        const ws = new (_ws()).WebSocket(webSocketDebuggerUrl);
        timeoutHandle = setTimeout(()=>{
            debug(`[evaluateJsFromCdpAsync] Request timeout from ${webSocketDebuggerUrl}`);
            reject(new Error('Request timeout'));
            settled = true;
            ws.close();
        }, timeoutMs);
        ws.on('open', ()=>{
            ws.send(JSON.stringify({
                id: REQUEST_ID,
                method: 'Runtime.evaluate',
                params: {
                    expression: source
                }
            }));
        });
        ws.on('error', (e)=>{
            debug(`[evaluateJsFromCdpAsync] Failed to connect ${webSocketDebuggerUrl}`, e);
            reject(e);
            settled = true;
            clearTimeout(timeoutHandle);
            ws.close();
        });
        ws.on('close', ()=>{
            if (!settled) {
                reject(new Error('WebSocket closed before response was received.'));
                clearTimeout(timeoutHandle);
            }
        });
        ws.on('message', (data)=>{
            debug(`[evaluateJsFromCdpAsync] message received from ${webSocketDebuggerUrl}: ${data.toString()}`);
            try {
                const response = JSON.parse(data.toString());
                if (response.id === REQUEST_ID) {
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else if (response.result.result.type === 'string') {
                        resolve(response.result.result.value);
                    } else {
                        resolve(undefined);
                    }
                    settled = true;
                    clearTimeout(timeoutHandle);
                    ws.close();
                }
            } catch (e) {
                reject(e);
                settled = true;
                clearTimeout(timeoutHandle);
                ws.close();
            }
        });
    });
}

//# sourceMappingURL=CdpClient.js.map