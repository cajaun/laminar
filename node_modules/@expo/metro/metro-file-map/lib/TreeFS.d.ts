import type { FileData, FileMetadata, FileStats, LookupResult, MutableFileSystem, Path, ProcessFileFunction } from "../flow-types";
type DirectoryNode = Map<string, MixedNode>;
type FileNode = FileMetadata;
type MixedNode = FileNode | DirectoryNode;
export interface NormalizedSymlinkTarget {
  ancestorOfRootIdx?: null | number;
  normalPath: string;
  startOfBasenameIdx: number;
}
declare class TreeFS implements MutableFileSystem {
  constructor($$PARAM_0$$: {
    rootDir: Path;
    files?: FileData;
    processFile: ProcessFileFunction;
  });
  getSerializableSnapshot(): any;
  static fromDeserializedSnapshot($$PARAM_0$$: {
    rootDir: string;
    fileSystemData: DirectoryNode;
    processFile: ProcessFileFunction;
  }): TreeFS;
  getModuleName(mixedPath: Path): null | undefined | string;
  getSize(mixedPath: Path): null | undefined | number;
  getDependencies(mixedPath: Path): null | undefined | Array<string>;
  getDifference(files: FileData): {
    changedFiles: FileData;
    removedFiles: Set<string>;
  };
  getSha1(mixedPath: Path): null | undefined | string;
  getOrComputeSha1(mixedPath: Path): Promise<null | undefined | {
    sha1: string;
    content?: Buffer;
  }>;
  exists(mixedPath: Path): boolean;
  lookup(mixedPath: Path): LookupResult;
  getAllFiles(): Array<Path>;
  linkStats(mixedPath: Path): null | undefined | FileStats;
  matchFiles($$PARAM_0$$: {
    readonly filter?: null | undefined | RegExp;
    readonly filterCompareAbsolute?: boolean;
    readonly filterComparePosix?: boolean;
    readonly follow?: boolean;
    readonly recursive?: boolean;
    readonly rootDir?: null | undefined | Path;
  }): Iterable<Path>;
  addOrModify(mixedPath: Path, metadata: FileMetadata): void;
  bulkAddOrModify(addedOrModifiedFiles: FileData): void;
  remove(mixedPath: Path): null | undefined | FileMetadata;
  _lookupByNormalPath(requestedNormalPath: string, opts: {
    collectAncestors?: Array<{
      ancestorOfRootIdx?: null | number;
      node: DirectoryNode;
      normalPath: string;
      segmentName: string;
    }>;
    collectLinkPaths?: null | undefined | Set<string>;
    followLeaf?: boolean;
    makeDirectories?: boolean;
    startPathIdx?: number;
    startNode?: DirectoryNode;
    start?: {
      ancestorOfRootIdx?: null | number;
      node: DirectoryNode;
      pathIdx: number;
    };
  }): {
    ancestorOfRootIdx?: null | number;
    canonicalPath: string;
    exists: true;
    node: MixedNode;
    parentNode: DirectoryNode;
  } | {
    ancestorOfRootIdx?: null | number;
    canonicalPath: string;
    exists: true;
    node: DirectoryNode;
    parentNode: null;
  } | {
    canonicalMissingPath: string;
    missingSegmentName: string;
    exists: false;
  };
  hierarchicalLookup(mixedStartPath: string, subpath: string, opts: {
    breakOnSegment?: null | string;
    invalidatedBy?: null | Set<string>;
    subpathType?: "f" | "d";
  }): null | undefined | {
    absolutePath: string;
    containerRelativePath: string;
  };
  metadataIterator(opts: {
    readonly includeSymlinks: boolean;
    readonly includeNodeModules: boolean;
  }): Iterable<{
    baseName: string;
    canonicalPath: string;
    metadata: FileMetadata;
  }>;
  _metadataIterator(rootNode: DirectoryNode, opts: {
    readonly includeSymlinks: boolean;
    readonly includeNodeModules: boolean;
  }, prefix: string): Iterable<{
    baseName: string;
    canonicalPath: string;
    metadata: FileMetadata;
  }>;
  _normalizePath(relativeOrAbsolutePath: Path): string;
  _pathIterator(iterationRootNode: DirectoryNode, iterationRootParentNode: null | undefined | DirectoryNode, ancestorOfRootIdx: null | undefined | number, opts: {
    readonly alwaysYieldPosix: boolean;
    readonly canonicalPathOfRoot: string;
    readonly follow: boolean;
    readonly recursive: boolean;
    readonly subtreeOnly: boolean;
  }, pathPrefix: string, followedLinks: ReadonlySet<FileMetadata>): Iterable<Path>;
  _resolveSymlinkTargetToNormalPath(symlinkNode: FileMetadata, canonicalPathOfSymlink: Path): NormalizedSymlinkTarget;
  _getFileData(filePath: Path, opts: {
    followLeaf: boolean;
  }): null | undefined | FileMetadata;
  _cloneTree(root: DirectoryNode): DirectoryNode;
}
export default TreeFS;