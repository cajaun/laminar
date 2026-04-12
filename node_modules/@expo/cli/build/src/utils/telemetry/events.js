"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "commandEvent", {
    enumerable: true,
    get: function() {
        return commandEvent;
    }
});
function commandEvent(commandName) {
    return {
        event: 'action',
        properties: {
            action: `expo ${commandName}`
        }
    };
}

//# sourceMappingURL=events.js.map