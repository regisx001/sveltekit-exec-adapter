// Libs
import { join } from "path";
import { writeFile } from "fs/promises";

// Types
import type { AdapterOptions } from "./types/AdapterOptions";
import type { Adapter } from "@sveltejs/kit";

// Constants
import { ADAPTER_NAME, SVELTEKIT_DIR } from "./constants/const";

// Utils
import { discoverClientAssets, generateAssetImports } from "./utils/assets";
import { compileApplication } from "./utils/compile";
import { generateDockerfile } from "./utils/docker";

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

      // Step 1: Cleanups
      builder.rimraf(SVELTEKIT_DIR);
      builder.mkdirp(SVELTEKIT_DIR);
      builder.rimraf(adapterOptions.out);
      builder.mkdirp(adapterOptions.out);

      // Step 2: Write build outputs
      builder.writeClient(join(SVELTEKIT_DIR, "client"));
      builder.writePrerendered(join(SVELTEKIT_DIR, "prerendered"));
      builder.writeServer(join(SVELTEKIT_DIR, "server"));

      // Remove the /_app directory in /server. As duplicated from the client directory. To be confirmed.
      builder.rimraf(join(SVELTEKIT_DIR, "server", "_app"));

      builder.log.success("[sveltekit-exec-adapter] SvelteKit build complete");

      // Step 3: Copy the server wrapper
      const path = join(import.meta.dirname, "server");
      builder.copy(path, join(SVELTEKIT_DIR, "temp-server"));
      builder.log.success("[sveltekit-exec-adapter] Server copied");

      // Step 4: Generate manifest file with IIFE wrapper
      const manifest = builder.generateManifest({ relativePath: "./server" });
      const manifestModule = `const manifest = ${manifest};\nexport default manifest;`;
      await writeFile(
        join(SVELTEKIT_DIR, "manifest.js"),
        manifestModule,
        "utf-8"
      );
      builder.log.success("[sveltekit-exec-adapter] Manifest generated");

      // Step 5: Generate assets imports
      if (adapterOptions.embedStatic) {
        const clientAssets = await discoverClientAssets(
          join(SVELTEKIT_DIR, "client"),
          join(SVELTEKIT_DIR, "prerendered")
        );
        const assetImports = generateAssetImports(clientAssets);
        await writeFile(
          join(SVELTEKIT_DIR, "temp-server", "assets.generated.ts"),
          assetImports
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
      }
      builder.log.success("[sveltekit-exec-adapter] Assets generated");

      // Step 6: Compile the app
      const { binaryPath, sizeInMb } = await compileApplication(
        builder,
        adapterOptions
      );
      builder.log.success(
        `[sveltekit-exec-adapter] Application compiled (${sizeInMb} MB)`
      );

      // Step 7: Generate Dockerfile
      if (adapterOptions.target === "linux-x64") {
        await generateDockerfile(adapterOptions);
        builder.log.success("Dockerfile generated");
      }

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
