// Libs
import { rm, writeFile } from "fs/promises";
import minimist from "minimist";

// Utils
import { bundle } from "./utils/bundle";
import { discoverClientAssets } from "./utils/assets";
import { compileApplication } from "./utils/compile";
import { generateDockerfile } from "./utils/docker";
import { validateCLIArgs } from "./utils/validation";

// Types
import type { CLIArgs } from "./types/CLIArgs";

// Variables
const args = minimist(process.argv.slice(2)) as CLIArgs;
const validation = validateCLIArgs(args);
if (!validation.isValid) {
	console.error("[JesterKit] Invalid arguments:");
	validation.errors.forEach((error) => console.error(`  - ${error}`));
	process.exit(1);
}

try {
	const { out = "dist", binaryName = "app", target, volume } = args;
	const options: CLIArgs = { out, binaryName, target, volume };

	await rm(out, { recursive: true, force: true });

	// Parse external dependencies
	const external: string[] = [];
	if (args.external) {
		if (typeof args.external === "string") {
			external.push(...args.external.split(","));
		} else if (Array.isArray(args.external)) {
			external.push(...args.external);
		}
	}

	let content = await bundle();
	console.log("[JesterKit] Bundle built");

	const assets = await discoverClientAssets(".output/public");
	console.log("[JesterKit] Assets discovery done");
	// Patch imports and paths
	for (const asset of assets) {
		content = `import ${asset.varName} from '${asset.filePath}' with { type: 'file' };\n` + content;
		content = content.replace(`"path": ".${asset.filePath}"`, `"path": ${asset.varName}`);
	}
	await writeFile(".output/bundle.js", content);
	console.log("[JesterKit] Bundle patched");

	const { binaryPath, sizeInMb } = await compileApplication(options);
	console.log(`[JesterKit] Application compiled (${sizeInMb} MB)`);

	if (target === "linux-x64") {
		await generateDockerfile(options);
		console.log("[JesterKit] Dockerfile generated");
	}

	console.log(`[JesterKit] Start the application with: ./${binaryPath}`);
} catch (error) {
	console.error(error);
	process.exit(1);
}
