// Libs
import esbuild from "esbuild";
import { readFile } from "fs/promises";

export async function bundle(external: string[] = []) {
	try {
		await esbuild.build({
			entryPoints: [".output/server/index.mjs"],
			bundle: true,
			format: "esm",
			outfile: ".output/bundle.js",
			platform: "node",
			logLevel: "error",
			external,
		});
		return await readFile(".output/bundle.js", "utf-8");
	} catch (error) {
		if (error instanceof Error && error.message.includes("Could not resolve")) {
			console.error("[JesterKit] Bundle failed with unresolved dependencies!");
			console.error("[JesterKit] Solution: Add external dependencies to your postbuild command:");
			console.error('[JesterKit] "postbuild": "exe-nuxt --external=missing-package,@other/package"');
			console.error("[JesterKit] Or use the --external flag:");
			console.error("[JesterKit] exe-nuxt --external missing-package --external @other/package\n");
		}
		throw error;
	}
}
