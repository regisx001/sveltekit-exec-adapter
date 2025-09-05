// Libs
import { stat, access } from "fs/promises";
import { extname, basename } from "path";
import { constants } from "fs";

// Types
import type { ClientAsset } from "./assets";

export interface AssetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalSize: number;
  assetCount: number;
  assetsByType: Map<string, { count: number; size: number }>;
  largeAssets: Array<{ path: string; size: number; type: string }>;
  problematicAssets: Array<{ path: string; reason: string }>;
}

export interface ValidationOptions {
  maxAssetSize: number; // Maximum individual asset size in bytes
  maxTotalSize: number; // Maximum total size of all assets
  warnThreshold: number; // Warn if asset is larger than this
  allowedExtensions?: string[]; // If provided, only these extensions are allowed
  blockedExtensions: string[]; // Extensions that should trigger errors
  warnExtensions: string[]; // Extensions that should trigger warnings
}

// Default validation options
export const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  maxAssetSize: 50 * 1024 * 1024, // 50MB per asset
  maxTotalSize: 500 * 1024 * 1024, // 500MB total
  warnThreshold: 10 * 1024 * 1024, // Warn at 10MB
  blockedExtensions: [".exe", ".dll", ".so", ".dylib", ".app", ".deb", ".rpm"],
  warnExtensions: [".zip", ".tar", ".gz", ".rar", ".7z", ".iso", ".dmg"],
};

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Check if a file exists and is readable
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK | constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats safely
 */
async function getFileStats(
  filePath: string
): Promise<{ size: number; isFile: boolean } | null> {
  try {
    const stats = await stat(filePath);
    return {
      size: stats.size,
      isFile: stats.isFile(),
    };
  } catch {
    return null;
  }
}

/**
 * Analyze asset type and potential issues
 */
function analyzeAssetType(
  asset: ClientAsset,
  options: ValidationOptions
): {
  warnings: string[];
  errors: string[];
  type: string;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const ext = extname(asset.filePath).toLowerCase();
  const fileName = basename(asset.filePath);

  let type = ext.slice(1) || "unknown";

  // Check blocked extensions
  if (options.blockedExtensions.includes(ext)) {
    errors.push(`Blocked file type: ${asset.routePath} (${ext})`);
  }

  // Check warning extensions
  if (options.warnExtensions.includes(ext)) {
    warnings.push(
      `Potentially problematic file type: ${asset.routePath} (${ext})`
    );
  }

  // Check allowed extensions if specified
  if (options.allowedExtensions && !options.allowedExtensions.includes(ext)) {
    errors.push(`File extension not allowed: ${asset.routePath} (${ext})`);
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(tmp|temp|cache|log)$/i,
    /^\.DS_Store$/i,
    /^thumbs\.db$/i,
    /^desktop\.ini$/i,
    /\.(bak|backup|old)$/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      warnings.push(
        `Suspicious file detected: ${asset.routePath} (likely temporary/system file)`
      );
      break;
    }
  }

  // Check for very long file names (can cause issues on some filesystems)
  if (fileName.length > 255) {
    errors.push(
      `File name too long: ${asset.routePath} (${fileName.length} characters)`
    );
  }

  // Check for special characters that might cause issues
  const problematicChars = /[<>:"|?*\x00-\x1f]/;
  if (problematicChars.test(fileName)) {
    warnings.push(`File name contains special characters: ${asset.routePath}`);
  }

  return { warnings, errors, type };
}

/**
 * Validate individual asset
 */
async function validateAsset(
  asset: ClientAsset,
  options: ValidationOptions
): Promise<{
  errors: string[];
  warnings: string[];
  updatedAsset: ClientAsset;
  type: string;
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let updatedAsset = { ...asset };

  // Check if file exists
  if (!(await fileExists(asset.filePath))) {
    errors.push(`Asset file not found: ${asset.filePath}`);
    return { errors, warnings, updatedAsset, type: "missing" };
  }

  // Get file stats
  const stats = await getFileStats(asset.filePath);
  if (!stats) {
    errors.push(`Cannot read asset file: ${asset.filePath}`);
    return { errors, warnings, updatedAsset, type: "unreadable" };
  }

  if (!stats.isFile) {
    errors.push(`Asset path is not a file: ${asset.filePath}`);
    return { errors, warnings, updatedAsset, type: "notfile" };
  }

  // Update asset with actual size if not present
  if (!updatedAsset.size) {
    updatedAsset.size = stats.size;
  }

  // Validate file size
  if (stats.size > options.maxAssetSize) {
    errors.push(
      `Asset too large: ${asset.routePath} (${formatBytes(
        stats.size
      )}, max: ${formatBytes(options.maxAssetSize)})`
    );
  } else if (stats.size > options.warnThreshold) {
    warnings.push(
      `Large asset detected: ${asset.routePath} (${formatBytes(stats.size)})`
    );
  }

  // Check for empty files
  if (stats.size === 0) {
    warnings.push(`Empty file detected: ${asset.routePath}`);
  }

  // Analyze asset type
  const typeAnalysis = analyzeAssetType(updatedAsset, options);
  errors.push(...typeAnalysis.errors);
  warnings.push(...typeAnalysis.warnings);

  return {
    errors,
    warnings,
    updatedAsset,
    type: typeAnalysis.type,
  };
}

