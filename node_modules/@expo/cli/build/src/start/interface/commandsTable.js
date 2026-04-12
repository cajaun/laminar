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
    BLT: function() {
        return BLT;
    },
    getTerminalColumns: function() {
        return getTerminalColumns;
    },
    printHelp: function() {
        return printHelp;
    },
    printItem: function() {
        return printItem;
    },
    printQRCode: function() {
        return printQRCode;
    },
    printUsage: function() {
        return printUsage;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _qrcodeterminal() {
    const data = /*#__PURE__*/ _interop_require_default(require("qrcode-terminal"));
    _qrcodeterminal = function() {
        return data;
    };
    return data;
}
function _wrapansi() {
    const data = /*#__PURE__*/ _interop_require_default(require("wrap-ansi"));
    _wrapansi = function() {
        return data;
    };
    return data;
}
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../log"));
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
const BLT = '\u203A';
const printHelp = ()=>{
    logCommandsTable([
        {
            key: '?',
            msg: 'show all commands'
        }
    ]);
};
function printQRCode(url) {
    _qrcodeterminal().default.generate(url, {
        small: true
    }, (code)=>_log.log(code));
}
const getTerminalColumns = ()=>process.stdout.columns || 80;
const printItem = (text)=>`${BLT} ` + (0, _wrapansi().default)(text, getTerminalColumns()).trimStart();
function printUsage(options, { verbose }) {
    const isMac = process.platform === 'darwin';
    const { platforms = [
        'ios',
        'android',
        'web'
    ] } = options;
    const isAndroidDisabled = !platforms.includes('android');
    const isIosDisabled = !platforms.includes('ios');
    const isWebDisable = !platforms.includes('web');
    const switchMsg = `switch to ${options.devClient === false ? 'development build' : 'Expo Go'}`;
    const target = options.devClient === false ? `Expo Go` : 'development build';
    _log.log();
    _log.log(printItem((0, _chalk().default)`Using {cyan ${target}}`));
    if (verbose) {
        logCommandsTable([
            {
                key: 's',
                msg: switchMsg
            },
            {},
            {
                key: 'a',
                msg: 'open Android',
                disabled: isAndroidDisabled
            },
            {
                key: 'shift+a',
                msg: 'select an Android device or emulator',
                disabled: isAndroidDisabled
            },
            isMac && {
                key: 'i',
                msg: 'open iOS simulator',
                disabled: isIosDisabled
            },
            isMac && {
                key: 'shift+i',
                msg: 'select an iOS simulator',
                disabled: isIosDisabled
            },
            {
                key: 'w',
                msg: 'open web',
                disabled: isWebDisable
            },
            {},
            {
                key: 'r',
                msg: 'reload app'
            },
            !!options.isWebSocketsEnabled && {
                key: 'j',
                msg: 'open debugger'
            },
            !!options.isWebSocketsEnabled && {
                key: 'm',
                msg: 'toggle menu'
            },
            !!options.isWebSocketsEnabled && {
                key: 'shift+m',
                msg: 'more tools'
            },
            {
                key: 'o',
                msg: 'open project code in your editor'
            },
            {
                key: 'c',
                msg: 'show project QR'
            },
            {}
        ]);
    } else {
        logCommandsTable([
            {
                key: 's',
                msg: switchMsg
            },
            {},
            {
                key: 'a',
                msg: 'open Android',
                disabled: isAndroidDisabled
            },
            isMac && {
                key: 'i',
                msg: 'open iOS simulator',
                disabled: isIosDisabled
            },
            {
                key: 'w',
                msg: 'open web',
                disabled: isWebDisable
            },
            {},
            {
                key: 'j',
                msg: 'open debugger'
            },
            {
                key: 'r',
                msg: 'reload app'
            },
            !!options.isWebSocketsEnabled && {
                key: 'm',
                msg: 'toggle menu'
            },
            !!options.isWebSocketsEnabled && {
                key: 'shift+m',
                msg: 'more tools'
            },
            {
                key: 'o',
                msg: 'open project code in your editor'
            },
            {}
        ]);
    }
}
function logCommandsTable(ui) {
    _log.log(ui.filter(Boolean)// @ts-ignore: filter doesn't work
    .map(({ key, msg, status, disabled })=>{
        if (!key) return '';
        let view = `${BLT} `;
        if (key.length === 1) view += 'Press ';
        view += (0, _chalk().default)`{bold ${key}} {dim │} `;
        view += msg;
        if (status) {
            view += ` ${_chalk().default.dim(`(${_chalk().default.italic(status)})`)}`;
        }
        if (disabled) {
            view = _chalk().default.dim(view);
        }
        return view;
    }).join('\n'));
}

//# sourceMappingURL=commandsTable.js.map