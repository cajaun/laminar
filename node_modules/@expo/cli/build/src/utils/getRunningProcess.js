"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getDirectoryOfProcessById: function() {
        return getDirectoryOfProcessById;
    },
    getPID: function() {
        return getPID;
    },
    getRunningProcess: function() {
        return getRunningProcess;
    }
});
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_wildcard(require("path"));
    _path = function() {
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
const debug = require('debug')('expo:utils:getRunningProcess');
const defaultOptions = {
    encoding: 'utf8',
    stdio: [
        'pipe',
        'pipe',
        'ignore'
    ]
};
function getPID(port) {
    try {
        const results = (0, _child_process().execFileSync)('lsof', [
            `-i:${port}`,
            '-P',
            '-t',
            '-sTCP:LISTEN'
        ], defaultOptions).split('\n')[0].trim();
        const pid = Number(results);
        debug(`pid: ${pid} for port: ${port}`);
        return pid;
    } catch (error) {
        debug(`No pid found for port: ${port}. Error: ${error}`);
        return null;
    }
}
/** Get `package.json` `name` field for a given directory. Returns `null` if none exist. */ function getPackageName(packageRoot) {
    const packageJson = _path().join(packageRoot, 'package.json');
    try {
        return require(packageJson).name || null;
    } catch  {
        return null;
    }
}
/** Returns a command like `node /Users/evanbacon/.../bin/expo start` or the package.json name. */ function getProcessCommand(pid, procDirectory) {
    const name = getPackageName(procDirectory);
    if (name) {
        return name;
    }
    return (0, _child_process().execSync)(`ps -o command -p ${pid} | sed -n 2p`, defaultOptions).replace(/\n$/, '').trim();
}
function getDirectoryOfProcessById(processId) {
    return (0, _child_process().execSync)(`lsof -p ${processId} | awk '$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}'`, defaultOptions).trim();
}
function getRunningProcess(port) {
    // 63828
    const pid = getPID(port);
    if (!pid) {
        return null;
    }
    try {
        // /Users/evanbacon/Documents/GitHub/lab/myapp
        const directory = getDirectoryOfProcessById(pid);
        // /Users/evanbacon/Documents/GitHub/lab/myapp/package.json
        const command = getProcessCommand(pid, directory);
        // TODO: Have a better message for reusing another process.
        return {
            pid,
            directory,
            command
        };
    } catch  {
        return null;
    }
}

//# sourceMappingURL=getRunningProcess.js.map