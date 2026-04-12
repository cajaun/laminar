"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ESLintProjectPrerequisite", {
    enumerable: true,
    get: function() {
        return ESLintProjectPrerequisite;
    }
});
function _jsonfile() {
    const data = /*#__PURE__*/ _interop_require_default(require("@expo/json-file"));
    _jsonfile = function() {
        return data;
    };
    return data;
}
function _promises() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
    _promises = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _log = require("../log");
const _Prerequisite = require("../start/doctor/Prerequisite");
const _ensureDependenciesAsync = require("../start/doctor/dependencies/ensureDependenciesAsync");
const _findUp = require("../utils/findUp");
const _interactive = require("../utils/interactive");
const _prompts = require("../utils/prompts");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:lint');
class ESLintProjectPrerequisite extends _Prerequisite.ProjectPrerequisite {
    async assertImplementation() {
        const hasEslintConfig = await isEslintConfigured(this.projectRoot);
        const hasLegacyConfig = await isLegacyEslintConfigured(this.projectRoot);
        const hasLintScript = await lintScriptIsConfigured(this.projectRoot);
        if (hasLegacyConfig) {
            _log.Log.warn(`Using legacy ESLint config. Consider upgrading to flat config.`);
        }
        return (hasEslintConfig || hasLegacyConfig) && hasLintScript;
    }
    async bootstrapAsync() {
        debug('Setting up ESLint');
        const hasEslintConfig = await isEslintConfigured(this.projectRoot);
        if (!hasEslintConfig) {
            if (!(0, _interactive.isInteractive)()) {
                _log.Log.warn(`No ESLint config found. Configuring automatically.`);
            } else {
                const shouldSetupLint = await (0, _prompts.confirmAsync)({
                    message: 'No ESLint config found. Install and configure ESLint in this project?'
                });
                if (!shouldSetupLint) {
                    throw new _Prerequisite.PrerequisiteCommandError('ESLint is not configured for this project.');
                }
            }
            await this._ensureDependenciesInstalledAsync({
                skipPrompt: true,
                isProjectMutable: true
            });
            await _promises().default.writeFile(_path().default.join(this.projectRoot, 'eslint.config.js'), await _promises().default.readFile(require.resolve(`@expo/cli/static/template/eslint.config.js`), 'utf8'), 'utf8');
        }
        const hasLintScript = await lintScriptIsConfigured(this.projectRoot);
        if (!hasLintScript) {
            const scripts = _jsonfile().default.read(_path().default.join(this.projectRoot, 'package.json')).scripts;
            await _jsonfile().default.setAsync(_path().default.join(this.projectRoot, 'package.json'), 'scripts', typeof scripts === 'object' ? {
                ...scripts,
                lint: 'expo lint'
            } : {
                lint: 'expo lint'
            }, {
                json5: false
            });
        }
        _log.Log.log();
        _log.Log.log('ESLint has been configured 🎉');
        _log.Log.log();
        return true;
    }
    async _ensureDependenciesInstalledAsync({ skipPrompt, isProjectMutable }) {
        try {
            return await (0, _ensureDependenciesAsync.ensureDependenciesAsync)(this.projectRoot, {
                skipPrompt,
                isProjectMutable,
                installMessage: 'ESLint is required to lint your project.',
                warningMessage: 'ESLint not installed, unable to set up linting for your project.',
                requiredPackages: [
                    {
                        version: '^9.0.0',
                        pkg: 'eslint',
                        file: 'eslint/package.json',
                        dev: true
                    },
                    {
                        pkg: 'eslint-config-expo',
                        file: 'eslint-config-expo/package.json',
                        dev: true
                    }
                ]
            });
        } catch (error) {
            this.resetAssertion();
            throw error;
        }
    }
}
async function isLegacyEslintConfigured(projectRoot) {
    debug('Checking for legacy ESLint configuration', projectRoot);
    const packageFile = await _jsonfile().default.readAsync(_path().default.join(projectRoot, 'package.json'));
    if (typeof packageFile.eslintConfig === 'object' && Object.keys(packageFile.eslintConfig).length > 0) {
        debug('Found legacy ESLint config in package.json');
        return true;
    }
    const eslintConfigFiles = [
        '.eslintrc.js',
        '.eslintrc.cjs',
        '.eslintrc.yaml',
        '.eslintrc.yml',
        '.eslintrc.json'
    ];
    for (const configFile of eslintConfigFiles){
        const configPath = (0, _findUp.findFileInParents)(projectRoot, configFile);
        if (configPath) {
            debug('Found ESLint config file:', configPath);
            return true;
        }
    }
    return false;
}
/** Check for flat config. */ async function isEslintConfigured(projectRoot) {
    debug('Ensuring ESLint is configured in', projectRoot);
    const eslintConfigFiles = [
        'eslint.config.js',
        'eslint.config.mjs',
        'eslint.config.cjs'
    ];
    for (const configFile of eslintConfigFiles){
        const configPath = (0, _findUp.findFileInParents)(projectRoot, configFile);
        if (configPath) {
            debug('Found ESLint config file:', configPath);
            return true;
        }
    }
    return false;
}
async function lintScriptIsConfigured(projectRoot) {
    var _packageFile_scripts;
    const packageFile = await _jsonfile().default.readAsync(_path().default.join(projectRoot, 'package.json'));
    return typeof ((_packageFile_scripts = packageFile.scripts) == null ? void 0 : _packageFile_scripts.lint) === 'string';
}

//# sourceMappingURL=ESlintPrerequisite.js.map