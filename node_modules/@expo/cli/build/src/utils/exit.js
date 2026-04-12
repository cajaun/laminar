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
    ensureProcessExitsAfterDelay: function() {
        return ensureProcessExitsAfterDelay;
    },
    installExitHooks: function() {
        return installExitHooks;
    }
});
function _nodechild_process() {
    const data = require("node:child_process");
    _nodechild_process = function() {
        return data;
    };
    return data;
}
function _nodeprocess() {
    const data = /*#__PURE__*/ _interop_require_default(require("node:process"));
    _nodeprocess = function() {
        return data;
    };
    return data;
}
const _fn = require("./fn");
const _log = require("../log");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:utils:exit');
const PRE_EXIT_SIGNALS = [
    'SIGHUP',
    'SIGINT',
    'SIGTERM',
    'SIGBREAK'
];
// We create a queue since Node.js throws an error if we try to append too many listeners:
// (node:4405) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 SIGINT listeners added to [process]. Use emitter.setMaxListeners() to increase limit
const queue = [];
let unsubscribe = null;
function installExitHooks(asyncExitHook) {
    // We need to instantiate the master listener the first time the queue is used.
    if (!queue.length) {
        // Track the master listener so we can remove it later.
        unsubscribe = attachMasterListener();
    }
    queue.push(asyncExitHook);
    return ()=>{
        const index = queue.indexOf(asyncExitHook);
        if (index >= 0) {
            queue.splice(index, 1);
        }
        // Clean up the master listener if we don't need it anymore.
        if (!queue.length) {
            unsubscribe == null ? void 0 : unsubscribe();
        }
    };
}
// Create a function that runs before the process exits and guards against running multiple times.
function createExitHook(signal) {
    return (0, _fn.guardAsync)(async ()=>{
        debug(`pre-exit (signal: ${signal}, queue length: ${queue.length})`);
        for (const [index, hookAsync] of Object.entries(queue)){
            try {
                await hookAsync(signal);
            } catch (error) {
                debug(`Error in exit hook: %O (queue: ${index})`, error);
            }
        }
        debug(`post-exit (code: ${_nodeprocess().default.exitCode ?? 0})`);
        _nodeprocess().default.exit();
    });
}
function attachMasterListener() {
    const hooks = [];
    for (const signal of PRE_EXIT_SIGNALS){
        const hook = createExitHook(signal);
        hooks.push([
            signal,
            hook
        ]);
        _nodeprocess().default.on(signal, hook);
    }
    return ()=>{
        for (const [signal, hook] of hooks){
            _nodeprocess().default.removeListener(signal, hook);
        }
    };
}
function ensureProcessExitsAfterDelay(waitUntilExitMs = 10000, startedAtMs = Date.now()) {
    // Create a list of the expected active resources before exiting.
    // Note, the order is undeterministic
    const expectedResources = [
        _nodeprocess().default.stdout.isTTY ? 'TTYWrap' : 'PipeWrap',
        _nodeprocess().default.stderr.isTTY ? 'TTYWrap' : 'PipeWrap',
        _nodeprocess().default.stdin.isTTY ? 'TTYWrap' : 'PipeWrap'
    ];
    // Check active resources, besides the TTYWrap/PipeWrap (process.stdin, process.stdout, process.stderr)
    const activeResources = _nodeprocess().default.getActiveResourcesInfo();
    // Filter the active resource list by subtracting the expected resources, in undeterministic order
    const unexpectedActiveResources = activeResources.filter((activeResource)=>{
        const index = expectedResources.indexOf(activeResource);
        if (index >= 0) {
            expectedResources.splice(index, 1);
            return false;
        }
        return true;
    });
    const canExitProcess = !unexpectedActiveResources.length;
    if (canExitProcess) {
        return debug('no active resources detected, process can safely exit');
    } else {
        debug(`process is trying to exit, but is stuck on unexpected active resources:`, unexpectedActiveResources);
    }
    // Check if the process needs to be force-closed
    const elapsedTime = Date.now() - startedAtMs;
    if (elapsedTime > waitUntilExitMs) {
        debug('active handles detected past the exit delay, forcefully exiting:', activeResources);
        tryWarnActiveProcesses();
        return _nodeprocess().default.exit(0);
    }
    const timeoutId = setTimeout(()=>{
        // Ensure the timeout is cleared before checking the active resources
        clearTimeout(timeoutId);
        // Check if the process can exit
        ensureProcessExitsAfterDelay(waitUntilExitMs, startedAtMs);
    }, 100);
}
/**
 * Try to warn the user about unexpected active processes running in the background.
 * This uses the internal `process._getActiveHandles` method, within a try-catch block.
 * If active child processes are detected, the commands of these processes are logged.
 *
 * @example ```bash
 * Done writing bundle output
 * Detected 2 processes preventing Expo from exiting, forcefully exiting now.
 *   - node /Users/cedric/../node_modules/nativewind/dist/metro/tailwind/v3/child.js
 *   - node /Users/cedric/../node_modules/nativewind/dist/metro/tailwind/v3/child.js
 * ```
 */ function tryWarnActiveProcesses() {
    let activeProcesses = [];
    try {
        const children = _nodeprocess().default// @ts-expect-error - This is an internal method, not designed to be exposed. It's also our only way to get this info
        ._getActiveHandles().filter((handle)=>handle instanceof _nodechild_process().ChildProcess);
        if (children.length) {
            activeProcesses = children.map((child)=>child.spawnargs.join(' '));
        }
    } catch (error) {
        debug('failed to get active process information:', error);
    }
    if (!activeProcesses.length) {
        (0, _log.warn)('Something prevented Expo from exiting, forcefully exiting now.');
    } else {
        const singularOrPlural = activeProcesses.length === 1 ? '1 process' : `${activeProcesses.length} processes`;
        (0, _log.warn)(`Detected ${singularOrPlural} preventing Expo from exiting, forcefully exiting now.`);
        (0, _log.warn)('  - ' + activeProcesses.join('\n  - '));
    }
}

//# sourceMappingURL=exit.js.map