type Target =
  | "linux-x64"
  | "macos-arm64"
  | "windows-x64"
  | "darwin-x64"
  | "darwin-arm64"
  | "linux-x64-musl"
  | "linux-arm64-musl";

export declare type AdapterOptions = {
  /** Output directory for the built binary (/dist by default) */
  out?: string;
  /** Name of the executable binary (default: "app") */
  binaryName?: string;
  /** Whether to embed static assets in the binary (default: true) */
  embedStatic?: boolean;
  /** Target platform for the binary. By default, the binary is built for the current platform. */
  target?: Target;
  /** Volume mount point for the binary (default no volume mount). Can be used for persistent storage, usually /data. */
  volume?: string;
  /** Whether to automatically open the browser when the server starts (default: false) */
  openBrowser?: boolean;
  /** Asset validation options */
  validation?: {
    /** Maximum individual asset size in bytes (default: 50MB) */
    maxAssetSize?: number;
    /** Maximum total size of all assets (default: 500MB) */
    maxTotalSize?: number;
    /** Warn if asset is larger than this (default: 10MB) */
    warnThreshold?: number;
    /** Extensions that should trigger errors */
    blockedExtensions?: string[];
    /** Extensions that should trigger warnings */
    warnExtensions?: string[];
    /** If provided, only these extensions are allowed */
    allowedExtensions?: string[];
    /** Skip validation entirely (not recommended) */
    skip?: boolean;
  };
};
