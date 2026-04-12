"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolveOptionsAsync", {
    enumerable: true,
    get: function() {
        return resolveOptionsAsync;
    }
});
function _config() {
    const data = require("@expo/config");
    _config = function() {
        return data;
    };
    return data;
}
const _resolveDevice = require("./resolveDevice");
const _resolveGradlePropsAsync = require("./resolveGradlePropsAsync");
const _resolveLaunchProps = require("./resolveLaunchProps");
const _buildcacheproviders = require("../../utils/build-cache-providers");
const _resolveBundlerProps = require("../resolveBundlerProps");
async function resolveOptionsAsync(projectRoot, options) {
    var _projectConfig_exp, _projectConfig_exp_experiments;
    // Resolve the device before the gradle props because we need the device to be running to get the ABI.
    const device = await (0, _resolveDevice.resolveDeviceAsync)(options.device);
    const projectConfig = (0, _config().getConfig)(projectRoot);
    const buildCacheProvider = await (0, _buildcacheproviders.resolveBuildCacheProvider)(((_projectConfig_exp = projectConfig.exp) == null ? void 0 : _projectConfig_exp.buildCacheProvider) ?? ((_projectConfig_exp_experiments = projectConfig.exp.experiments) == null ? void 0 : _projectConfig_exp_experiments.buildCacheProvider), projectRoot);
    return {
        ...await (0, _resolveBundlerProps.resolveBundlerPropsAsync)(projectRoot, options),
        ...await (0, _resolveGradlePropsAsync.resolveGradlePropsAsync)(projectRoot, options, device.device),
        ...await (0, _resolveLaunchProps.resolveLaunchPropsAsync)(projectRoot, options),
        variant: options.variant ?? 'debug',
        // Resolve the device based on the provided device id or prompt
        // from a list of devices (connected or simulated) that are filtered by the scheme.
        device,
        buildCache: !!options.buildCache,
        install: !!options.install,
        buildCacheProvider
    };
}

//# sourceMappingURL=resolveOptions.js.map