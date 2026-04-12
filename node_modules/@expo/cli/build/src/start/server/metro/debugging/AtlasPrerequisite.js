"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AtlasPrerequisite", {
    enumerable: true,
    get: function() {
        return AtlasPrerequisite;
    }
});
const _Prerequisite = require("../../../doctor/Prerequisite");
const _ensureDependenciesAsync = require("../../../doctor/dependencies/ensureDependenciesAsync");
class AtlasPrerequisite extends _Prerequisite.ProjectPrerequisite {
    async assertImplementation({ exp } = {}) {
        await this.ensureAtlasInstalled({
            exp
        });
        return true;
    }
    async bootstrapAsync({ exp } = {}) {
        await this.ensureAtlasInstalled({
            exp,
            skipPrompt: true,
            isProjectMutable: true
        });
    }
    async ensureAtlasInstalled(options = {}) {
        try {
            return await (0, _ensureDependenciesAsync.ensureDependenciesAsync)(this.projectRoot, {
                ...options,
                installMessage: 'Expo Atlas is required to gather bundle information, but it is not installed in this project.',
                warningMessage: 'Expo Atlas is not installed in this project, unable to gather bundle information.',
                requiredPackages: [
                    {
                        version: '^0.4.0',
                        pkg: 'expo-atlas',
                        file: 'expo-atlas/package.json',
                        dev: true
                    }
                ]
            });
        } catch (error) {
            this.resetAssertion({});
            throw error;
        }
    }
}

//# sourceMappingURL=AtlasPrerequisite.js.map