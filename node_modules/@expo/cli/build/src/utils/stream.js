"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "streamToStringAsync", {
    enumerable: true,
    get: function() {
        return streamToStringAsync;
    }
});
async function streamToStringAsync(stream) {
    const decoder = new TextDecoder();
    const reader = stream.getReader();
    const outs = [];
    let result;
    do {
        result = await reader.read();
        if (result.value) {
            if (!(result.value instanceof Uint8Array)) {
                throw new Error('Unexepected buffer type');
            }
            outs.push(decoder.decode(result.value, {
                stream: true
            }));
        }
    }while (!result.done);
    outs.push(decoder.decode());
    return outs.join('');
}

//# sourceMappingURL=stream.js.map