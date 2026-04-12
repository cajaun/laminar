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
    addInteractionListener: function() {
        return addInteractionListener;
    },
    confirmAsync: function() {
        return confirmAsync;
    },
    createSelectionFilter: function() {
        return createSelectionFilter;
    },
    default: function() {
        return prompt;
    },
    pauseInteractions: function() {
        return pauseInteractions;
    },
    promptAsync: function() {
        return promptAsync;
    },
    removeInteractionListener: function() {
        return removeInteractionListener;
    },
    resumeInteractions: function() {
        return resumeInteractions;
    },
    selectAsync: function() {
        return selectAsync;
    }
});
function _assert() {
    const data = /*#__PURE__*/ _interop_require_default(require("assert"));
    _assert = function() {
        return data;
    };
    return data;
}
function _prompts() {
    const data = /*#__PURE__*/ _interop_require_default(require("prompts"));
    _prompts = function() {
        return data;
    };
    return data;
}
const _errors = require("./errors");
const _interactive = require("./interactive");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const debug = require('debug')('expo:utils:prompts');
/** Interaction observers for detecting when keystroke tracking should pause/resume. */ const listeners = [];
async function prompt(questions, { nonInteractiveHelp, ...options } = {}) {
    questions = Array.isArray(questions) ? questions : [
        questions
    ];
    if (!(0, _interactive.isInteractive)() && questions.length !== 0) {
        let message = `Input is required, but 'npx expo' is in non-interactive mode.\n`;
        if (nonInteractiveHelp) {
            message += nonInteractiveHelp;
        } else {
            const question = questions[0];
            const questionMessage = typeof question.message === 'function' ? question.message(undefined, {}, question) : question.message;
            message += `Required input:\n${(questionMessage || '').trim().replace(/^/gm, '> ')}`;
        }
        throw new _errors.CommandError('NON_INTERACTIVE', message);
    }
    pauseInteractions();
    try {
        const results = await (0, _prompts().default)(questions, {
            onCancel () {
                throw new _errors.AbortCommandError();
            },
            ...options
        });
        return results;
    } finally{
        resumeInteractions();
    }
}
async function confirmAsync(questions, options) {
    const { value } = await prompt({
        initial: true,
        ...questions,
        name: 'value',
        type: 'confirm'
    }, options);
    return value ?? null;
}
async function selectAsync(message, choices, options) {
    const { value } = await prompt({
        message,
        choices,
        name: 'value',
        type: 'select'
    }, options);
    return value ?? null;
}
const promptAsync = prompt;
function addInteractionListener(callback) {
    listeners.push(callback);
}
function removeInteractionListener(callback) {
    const listenerIndex = listeners.findIndex((_callback)=>_callback === callback);
    (0, _assert().default)(listenerIndex >= 0, 'removeInteractionListener(): cannot remove an unregistered event listener.');
    listeners.splice(listenerIndex, 1);
}
function pauseInteractions(options = {}) {
    debug('Interaction observers paused');
    for (const listener of listeners){
        listener({
            pause: true,
            ...options
        });
    }
}
function resumeInteractions(options = {}) {
    debug('Interaction observers resumed');
    for (const listener of listeners){
        listener({
            pause: false,
            ...options
        });
    }
}
function createSelectionFilter() {
    function escapeRegex(string) {
        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    return async (input, choices)=>{
        try {
            const regex = new RegExp(escapeRegex(input), 'i');
            return choices.filter((choice)=>regex.test(choice.title));
        } catch (error) {
            debug('Error filtering choices', error);
            return [];
        }
    };
}

//# sourceMappingURL=prompts.js.map