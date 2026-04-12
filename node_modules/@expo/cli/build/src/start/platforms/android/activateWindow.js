"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "activateWindowAsync", {
    enumerable: true,
    get: function() {
        return activateWindowAsync;
    }
});
function _osascript() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("@expo/osascript"));
    _osascript = function() {
        return data;
    };
    return data;
}
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const debug = require('debug')('expo:start:platforms:android:activateWindow');
function getUnixPID(port) {
    var _execFileSync_split__trim, _execFileSync_split_;
    // Runs like `lsof -i:8081 -P -t -sTCP:LISTEN`
    const args = [
        `-i:${port}`,
        '-P',
        '-t',
        '-sTCP:LISTEN'
    ];
    debug('lsof ' + args.join(' '));
    return (_execFileSync_split_ = (0, _child_process().execFileSync)('lsof', args, {
        encoding: 'utf8',
        stdio: [
            'pipe',
            'pipe',
            'ignore'
        ]
    }).split('\n')[0]) == null ? void 0 : (_execFileSync_split__trim = _execFileSync_split_.trim) == null ? void 0 : _execFileSync_split__trim.call(_execFileSync_split_);
}
async function activateWindowAsync(device) {
    var _device_pid_match;
    debug(`Activating window for device (pid: ${device.pid}, type: ${device.type})`);
    if (// only mac is supported for now.
    process.platform !== 'darwin' || // can only focus emulators
    device.type !== 'emulator') {
        return false;
    }
    // Google Emulator ID: `emulator-5554` -> `5554`
    const androidPid = (_device_pid_match = device.pid.match(/-(\d+)/)) == null ? void 0 : _device_pid_match[1];
    if (!androidPid) {
        return false;
    }
    // Unix PID
    const pid = getUnixPID(androidPid);
    if (!pid) {
        return false;
    }
    debug(`Activate window for pid:`, pid);
    try {
        await _osascript().execAsync(`
    tell application "System Events"
      set frontmost of the first process whose unix id is ${pid} to true
    end tell`);
        return true;
    } catch  {
        // noop -- this feature is very specific and subject to failure.
        return false;
    }
}

//# sourceMappingURL=activateWindow.js.map