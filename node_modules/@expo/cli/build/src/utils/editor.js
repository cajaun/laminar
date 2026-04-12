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
    guessEditor: function() {
        return guessEditor;
    },
    openInEditorAsync: function() {
        return openInEditorAsync;
    }
});
function _spawnasync() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/spawn-async"));
    _spawnasync = function() {
        return data;
    };
    return data;
}
function _enveditor() {
    const data = /*#__PURE__*/ _interop_require_default(require("env-editor"));
    _enveditor = function() {
        return data;
    };
    return data;
}
const _env = require("./env");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../log"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
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
const debug = require('debug')('expo:utils:editor');
function guessEditor() {
    try {
        const editor = _env.env.EXPO_EDITOR;
        if (editor) {
            debug('Using $EXPO_EDITOR:', editor);
            return _enveditor().default.getEditor(editor);
        }
        debug('Falling back on $EDITOR:', editor);
        return _enveditor().default.defaultEditor();
    } catch  {
        debug('Falling back on vscode');
        return _enveditor().default.getEditor('vscode');
    }
}
async function openInEditorAsync(path, lineNumber) {
    const editor = guessEditor();
    const fileReference = lineNumber ? `${path}:${lineNumber}` : path;
    debug(`Opening ${fileReference} in ${editor == null ? void 0 : editor.name} (bin: ${editor == null ? void 0 : editor.binary}, id: ${editor == null ? void 0 : editor.id})`);
    if (editor) {
        try {
            await (0, _spawnasync().default)(editor.binary, getEditorArguments(editor, path, lineNumber));
            return true;
        } catch (error) {
            debug(`Failed to open ${fileReference} in editor (path: ${path}, binary: ${editor.binary}):`, error);
        }
    }
    _log.error('Could not open editor, you can set it by defining the $EDITOR environment variable with the binary of your editor. (e.g. "vscode" or "atom")');
    return false;
}
function getEditorArguments(editor, path, lineNumber) {
    if (!lineNumber) {
        return [
            path
        ];
    }
    switch(editor.id){
        case 'atom':
        case 'sublime':
            return [
                `${path}:${lineNumber}`
            ];
        case 'emacs':
        case 'emacsforosx':
        case 'nano':
        case 'neovim':
        case 'vim':
            return [
                `+${lineNumber}`,
                path
            ];
        case 'android-studio':
        case 'intellij':
        case 'textmate':
        case 'webstorm':
        case 'xcode':
            return [
                `--line=${lineNumber}`,
                path
            ];
        case 'vscode':
        case 'vscodium':
            return [
                '-g',
                `${path}:${lineNumber}`
            ];
        default:
            return [
                path
            ];
    }
}

//# sourceMappingURL=editor.js.map