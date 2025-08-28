// Libs
import { readdir, stat } from "fs/promises";
import { join, relative, parse } from "path";
import { createHash } from "crypto";
import { normalize } from "path";

// Types
interface ClientAsset {
	filePath: string;
	routePath: string;
	varName: string;
	isPrerendered?: boolean;
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

export async function discoverClientAssets(clientDir: string, prerenderedDir: string): Promise<ClientAsset[]> {
	const assets: ClientAsset[] = [];

	async function walkDirectory(dir: string, isPrerendered: boolean): Promise<void> {
		if (!(await stat(dir).catch(() => false))) return;

		const entries = await readdir(dir);

		const entryStats = await Promise.all(
			entries.map(async (entry) => {
				const fullPath = join(dir, entry);
				const stats = await stat(fullPath);
				return { entry, fullPath, stats };
			})
		);

		const dirPromises: Promise<void>[] = [];

		for (const { entry, fullPath, stats } of entryStats) {
			if (stats.isDirectory()) {
				dirPromises.push(walkDirectory(fullPath, isPrerendered));
			} else {
				const routePath = "/" + relative(isPrerendered ? prerenderedDir : clientDir, fullPath).replace(/\\/g, "/");
				const varName = generateVarName(routePath);

				assets.push({
					filePath: fullPath,
					routePath,
					varName,
					isPrerendered,
				});
			}
		}

		await Promise.all(dirPromises);
	}

	await Promise.all([walkDirectory(clientDir, false), walkDirectory(prerenderedDir, true)]);

	return assets;
}

export function generateAssetImports(assets: ClientAsset[]): string {
	const imports = assets
		.map((asset) => {
			const relativePath = asset.isPrerendered ? `../prerendered${asset.routePath}` : `../client${asset.routePath}`;
			return `import ${asset.varName} from "${relativePath}" with { type: "file" };`;
		})
		.join("\n");

	const mapEntries = assets.map((asset) => `  ["${asset.routePath}", ${asset.varName}]`).join(",\n");

	return `// Auto-generated asset imports
// @ts-nocheck
  ${imports}

  export const assetMap = new Map([
  ${mapEntries}
  ]);

  export const assets = {
  ${assets.map((asset) => `  ${asset.varName}`).join(",\n")}
  };
  `;
}
