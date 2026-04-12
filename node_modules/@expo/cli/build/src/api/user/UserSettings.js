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
    getAccessToken: function() {
        return getAccessToken;
    },
    getAnonymousId: function() {
        return getAnonymousId;
    },
    getAnonymousIdAsync: function() {
        return getAnonymousIdAsync;
    },
    getExpoHomeDirectory: function() {
        return getExpoHomeDirectory;
    },
    getSession: function() {
        return getSession;
    },
    getSettings: function() {
        return getSettings;
    },
    getSettingsDirectory: function() {
        return getSettingsDirectory;
    },
    getSettingsFilePath: function() {
        return getSettingsFilePath;
    },
    hasCredentials: function() {
        return hasCredentials;
    },
    setSessionAsync: function() {
        return setSessionAsync;
    }
});
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
        return data;
    };
    return data;
}
function _crypto() {
    const data = /*#__PURE__*/ _interop_require_default(require("crypto"));
    _crypto = function() {
        return data;
    };
    return data;
}
function _getenv() {
    const data = require("getenv");
    _getenv = function() {
        return data;
    };
    return data;
}
function _os() {
    const data = require("os");
    _os = function() {
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
function getExpoHomeDirectory() {
    const home = (0, _os().homedir)();
    if (process.env.__UNSAFE_EXPO_HOME_DIRECTORY) {
        return process.env.__UNSAFE_EXPO_HOME_DIRECTORY;
    } else if ((0, _getenv().boolish)('EXPO_STAGING', false)) {
        return _path().join(home, '.expo-staging');
    } else if ((0, _getenv().boolish)('EXPO_LOCAL', false)) {
        return _path().join(home, '.expo-local');
    }
    return _path().join(home, '.expo');
}
function getSettingsDirectory() {
    return getExpoHomeDirectory();
}
function getSettingsFilePath() {
    return _path().join(getExpoHomeDirectory(), 'state.json');
}
function getSettings() {
    return new (_jsonfile()).default(getSettingsFilePath(), {
        ensureDir: true,
        jsonParseErrorDefault: {},
        // This will ensure that an error isn't thrown if the file doesn't exist.
        cantReadFileDefault: {}
    });
}
function getAccessToken() {
    return process.env.EXPO_TOKEN ?? null;
}
function getSession() {
    return getSettings().get('auth', null);
}
async function setSessionAsync(sessionData) {
    await getSettings().setAsync('auth', sessionData, {
        default: {},
        ensureDir: true
    });
}
function hasCredentials() {
    return !!getAccessToken() || !!getSession();
}
async function getAnonymousIdAsync() {
    const settings = getSettings();
    let id = await settings.getAsync('uuid', null);
    if (!id) {
        id = _crypto().default.randomUUID();
        await settings.setAsync('uuid', id);
    }
    return id;
}
function getAnonymousId() {
    const settings = getSettings();
    let id = settings.get('uuid', null);
    if (!id) {
        id = _crypto().default.randomUUID();
        settings.set('uuid', id);
    }
    return id;
}

//# sourceMappingURL=UserSettings.js.map