"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "assertSystemRequirementsAsync", {
    enumerable: true,
    get: function() {
        return assertSystemRequirementsAsync;
    }
});
const _profile = require("../../../utils/profile");
const _SimulatorAppPrerequisite = require("../../doctor/apple/SimulatorAppPrerequisite");
const _XcodePrerequisite = require("../../doctor/apple/XcodePrerequisite");
const _XcrunPrerequisite = require("../../doctor/apple/XcrunPrerequisite");
async function assertSystemRequirementsAsync() {
    // Order is important
    await (0, _profile.profile)(_XcodePrerequisite.XcodePrerequisite.instance.assertAsync.bind(_XcodePrerequisite.XcodePrerequisite.instance), 'XcodePrerequisite')();
    await (0, _profile.profile)(_XcrunPrerequisite.XcrunPrerequisite.instance.assertAsync.bind(_XcrunPrerequisite.XcrunPrerequisite.instance), 'XcrunPrerequisite')();
    await (0, _profile.profile)(_SimulatorAppPrerequisite.SimulatorAppPrerequisite.instance.assertAsync.bind(_SimulatorAppPrerequisite.SimulatorAppPrerequisite.instance), 'SimulatorAppPrerequisite')();
}

//# sourceMappingURL=assertSystemRequirements.js.map