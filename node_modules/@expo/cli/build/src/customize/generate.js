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
    queryAndGenerateAsync: function() {
        return queryAndGenerateAsync;
    },
    selectAndGenerateAsync: function() {
        return selectAndGenerateAsync;
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
const _templates = require("./templates");
const _installAsync = require("../install/installAsync");
const _log = require("../log");
const _dir = require("../utils/dir");
const _errors = require("../utils/errors");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function queryAndGenerateAsync(projectRoot, { files, props, extras }) {
    const valid = files.filter((file)=>!!_templates.TEMPLATES.find((template)=>template.destination(props) === file));
    if (valid.length !== files.length) {
        const diff = files.filter((file)=>!_templates.TEMPLATES.find((template)=>template.destination(props) === file));
        throw new _errors.CommandError(`Invalid files: ${diff.join(', ')}. Allowed: ${_templates.TEMPLATES.map((template)=>template.destination(props)).join(', ')}`);
    }
    if (!valid.length) {
        return;
    }
    _log.Log.log(`Generating: ${valid.join(', ')}`);
    return generateAsync(projectRoot, {
        answer: files.map((file)=>_templates.TEMPLATES.findIndex((template)=>template.destination(props) === file)),
        props,
        extras
    });
}
async function selectAndGenerateAsync(projectRoot, { props, extras }) {
    const answer = await (0, _templates.selectTemplatesAsync)(projectRoot, props);
    if (!(answer == null ? void 0 : answer.length)) {
        _log.Log.exit('\n\u203A Exiting with no change...', 0);
    }
    await generateAsync(projectRoot, {
        answer,
        props,
        extras
    });
}
async function generateAsync(projectRoot, { answer, props, extras }) {
    // Copy files
    await Promise.all(answer.map(async (file)=>{
        const template = _templates.TEMPLATES[file];
        if (template.configureAsync) {
            if (await template.configureAsync(projectRoot)) {
                return;
            }
        }
        const projectFilePath = _path().default.resolve(projectRoot, template.destination(props));
        // copy the file from template
        return (0, _dir.copyAsync)(template.file(projectRoot), projectFilePath);
    }));
    // Install dependencies
    const packages = answer.map((file)=>_templates.TEMPLATES[file].dependencies).flat().filter((pkg)=>!_resolvefrom().default.silent(projectRoot, pkg));
    if (packages.length) {
        _log.Log.debug('Installing ' + packages.join(', '));
        await (0, _installAsync.installAsync)(packages, {}, [
            '--dev',
            ...extras
        ]);
    }
}

//# sourceMappingURL=generate.js.map