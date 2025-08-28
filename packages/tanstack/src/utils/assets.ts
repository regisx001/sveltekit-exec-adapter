// Libs
import { parse, join } from "path";
import { readdir, stat } from "fs/promises";
import { createHash } from "crypto";
import { normalize } from "path";

// Types
interface ClientAsset {
	filePath: string;
	varName: string;
}

function generateVarName(filePath: string) {
	const { name, ext } = parse(filePath);

	let cleanName = name
		.replace(/[^a-zA-Z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");

	if (/^[0-9]/.test(cleanName)) cleanName = `asset_${cleanName}`;

	if (!cleanName) cleanName = "asset";

	// Path hash to handle same file names from different paths
	const normalizedPath = normalize(filePath).replace(/\\/g, "/");
	const pathHash = createHash("md5").update(normalizedPath).digest("hex").slice(0, 4);

	const extSuffix = ext.replace(".", "").toUpperCase();

	return `${cleanName}_${extSuffix}_${pathHash}`;
}

export async function discoverClientAssets(dir: string) {
	const assets: ClientAsset[] = [];

	async function walkDirectory(dir: string) {
		const entries = await readdir(dir);

		const entryStats = await Promise.all(
			entries.map(async (entry) => {
				const fullPath = join(dir, entry);
				const stats = await stat(fullPath);
				return { entry, fullPath, stats };
			})
		);

		const dirPromises = [];

		for (const { entry, fullPath, stats } of entryStats) {
			if (stats.isDirectory()) {
				dirPromises.push(walkDirectory(fullPath));
			} else {
				const varName = generateVarName(fullPath);

				assets.push({
					filePath: fullPath.replace(".output", "."),
					varName,
				});
			}
		}

		await Promise.all(dirPromises);
	}

	await walkDirectory(dir);

	return assets;
}
