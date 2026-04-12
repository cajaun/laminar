"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "metroWatchTypeScriptFiles", {
    enumerable: true,
    get: function() {
        return metroWatchTypeScriptFiles;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:start:server:metro:metroWatchTypeScriptFiles');
function metroWatchTypeScriptFiles({ metro, server, projectRoot, callback, tsconfig = false, throttle = false, eventTypes = [
    'add',
    'change',
    'delete'
] }) {
    const watcher = metro.getBundler().getBundler().getWatcher();
    const tsconfigPath = _path().default.join(projectRoot, 'tsconfig.json');
    const listener = ({ eventsQueue })=>{
        for (const event of eventsQueue){
            var _event_metadata;
            if (eventTypes.includes(event.type) && ((_event_metadata = event.metadata) == null ? void 0 : _event_metadata.type) !== 'd' && // We need to ignore node_modules because Metro will add all of the files in node_modules to the watcher.
            !/node_modules/.test(event.filePath) && // Ignore declaration files
            !/\.d\.ts$/.test(event.filePath)) {
                const { filePath } = event;
                // Is TypeScript?
                if (// If the user adds a TypeScript file to the observable files in their project.
                /\.tsx?$/.test(filePath) || // Or if the user adds a tsconfig.json file to the project root.
                tsconfig && filePath === tsconfigPath) {
                    debug('Detected TypeScript file changed in the project: ', filePath);
                    callback(event);
                    if (throttle) {
                        return;
                    }
                }
            }
        }
    };
    debug('Waiting for TypeScript files to be added to the project...');
    watcher.addListener('change', listener);
    watcher.addListener('add', listener);
    const off = ()=>{
        watcher.removeListener('change', listener);
        watcher.removeListener('add', listener);
    };
    server.addListener == null ? void 0 : server.addListener.call(server, 'close', off);
    return off;
}

//# sourceMappingURL=metroWatchTypeScriptFiles.js.map