"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePodDependency = void 0;
exports.loadPodfileLock = loadPodfileLock;
exports.parsePodfileLock = parsePodfileLock;
exports.getFilePathForExternalSource = getFilePathForExternalSource;
const js_yaml_1 = require("js-yaml");
const EXTERNAL_SOURCES_KEY = 'EXTERNAL SOURCES';
/**
 * Parses a podfile.lock file from from YAML into a JSON object.
 *
 * @param str Podfile.lock file contents in YAML format.
 * @returns
 */
function loadPodfileLock(str) {
    const contents = (0, js_yaml_1.load)(str);
    if (!contents || typeof contents !== 'object') {
        return null;
    }
    return contents;
}
const parsePodDependency = (pod) => {
    if (typeof pod === 'string') {
        // js-yaml fails to parse an array with a single item and instead formats it as a string divided by a `-` (hyphen).
        // Here we match if a hyphen comes after a space. We use fake-nested-Podfile to test this hack.
        const singleItemArrayBug = pod.match(/(.*)\s-\s(.*)/);
        if (singleItemArrayBug === null || singleItemArrayBug === void 0 ? void 0 : singleItemArrayBug[2]) {
            return (0, exports.parsePodDependency)({ [singleItemArrayBug[1]]: singleItemArrayBug[2] });
        }
        return [splitPodNameVersion(pod)];
    }
    return Object.entries(pod).map(([k, v]) => {
        const results = splitPodNameVersion(k);
        if (Array.isArray(v)) {
            return {
                ...results,
                dependencies: v.map(x => (0, exports.parsePodDependency)(x)).flat(),
            };
        }
        else if (typeof v === 'string') {
            return {
                ...results,
                dependencies: (0, exports.parsePodDependency)(v),
            };
        }
        return results;
    });
};
exports.parsePodDependency = parsePodDependency;
function parsePodfileLock(fileContent) {
    var _a;
    const contents = (_a = loadPodfileLock(fileContent)) !== null && _a !== void 0 ? _a : loadPodfileLock(EXTERNAL_SOURCES_KEY + fileContent.split(EXTERNAL_SOURCES_KEY).slice(1));
    if (!contents) {
        return null;
    }
    const parsed = Object.entries(contents).reduce((acc, [key, value]) => {
        return {
            ...acc,
            [kebabCaseToCamelCase(rubyCaseToKebab(key))]: value,
        };
    }, {});
    if (Array.isArray(parsed.pods)) {
        const parsedPods = parsed.pods.map(exports.parsePodDependency);
        parsed.pods = parsedPods.flat();
    }
    return parsed;
}
function splitPodNameVersion(pod) {
    var _a;
    const [name] = pod.split(' ');
    return { name, version: (_a = pod.match(/\((.*)\)/)) === null || _a === void 0 ? void 0 : _a[1] };
}
function rubyCaseToKebab(str) {
    return str.toLowerCase().split(' ').join('-');
}
function kebabCaseToCamelCase(str) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}
function getFilePathForExternalSource(podLock, pod) {
    var _a, _b, _c;
    const source = (_a = podLock.externalSources) === null || _a === void 0 ? void 0 : _a[pod];
    return (_c = (_b = source === null || source === void 0 ? void 0 : source[':podspec']) !== null && _b !== void 0 ? _b : source === null || source === void 0 ? void 0 : source[':path']) !== null && _c !== void 0 ? _c : null;
}
//# sourceMappingURL=parsePodfileLock.js.map