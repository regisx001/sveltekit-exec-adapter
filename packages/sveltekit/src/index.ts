// Libs
import { join } from "path";
import { writeFile } from "fs/promises";

// Types
import type { AdapterOptions } from "./types/AdapterOptions";
import type { Adapter } from "@sveltejs/kit";

// Constants
import { ADAPTER_NAME, SVELTEKIT_DIR } from "./constants/const";

// Utils
import {
  discoverClientAssets,
  generateAssetImports,
  analyzeAssets,
} from "./utils/assets";
import { compileApplication } from "./utils/compile";
import { generateDockerfile } from "./utils/docker";
import { BuildReporter } from "./utils/reporter";

/**
 * Create the sveltekit-exec-adapter
 * @param {AdapterOptions} [options] - Adapter options
 * @returns {Adapter} Returns an adapter object
 */
const adapter = (options?: AdapterOptions): Adapter => {
  return {
    name: ADAPTER_NAME,
    adapt: async (builder) => {
      const adapterOptions = {
        out: "dist",
        embedStatic: true,
        binaryName: "app",
        ...options,
      };

      // Initialize build reporter
      const reporter = new BuildReporter(builder);
      reporter.startBuild();

      // Step 1: Cleanups
      reporter.startStep("cleanup");
      builder.rimraf(SVELTEKIT_DIR);
      builder.mkdirp(SVELTEKIT_DIR);
      builder.rimraf(adapterOptions.out);
      builder.mkdirp(adapterOptions.out);
      reporter.completeStep("cleanup");

      // Step 2: Write build outputs
      reporter.startStep("sveltekit");
      builder.writeClient(join(SVELTEKIT_DIR, "client"));
      builder.writePrerendered(join(SVELTEKIT_DIR, "prerendered"));
      builder.writeServer(join(SVELTEKIT_DIR, "server"));

      // Remove the /_app directory in /server. As duplicated from the client directory. To be confirmed.
      builder.rimraf(join(SVELTEKIT_DIR, "server", "_app"));
      reporter.completeStep("sveltekit");

      // Step 3: Copy the server wrapper
      reporter.startStep("server");
      const path = join(import.meta.dirname, "server");
      builder.copy(path, join(SVELTEKIT_DIR, "temp-server"));
      reporter.completeStep("server");

      // Step 4: Generate manifest file with IIFE wrapper
      reporter.startStep("manifest");
      const manifest = builder.generateManifest({ relativePath: "./server" });
      const manifestModule = `const manifest = ${manifest};\nexport default manifest;`;
      await writeFile(
        join(SVELTEKIT_DIR, "manifest.js"),
        manifestModule,
        "utf-8"
      );
      reporter.completeStep("manifest");

      // Step 5: Generate assets imports
      reporter.startStep("assets");
      let assetCount = 0;
      if (adapterOptions.embedStatic) {
        const clientAssets = await discoverClientAssets(
          join(SVELTEKIT_DIR, "client"),
          join(SVELTEKIT_DIR, "prerendered")
        );

        // Analyze assets for reporting
        const assetAnalysis = analyzeAssets(clientAssets);
        assetCount = assetAnalysis.totalAssets;

        // Warn about large assets
        if (assetAnalysis.largeAssets.length > 0) {
          builder.log.warn(
            `⚠️  Found ${assetAnalysis.largeAssets.length} large assets (>1MB)`
          );
          for (const asset of assetAnalysis.largeAssets.slice(0, 3)) {
            const sizeMB = (asset.size / (1024 * 1024)).toFixed(1);
            builder.log.warn(`   • ${asset.path}: ${sizeMB}MB`);
          }
          if (assetAnalysis.largeAssets.length > 3) {
            builder.log.warn(
              `   • ... and ${assetAnalysis.largeAssets.length - 3} more`
            );
          }
        }

        const assetImports = generateAssetImports(clientAssets);
        await writeFile(
          join(SVELTEKIT_DIR, "temp-server", "assets.generated.ts"),
          assetImports
        );

        const totalSizeMB = (assetAnalysis.totalSize / (1024 * 1024)).toFixed(
          1
        );
        reporter.completeStep(
          "assets",
          `${assetCount} assets, ${totalSizeMB}MB total`
        );
      } else {
        // Just copy the assets to be served from disk
        builder.copy(
          join(SVELTEKIT_DIR, "client"),
          join(adapterOptions.out, "client")
        );
        builder.copy(
          join(SVELTEKIT_DIR, "prerendered"),
          join(adapterOptions.out, "prerendered")
        );
        await writeFile(
          join(SVELTEKIT_DIR, "temp-server", "assets.generated.ts"),
          "export const assetMap = new Map([]);"
        );
        reporter.completeStep("assets", "External assets copied");
      }

      // Step 6: Compile the app
      reporter.startStep("compile");
      const { binaryPath, sizeInMb } = await compileApplication(
        builder,
        adapterOptions
      );
      reporter.completeStep("compile", `${sizeInMb}MB binary`);

      // Step 7: Generate Dockerfile
      reporter.startStep("finalize");
      if (adapterOptions.target === "linux-x64") {
        await generateDockerfile(adapterOptions);
        builder.log.success("Dockerfile generated");
      }
      reporter.completeStep("finalize");

      // Complete build with statistics
      reporter.completeBuild({
        totalBuildTime: 0, // Will be calculated by reporter
        binarySize: `${sizeInMb}MB`,
        assetCount,
        embedStatic: adapterOptions.embedStatic,
        target: adapterOptions.target,
      });

      builder.log.success(
        `[sveltekit-exec-adapter] Start the application with: ./${binaryPath}`
      );
    },
    supports: {
      read: () => true,
    },
  };
};

export default adapter;
