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
    TEMPLATES: function() {
        return TEMPLATES;
    },
    selectTemplatesAsync: function() {
        return selectTemplatesAsync;
    }
});
function _chalk() {
    const data = /*#__PURE__*/ _interop_require_default(require("chalk"));
    _chalk = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
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
function _resolvefrom() {
    const data = /*#__PURE__*/ _interop_require_default(require("resolve-from"));
    _resolvefrom = function() {
        return data;
    };
    return data;
}
const _prompts = /*#__PURE__*/ _interop_require_default(require("../utils/prompts"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:customize:templates');
function importFromExpoWebpackConfig(projectRoot, folder, moduleId) {
    try {
        const filePath = (0, _resolvefrom().default)(projectRoot, `@expo/webpack-config/${folder}/${moduleId}`);
        debug(`Using @expo/webpack-config template for "${moduleId}": ${filePath}`);
        return filePath;
    } catch  {
        debug(`@expo/webpack-config template for "${moduleId}" not found, falling back on @expo/cli`);
    }
    return importFromVendor(projectRoot, moduleId);
}
function importFromVendor(projectRoot, moduleId) {
    try {
        const filePath = (0, _resolvefrom().default)(projectRoot, '@expo/cli/static/template/' + moduleId);
        debug(`Using @expo/cli template for "${moduleId}": ${filePath}`);
        return filePath;
    } catch  {
        // For dev mode, testing and other cases where @expo/cli is not installed
        const filePath = require.resolve(`@expo/cli/static/template/${moduleId}`);
        debug(`Local @expo/cli template for "${moduleId}" not found, falling back on template relative to @expo/cli: ${filePath}`);
        return filePath;
    }
}
const TEMPLATES = [
    {
        id: 'babel.config.js',
        file: (projectRoot)=>importFromVendor(projectRoot, 'babel.config.js'),
        destination: ()=>'babel.config.js',
        dependencies: [
            // Even though this is installed in `expo`, we should add it for now.
            'babel-preset-expo'
        ]
    },
    {
        id: 'metro.config.js',
        dependencies: [
            '@expo/metro-config'
        ],
        destination: ()=>'metro.config.js',
        file: (projectRoot)=>importFromVendor(projectRoot, 'metro.config.js')
    },
    {
        // `tsconfig.json` is special-cased and doesn't follow the template.
        id: 'tsconfig.json',
        dependencies: [],
        destination: ()=>'tsconfig.json',
        file: ()=>'',
        configureAsync: async (projectRoot)=>{
            const { typescript } = require('./typescript');
            await typescript(projectRoot);
            return true;
        }
    },
    {
        id: '.eslintrc.js',
        dependencies: [],
        destination: ()=>'.eslintrc.js (deprecated)',
        file: (projectRoot)=>importFromVendor(projectRoot, '.eslintrc.js'),
        configureAsync: async (projectRoot)=>{
            const { ESLintProjectPrerequisite } = require('../lint/ESlintPrerequisite');
            const prerequisite = new ESLintProjectPrerequisite(projectRoot);
            if (!await prerequisite.assertAsync()) {
                await prerequisite.bootstrapAsync();
            }
            return false;
        }
    },
    {
        id: 'eslint.config.js',
        dependencies: [],
        destination: ()=>'eslint.config.js',
        file: (projectRoot)=>importFromVendor(projectRoot, 'eslint.config.js'),
        configureAsync: async (projectRoot)=>{
            const { ESLintProjectPrerequisite } = require('../lint/ESlintPrerequisite');
            const prerequisite = new ESLintProjectPrerequisite(projectRoot);
            if (!await prerequisite.assertAsync()) {
                await prerequisite.bootstrapAsync();
            }
            return false;
        }
    },
    {
        id: 'index.html',
        file: (projectRoot)=>importFromExpoWebpackConfig(projectRoot, 'web-default', 'index.html'),
        // web/index.html
        destination: ({ webStaticPath })=>webStaticPath + '/index.html',
        dependencies: []
    },
    {
        id: 'webpack.config.js',
        file: (projectRoot)=>importFromExpoWebpackConfig(projectRoot, 'template', 'webpack.config.js'),
        destination: ()=>'webpack.config.js',
        dependencies: [
            '@expo/webpack-config'
        ]
    },
    {
        id: '+html.tsx',
        file: (projectRoot)=>importFromVendor(projectRoot, '+html.tsx'),
        destination: ({ appDirPath })=>_path().default.join(appDirPath, '+html.tsx'),
        dependencies: []
    },
    {
        id: '+native-intent.ts',
        file: (projectRoot)=>importFromVendor(projectRoot, '+native-intent.ts'),
        destination: ({ appDirPath })=>_path().default.join(appDirPath, '+native-intent.ts'),
        dependencies: []
    }
];
/** Generate the prompt choices. */ function createChoices(projectRoot, props) {
    return TEMPLATES.map((template, index)=>{
        const destination = template.destination(props);
        const localProjectFile = _path().default.resolve(projectRoot, destination);
        const exists = _fs().default.existsSync(localProjectFile);
        return {
            title: destination,
            value: index,
            description: exists ? _chalk().default.red('This will overwrite the existing file') : undefined
        };
    });
}
async function selectTemplatesAsync(projectRoot, props) {
    const options = createChoices(projectRoot, props);
    const { answer } = await (0, _prompts.default)({
        type: 'multiselect',
        name: 'answer',
        message: 'Which files would you like to generate?',
        hint: '- Space to select. Return to submit',
        warn: 'File already exists.',
        limit: options.length,
        instructions: '',
        choices: options
    });
    return answer;
}

//# sourceMappingURL=templates.js.map