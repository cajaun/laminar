// See: https://github.com/facebook/metro/blob/v0.83.2/packages/metro/src/lib/isResolvedDependency.js

import type { Dependency, ResolvedDependency } from "../DeltaBundler/types";
// NOTE(@kitten): Flow to TS cannot convert type assertions
export declare function isResolvedDependency(dep: Dependency): dep is ResolvedDependency;
