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
  size?: number;
}

export type { ClientAsset };

interface AssetAnalysis {
  totalAssets: number;
  totalSize: number;
  largeAssets: Array<{ path: string; size: number }>;
  assetsByType: Map<string, { count: number; size: number }>;
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
  const pathHash = createHash("md5")
    .update(normalizedPath)
    .digest("hex")
    .slice(0, 4);

  const extSuffix = ext.replace(".", "").toUpperCase();

  return `${cleanName}_${extSuffix}_${pathHash}`;
}

export async function discoverClientAssets(
  clientDir: string,
  prerenderedDir: string
): Promise<ClientAsset[]> {
  const assets: ClientAsset[] = [];

  async function walkDirectory(
    dir: string,
    isPrerendered: boolean
  ): Promise<void> {
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
        const routePath =
          "/" +
          relative(
            isPrerendered ? prerenderedDir : clientDir,
            fullPath
          ).replace(/\\/g, "/");
        const varName = generateVarName(routePath);

        assets.push({
          filePath: fullPath,
          routePath,
          varName,
          isPrerendered,
          size: stats.size,
        });
      }
    }

    await Promise.all(dirPromises);
  }

  await Promise.all([
    walkDirectory(clientDir, false),
    walkDirectory(prerenderedDir, true),
  ]);

  return assets;
}

export function generateAssetImports(assets: ClientAsset[]): string {
  const imports = assets
    .map((asset) => {
      const relativePath = asset.isPrerendered
        ? `../prerendered${asset.routePath}`
        : `../client${asset.routePath}`;
      return `import ${asset.varName} from "${relativePath}" with { type: "file" };`;
    })
    .join("\n");

  const mapEntries = assets
    .map((asset) => `  ["${asset.routePath}", ${asset.varName}]`)
    .join(",\n");

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

export function analyzeAssets(assets: ClientAsset[]): AssetAnalysis {
  const analysis: AssetAnalysis = {
    totalAssets: assets.length,
    totalSize: 0,
    largeAssets: [],
    assetsByType: new Map(),
  };

  for (const asset of assets) {
    const size = asset.size || 0;
    analysis.totalSize += size;

    // Track large assets (> 1MB)
    if (size > 1024 * 1024) {
      analysis.largeAssets.push({
        path: asset.routePath,
        size: size,
      });
    }

    // Track by file extension
    const pathParts = asset.routePath.split(".");
    const ext =
      pathParts.length > 1
        ? pathParts.pop()?.toLowerCase() || "unknown"
        : "unknown";
    const typeStats = analysis.assetsByType.get(ext) || { count: 0, size: 0 };
    typeStats.count++;
    typeStats.size += size;
    analysis.assetsByType.set(ext, typeStats);
  }

  return analysis;
}

export function formatAssetAnalysis(analysis: AssetAnalysis): string[] {
  const lines: string[] = [];

  lines.push(`Total assets: ${analysis.totalAssets}`);
  lines.push(`Total size: ${formatSize(analysis.totalSize)}`);

  if (analysis.largeAssets.length > 0) {
    lines.push(`Large assets (>1MB): ${analysis.largeAssets.length}`);
  }

  // Show top asset types
  const sortedTypes = Array.from(analysis.assetsByType.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 5);

  if (sortedTypes.length > 0) {
    lines.push("Top asset types:");
    for (const [ext, stats] of sortedTypes) {
      lines.push(`  • ${ext}: ${stats.count} files, ${formatSize(stats.size)}`);
    }
  }

  return lines;
}

function formatSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
