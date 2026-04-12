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
    evaluateTsConfig: function() {
        return evaluateTsConfig;
    },
    importTypeScriptFromProjectOptionally: function() {
        return importTypeScriptFromProjectOptionally;
    }
});
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function evaluateTsConfig(ts, tsConfigPath) {
    const formatDiagnosticsHost = {
        getNewLine: ()=>require('os').EOL,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getCanonicalFileName: (fileName)=>fileName
    };
    try {
        var _jsonFileContents_errors;
        const { config, error } = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
        if (error) {
            throw new Error(ts.formatDiagnostic(error, formatDiagnosticsHost));
        }
        const jsonFileContents = ts.parseJsonConfigFileContent(config, {
            ...ts.sys,
            readDirectory: (_, ext)=>[
                    ext ? `file${ext[0]}` : `file.ts`
                ]
        }, _path().default.dirname(tsConfigPath));
        if (jsonFileContents.errors) {
            jsonFileContents.errors = jsonFileContents.errors.filter(({ code })=>{
                // TS18003: filter out "no inputs were found in config file" error */
                // TS6046: filter out "Argument for '--module' option must be" error
                //         this error can be ignored since we're only typically interested in `paths` and `baseUrl`
                return code !== 18003 && code !== 6046;
            })// filter out non-error diagnostics
            .filter(({ category })=>category !== 1 /*DiagnosticCategory.Error = 1*/ );
        }
        if ((_jsonFileContents_errors = jsonFileContents.errors) == null ? void 0 : _jsonFileContents_errors.length) {
            throw new Error(ts.formatDiagnostic(jsonFileContents.errors[0], formatDiagnosticsHost));
        }
        return {
            compilerOptions: jsonFileContents.options,
            raw: config.raw
        };
    } catch (error) {
        if ((error == null ? void 0 : error.name) === 'SyntaxError') {
            throw new Error('tsconfig.json is invalid:\n' + (error.message ?? ''));
        }
        throw error;
    }
}
function importTypeScriptFromProjectOptionally(projectRoot) {
    const resolvedPath = _resolvefrom().default.silent(projectRoot, 'typescript');
    if (!resolvedPath) {
        return null;
    }
    return require(resolvedPath);
}

//# sourceMappingURL=evaluateTsConfig.js.map