/**
 * Comprehensive asset validation
 */
export async function validateAssets(
  assets: ClientAsset[],
  options: ValidationOptions = DEFAULT_VALIDATION_OPTIONS
): Promise<AssetValidationResult> {
  const result: AssetValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    totalSize: 0,
    assetCount: assets.length,
    assetsByType: new Map(),
    largeAssets: [],
    problematicAssets: [],
  };

  // Validate each asset
  const validationPromises = assets.map((asset) =>
    validateAsset(asset, options)
  );
  const validationResults = await Promise.all(validationPromises);

  const validAssets: ClientAsset[] = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const validation = validationResults[i];

    if (!asset || !validation) {
      continue;
    }

    // Collect errors and warnings
    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);

    // Track problematic assets
    if (validation.errors.length > 0) {
      result.problematicAssets.push({
        path: asset.routePath,
        reason: validation.errors.join(", "),
      });
      result.isValid = false;
      continue; // Skip invalid assets
    }

    const validAsset = validation.updatedAsset;
    validAssets.push(validAsset);

    // Update statistics
    const size = validAsset.size || 0;
    result.totalSize += size;

    // Track large assets
    if (size > options.warnThreshold) {
      result.largeAssets.push({
        path: validAsset.routePath,
        size: size,
        type: validation.type,
      });
    }

    // Track assets by type
    const typeStats = result.assetsByType.get(validation.type) || {
      count: 0,
      size: 0,
    };
    typeStats.count++;
    typeStats.size += size;
    result.assetsByType.set(validation.type, typeStats);
  }

  // Validate total size
  if (result.totalSize > options.maxTotalSize) {
    result.errors.push(
      `Total asset size exceeds limit: ${formatBytes(
        result.totalSize
      )} (max: ${formatBytes(options.maxTotalSize)})`
    );
    result.isValid = false;
  }

  // Additional validation warnings
  if (result.totalSize > options.maxTotalSize * 0.8) {
    result.warnings.push(
      `Total asset size is approaching the limit: ${formatBytes(
        result.totalSize
      )} (limit: ${formatBytes(options.maxTotalSize)})`
    );
  }

  // Warn about too many assets
  if (validAssets.length > 1000) {
    result.warnings.push(
      `Large number of assets detected: ${validAssets.length} assets may increase build time`
    );
  }

  // Update asset count to reflect only valid assets
  result.assetCount = validAssets.length;

  return result;
}

/**
 * Generate human-readable validation report
 */
export function generateValidationReport(
  result: AssetValidationResult
): string[] {
  const report: string[] = [];

  // Summary
  report.push(`📊 Asset Validation Summary:`);
  report.push(`   Status: ${result.isValid ? "✅ Valid" : "❌ Invalid"}`);
  report.push(`   Total assets: ${result.assetCount}`);
  report.push(`   Total size: ${formatBytes(result.totalSize)}`);

  // Errors
  if (result.errors.length > 0) {
    report.push(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach((error) => report.push(`   • ${error}`));
  }

  // Warnings
  if (result.warnings.length > 0) {
    report.push(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning) => report.push(`   • ${warning}`));
  }

  // Large assets
  if (result.largeAssets.length > 0) {
    report.push(`\n📦 Large Assets (${result.largeAssets.length}):`);
    result.largeAssets
      .sort((a, b) => b.size - a.size)
      .slice(0, 10) // Show top 10
      .forEach((asset) => {
        report.push(
          `   • ${asset.path}: ${formatBytes(asset.size)} (${asset.type})`
        );
      });

    if (result.largeAssets.length > 10) {
      report.push(`   ... and ${result.largeAssets.length - 10} more`);
    }
  }

  // Asset type breakdown
  if (result.assetsByType.size > 0) {
    report.push(`\n📂 Assets by Type:`);
    const sortedTypes = Array.from(result.assetsByType.entries()).sort(
      (a, b) => b[1].size - a[1].size
    );

    sortedTypes.forEach(([type, stats]) => {
      report.push(
        `   • ${type}: ${stats.count} files, ${formatBytes(stats.size)}`
      );
    });
  }

  // Suggestions
  if (result.largeAssets.length > 0 || result.warnings.length > 0) {
    report.push(`\n💡 Suggestions:`);

    if (result.largeAssets.length > 0) {
      report.push(`   • Consider compressing large assets before embedding`);
      report.push(`   • Use external asset serving for very large files`);
    }

    if (result.problematicAssets.length > 0) {
      report.push(`   • Review and remove problematic assets`);
    }

    if (result.totalSize > 100 * 1024 * 1024) {
      // 100MB
      report.push(
        `   • Consider setting embedStatic: false for development builds`
      );
    }
  }

  return report;
}
