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
    Prerequisite: function() {
        return Prerequisite;
    },
    PrerequisiteCommandError: function() {
        return PrerequisiteCommandError;
    },
    ProjectPrerequisite: function() {
        return ProjectPrerequisite;
    }
});
const _errors = require("../../utils/errors");
const _fn = require("../../utils/fn");
class PrerequisiteCommandError extends _errors.CommandError {
    constructor(code, message = ''){
        super(message ? 'VALIDATE_' + code : code, message);
    }
}
class Prerequisite {
    constructor(){
        this._assertAsync = (0, _fn.memoize)(this.assertImplementation.bind(this));
    }
    /** Reset the assertion memo and warning message. */ resetAssertion(props) {
        this.cachedError = undefined;
        this._assertAsync = (0, _fn.memoize)(this.assertImplementation.bind(this));
    }
    async assertAsync(props) {
        if (this.cachedError) {
            throw this.cachedError;
        }
        try {
            return await this._assertAsync(props);
        } catch (error) {
            if (error instanceof PrerequisiteCommandError) {
                this.cachedError = error;
            }
            throw error;
        }
    }
    /** Exposed for testing. */ async assertImplementation(props) {
        throw new _errors.UnimplementedError();
    }
}
class ProjectPrerequisite extends Prerequisite {
    constructor(projectRoot){
        super(), this.projectRoot = projectRoot;
    }
}

//# sourceMappingURL=Prerequisite.js.map