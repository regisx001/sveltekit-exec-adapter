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

  /**
   * Windows-specific metadata used when packaging/building for Windows.
   * These fields are typically embedded in the executable/installer and used by
   * installers, the OS, and code-signing tools.
   */
  windows?: {
    meta?: {
      /** Application display title shown in installer UI and window title bars (e.g. "My App") */
      title?: string;
      /** Publisher/author name used in installer metadata and store listings (e.g. "Acme, Inc.") */
      publisher?: string;
      /** Application version (prefer semver format, e.g. "1.2.3") used in the executable/installer metadata */
      version?: string;
      /** Short description of the application used in installer UI or package metadata */
      description?: string;
      /** Copyright notice included in the executable metadata (e.g. "© 2025 Acme, Inc. All rights reserved.") */
      copyright?: string;
    };
    /**
     * When true, builds the executable as a GUI application and hides the console window.
     * When false (default), the app is a console application and a console window is shown.
     * Use true for GUI apps that should not display a terminal window to the user.
     */
    hideConsole?: boolean;
    /**
     * Path to the icon file to embed in the Windows executable.
     * Prefer .ico files containing multiple sizes (e.g. 16x16, 32x32, 48x48, 256x256).
     * If using other formats, they may be converted during packaging; providing a proper
     * .ico is recommended for best results in Windows shell and installer UI.
     */
    iconPath?: string;
  };
};
