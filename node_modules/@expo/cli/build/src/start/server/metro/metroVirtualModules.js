/**
 * Copyright © 2024 650 Industries.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getMetroBundlerWithVirtualModules", {
    enumerable: true,
    get: function() {
        return getMetroBundlerWithVirtualModules;
    }
});
function assertBundlerHasPrivateMembers(bundler) {
    if (!('_depGraph' in bundler)) {
        throw new Error('Expected bundler to have member: _depGraph. Upstream metro may have removed this property.');
    }
    assertDepGraphHasPrivateMembers(bundler._depGraph);
}
function assertDepGraphHasPrivateMembers(depGraph) {
    if (!depGraph || typeof depGraph !== 'object' || !('_fileSystem' in depGraph)) {
        throw new Error('Expected bundler._depGraph to have member: _fileSystem. Upstream metro may have removed this property.');
    }
}
function ensureMetroBundlerPatchedWithSetVirtualModule(bundler) {
    if (!bundler.setVirtualModule) {
        bundler.setVirtualModule = function(id, contents) {
            assertBundlerHasPrivateMembers(this);
            const fs = ensureFileSystemPatched(this._depGraph._fileSystem);
            fs.expoVirtualModules.set(ensureStartsWithNullByte(id), Buffer.from(contents));
        };
        bundler.hasVirtualModule = function(id) {
            assertBundlerHasPrivateMembers(this);
            const fs = ensureFileSystemPatched(this._depGraph._fileSystem);
            return fs.expoVirtualModules.has(ensureStartsWithNullByte(id));
        };
    }
    return bundler;
}
function ensureStartsWithNullByte(id) {
    // Because you'll likely need to return the path somewhere, we should just assert with a useful error message instead of
    // attempting to mutate the value behind the scenes. This ensures correctness in the resolution.
    if (!id.startsWith('\0')) {
        throw new Error(`Virtual modules in Expo CLI must start with with null byte (\\0), got: ${id}`);
    }
    return id;
}
function getMetroBundlerWithVirtualModules(bundler) {
    if (!bundler.transformFile.__patched) {
        const originalTransformFile = bundler.transformFile.bind(bundler);
        bundler.transformFile = async function(filePath, transformOptions, /** Optionally provide the file contents, this can be used to provide virtual contents for a file. */ fileBuffer) {
            // file buffer will be defined for virtual modules in Metro, e.g. context modules.
            if (!fileBuffer) {
                if (filePath.startsWith('\0')) {
                    const graph = await this.getDependencyGraph();
                    assertDepGraphHasPrivateMembers(graph);
                    if (graph._fileSystem.expoVirtualModules) {
                        fileBuffer = graph._fileSystem.expoVirtualModules.get(filePath);
                    }
                    if (!fileBuffer) {
                        throw new Error(`Virtual module "${filePath}" not found.`);
                    }
                }
            }
            return originalTransformFile(filePath, transformOptions, fileBuffer);
        };
        bundler.transformFile.__patched = true;
    }
    return ensureMetroBundlerPatchedWithSetVirtualModule(bundler);
}
function ensureFileSystemPatched(fs) {
    if (!fs.getSha1.__patched) {
        const original_getSha1 = fs.getSha1.bind(fs);
        fs.getSha1 = (filename)=>{
            // Rollup virtual module format.
            if (filename.startsWith('\0')) {
                return filename;
            }
            return original_getSha1(filename);
        };
        fs.getSha1.__patched = true;
    }
    // TODO: Connect virtual modules to a specific context so they don't cross-bundles.
    if (!fs.expoVirtualModules) {
        fs.expoVirtualModules = new Map();
    }
    return fs;
}

//# sourceMappingURL=metroVirtualModules.js.map