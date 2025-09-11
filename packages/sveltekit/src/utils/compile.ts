// Libs
import { execSync } from "child_process";
import { join } from "path";
import { stat } from "fs/promises";

// Types
import type { Builder } from "@sveltejs/kit";
import type { Target, AdapterOptions } from "../types/AdapterOptions";

// Constants
import { SVELTEKIT_DIR, TARGETS_MAP } from "../constants/const";

export async function compileApplication(
  builder: Builder,
  options: {
    target?: Target;
    out: string;
    binaryName: string;
    windows?: AdapterOptions["windows"];
  }
) {
  try {
    const bunVersion = execSync("bun --version", {
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
    const versionParts = bunVersion.split(".").map(Number);

    if (versionParts.length !== 3 || versionParts.some(isNaN)) {
      builder.log.error(`Invalid Bun version format: ${bunVersion}`);
      process.exit(1);
    }

    const major = versionParts[0]!;
    const minor = versionParts[1]!;
    const patch = versionParts[2]!;
    const required = [1, 2, 18];

    const isVersionValid =
      major > required[0]! ||
      (major === required[0]! && minor > required[1]!) ||
      (major === required[0]! &&
        minor === required[1]! &&
        patch >= required[2]!);

    if (!isVersionValid) {
      builder.log.error(
        `Bun version ${bunVersion} is too old. Please upgrade to ${required.join(
          "."
        )} or later with bun upgrade.`
      );
      process.exit(1);
    }
  } catch (error) {
    builder.log.error(
      "Bun is not installed. Please install Bun and try again."
    );
    process.exit(1);
  }

  // Process Windows-specific compilation arguments
  const windowsArgs: string[] = [];

  if (process.platform === "win32" && options.windows) {
    builder.log.info("🪟 Applying Windows-specific configuration...");

    // Hide console window for GUI applications
    if (options.windows.hideConsole) {
      windowsArgs.push("--windows-hide-console");
      builder.log.info("   • Hiding console window for GUI application");
    }

    // Add metadata if provided
    if (options.windows.meta) {
      const meta = options.windows.meta;
      builder.log.info("   • Adding executable metadata:");

      if (meta.title) {
        windowsArgs.push(`--windows-title="${meta.title}"`);
        builder.log.info(`     - Title: ${meta.title}`);
      }

      if (meta.publisher) {
        windowsArgs.push(`--windows-publisher="${meta.publisher}"`);
        builder.log.info(`     - Publisher: ${meta.publisher}`);
      }

      if (meta.version) {
        windowsArgs.push(`--windows-version="${meta.version}"`);
        builder.log.info(`     - Version: ${meta.version}`);
      }

      if (meta.description) {
        windowsArgs.push(`--windows-description="${meta.description}"`);
        builder.log.info(`     - Description: ${meta.description}`);
      }

      if (meta.copyright) {
        windowsArgs.push(`--windows-copyright="${meta.copyright}"`);
        builder.log.info(`     - Copyright: ${meta.copyright}`);
      }
    }

    // Add icon if provided
    if (options.windows.iconPath) {
      windowsArgs.push(`--windows-icon="${options.windows.iconPath}"`);
      builder.log.info(`   • Adding custom icon: ${options.windows.iconPath}`);
    }
  }

  const compileArgs = [
    "build",
    "--compile",
    "--minify",
    "--sourcemap=none",
    ...(options.target ? [`--target=${TARGETS_MAP[options.target]}`] : []),
    join(SVELTEKIT_DIR, "adapter-runtime/index.ts"),
    "--outfile",
    join(options.out, options.binaryName),
    ...windowsArgs,
  ].join(" ");
  execSync(`bun ${compileArgs}`, { stdio: "inherit" });

  // On Windows, Bun automatically adds .exe extension
  const actualBinaryName =
    process.platform === "win32"
      ? `${options.binaryName}.exe`
      : options.binaryName;
  const binaryPath = join(options.out, actualBinaryName);
  const { size: sizeInBytes } = await stat(binaryPath);
  const sizeInMb = (sizeInBytes / (1024 * 1024)).toFixed(1);

  return { binaryPath, sizeInMb };
}
