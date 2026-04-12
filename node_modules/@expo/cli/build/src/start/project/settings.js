"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProjectSettings", {
    enumerable: true,
    get: function() {
        return ProjectSettings;
    }
});
const _dotExpo = require("./dotExpo");
const SETTINGS_FILE_NAME = 'settings.json';
const ProjectSettings = (0, _dotExpo.createTemporaryProjectFile)(SETTINGS_FILE_NAME, {
    urlRandomness: null
});

//# sourceMappingURL=settings.js.map