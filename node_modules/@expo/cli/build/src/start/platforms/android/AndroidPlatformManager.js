"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AndroidPlatformManager", {
    enumerable: true,
    get: function() {
        return AndroidPlatformManager;
    }
});
const _AndroidAppIdResolver = require("./AndroidAppIdResolver");
const _AndroidDeviceManager = require("./AndroidDeviceManager");
const _adbReverse = require("./adbReverse");
const _errors = require("../../../utils/errors");
const _fn = require("../../../utils/fn");
const _link = require("../../../utils/link");
const _detectDevClient = require("../../detectDevClient");
const _PlatformManager = require("../PlatformManager");
const debug = require('debug')('expo:start:platforms:platformManager:android');
class AndroidPlatformManager extends _PlatformManager.PlatformManager {
    constructor(projectRoot, port, options){
        super(projectRoot, {
            platform: 'android',
            ...options,
            resolveDeviceAsync: _AndroidDeviceManager.AndroidDeviceManager.resolveAsync
        }), this.projectRoot = projectRoot, this.port = port;
        this.hasDevClientInstalled = (0, _fn.memoize)(_detectDevClient.hasDirectDevClientDependency.bind(this, projectRoot));
    }
    async openAsync(options, resolveSettings) {
        await (0, _adbReverse.startAdbReverseAsync)([
            this.port
        ]);
        if (options.runtime === 'custom') {
            // Store the resolved launch properties for future "openAsync" request.
            // This reuses the same launch properties when opening through the CLI interface (pressing `a`).
            if (options.props) {
                this.lastCustomRuntimeLaunchProps = options.props;
            } else if (!options.props && this.lastCustomRuntimeLaunchProps) {
                options.props = this.lastCustomRuntimeLaunchProps;
            }
            // Handle projects that need to launch with a custom app id and launch activity
            return this.openProjectInCustomRuntimeWithCustomAppIdAsync(options, resolveSettings);
        }
        return super.openAsync(options, resolveSettings);
    }
    /**
   * Launch the custom runtime project, using the provided custom app id and launch activity.
   * Instead of "open url", this will launch the activity directly.
   * If dev client is installed, it will also pass the dev client URL to the activity.
   */ async openProjectInCustomRuntimeWithCustomAppIdAsync(options, resolveSettings) {
        var _options_props, _options_props1;
        // Fall back to default dev client URL open behavior if no custom app id or launch activity is provided
        if (!((_options_props = options.props) == null ? void 0 : _options_props.customAppId) || !((_options_props1 = options.props) == null ? void 0 : _options_props1.launchActivity)) {
            return super.openProjectInCustomRuntimeAsync(resolveSettings, options.props);
        }
        const { customAppId, launchActivity } = options.props;
        const url = this.hasDevClientInstalled() ? this.props.getCustomRuntimeUrl({
            scheme: options.props.scheme
        }) ?? undefined : undefined;
        debug(`Opening custom runtime using launch activity: ${launchActivity} --`, options.props);
        const deviceManager = await this.props.resolveDeviceAsync(resolveSettings);
        if (!await deviceManager.isAppInstalledAndIfSoReturnContainerPathForIOSAsync(customAppId)) {
            throw new _errors.CommandError(`No development build (${customAppId}) for this project is installed. ` + `Install a development build on the target device and try again.\n${(0, _link.learnMore)('https://docs.expo.dev/development/build/')}`);
        }
        deviceManager.logOpeningUrl(url ?? launchActivity);
        await deviceManager.activateWindowAsync();
        await deviceManager.launchActivityAsync(launchActivity, url);
        return {
            url: url ?? launchActivity
        };
    }
    _getAppIdResolver() {
        return new _AndroidAppIdResolver.AndroidAppIdResolver(this.projectRoot);
    }
    _resolveAlternativeLaunchUrl(applicationId, props) {
        return (props == null ? void 0 : props.launchActivity) ?? `${applicationId}/.MainActivity`;
    }
}

//# sourceMappingURL=AndroidPlatformManager.js.map