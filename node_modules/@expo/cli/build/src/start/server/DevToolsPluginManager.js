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
    DevToolsPluginEndpoint: function() {
        return DevToolsPluginEndpoint;
    },
    default: function() {
        return DevToolsPluginManager;
    }
});
const debug = require('debug')('expo:start:server:devtools');
const DevToolsPluginEndpoint = '/_expo/plugins';
class DevToolsPluginManager {
    constructor(projectRoot){
        this.projectRoot = projectRoot;
        this.plugins = null;
    }
    async queryPluginsAsync() {
        if (this.plugins) {
            return this.plugins;
        }
        const plugins = (await this.queryAutolinkedPluginsAsync(this.projectRoot)).map((plugin)=>({
                ...plugin,
                webpageEndpoint: `${DevToolsPluginEndpoint}/${plugin.packageName}`
            }));
        this.plugins = plugins;
        return this.plugins;
    }
    async queryPluginWebpageRootAsync(pluginName) {
        const plugins = await this.queryPluginsAsync();
        const plugin = plugins.find((p)=>p.packageName === pluginName);
        return (plugin == null ? void 0 : plugin.webpageRoot) ?? null;
    }
    async queryAutolinkedPluginsAsync(projectRoot) {
        const autolinking = require('expo/internal/unstable-autolinking-exports');
        const linker = autolinking.makeCachedDependenciesLinker({
            projectRoot
        });
        const revisions = await autolinking.scanExpoModuleResolutionsForPlatform(linker, 'devtools');
        const { resolveModuleAsync } = autolinking.getLinkingImplementationForPlatform('devtools');
        const plugins = (await Promise.all(Object.values(revisions).map((revision)=>resolveModuleAsync(revision.name, revision)))).filter((maybePlugin)=>maybePlugin != null);
        debug('Found autolinked plugins', plugins);
        return plugins;
    }
}

//# sourceMappingURL=DevToolsPluginManager.js.map