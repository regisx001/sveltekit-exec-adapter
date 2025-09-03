// Types
import type { Builder } from "@sveltejs/kit";

interface BuildMetrics {
  startTime: number;
  stepTimes: Map<string, number>;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
}

interface StepInfo {
  name: string;
  description: string;
  weight: number; // Relative weight for progress calculation
}

interface BuildStats {
  totalBuildTime: number;
  binarySize: string;
  assetCount: number;
  embedStatic: boolean;
  target?: string;
}

export class BuildReporter {
  private metrics: BuildMetrics;
  private builder: Builder;
  private steps: StepInfo[] = [
    { name: "cleanup", description: "Cleaning up directories", weight: 1 },
    {
      name: "sveltekit",
      description: "Building SvelteKit application",
      weight: 3,
    },
    { name: "server", description: "Copying server wrapper", weight: 1 },
    { name: "manifest", description: "Generating manifest", weight: 1 },
    { name: "assets", description: "Processing assets", weight: 2 },
    { name: "compile", description: "Compiling to executable", weight: 4 },
    { name: "finalize", description: "Finalizing build", weight: 1 },
  ];

  constructor(builder: Builder) {
    this.builder = builder;
    this.metrics = {
      startTime: Date.now(),
      stepTimes: new Map(),
      currentStep: "",
      totalSteps: this.steps.length,
      completedSteps: 0,
    };
  }

  startBuild(): void {
    this.builder.log.info("🚀 Starting SvelteKit Exec Adapter build...");
    this.logBuildInfo();
  }

  startStep(stepName: string): void {
    const step = this.steps.find((s) => s.name === stepName);
    if (!step) {
      this.builder.log.warn(`⚠️  Unknown step: ${stepName}`);
      return;
    }

    this.metrics.currentStep = stepName;
    this.metrics.stepTimes.set(stepName, Date.now());

    const progress = this.calculateProgress();
    const progressBar = this.createProgressBar(progress);

    this.builder.log.info(`${progressBar} ${step.description}...`);
  }

  completeStep(stepName: string, details?: string): void {
    const startTime = this.metrics.stepTimes.get(stepName);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.metrics.completedSteps++;

    const progress = this.calculateProgress();
    const progressBar = this.createProgressBar(progress);

    const durationStr = this.formatDuration(duration);
    const detailsStr = details ? ` (${details})` : "";

    // Use info instead of success to avoid double checkmarks
    this.builder.log.info(
      `${progressBar} ${this.getStepDescription(
        stepName
      )} completed in ${durationStr}${detailsStr}`
    );
  }

  completeBuild(stats: BuildStats): void {
    const totalTime = Date.now() - this.metrics.startTime;

    this.builder.log.info("");
    this.builder.log.success("🎉 Build completed successfully!");
    this.builder.log.info("");
    this.logBuildStats(stats, totalTime);
    this.logStepTimings();
  }

  private calculateProgress(): number {
    if (this.metrics.totalSteps === 0) return 0;

    // Calculate weighted progress
    let completedWeight = 0;
    let totalWeight = 0;

    for (const step of this.steps) {
      totalWeight += step.weight;
      if (
        this.metrics.stepTimes.has(step.name) &&
        this.metrics.completedSteps >
          this.steps.findIndex((s) => s.name === step.name)
      ) {
        completedWeight += step.weight;
      }
    }

    return Math.round((completedWeight / totalWeight) * 100);
  }

  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    const bar = "█".repeat(filled) + "░".repeat(empty);
    return `[${bar}] ${percentage}%`;
  }

  private getStepDescription(stepName: string): string {
    return this.steps.find((s) => s.name === stepName)?.description || stepName;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(1)}s`;
  }

  private formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private logBuildInfo(): void {
    this.builder.log.info("📊 Build Configuration:");
    this.builder.log.info(`   • Total steps: ${this.metrics.totalSteps}`);
    this.builder.log.info(
      `   • Started at: ${new Date().toLocaleTimeString()}`
    );
    this.builder.log.info("");
  }

  private logBuildStats(stats: BuildStats, totalTime: number): void {
    this.builder.log.info("📈 Build Statistics:");
    this.builder.log.info(
      `   • Total build time: ${this.formatDuration(totalTime)}`
    );
    this.builder.log.info(`   • Binary size: ${stats.binarySize}`);
    this.builder.log.info(`   • Assets processed: ${stats.assetCount}`);
    this.builder.log.info(
      `   • Static embedding: ${
        stats.embedStatic ? "✅ Enabled" : "❌ Disabled"
      }`
    );
    if (stats.target) {
      this.builder.log.info(`   • Target platform: ${stats.target}`);
    }
    this.builder.log.info("");
  }

  private logStepTimings(): void {
    this.builder.log.info("⏱️  Step Timings:");

    for (const step of this.steps) {
      const startTime = this.metrics.stepTimes.get(step.name);
      if (startTime) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const percentage = (
          (duration / (Date.now() - this.metrics.startTime)) *
          100
        ).toFixed(1);

        this.builder.log.info(
          `   • ${step.description}: ${this.formatDuration(
            duration
          )} (${percentage}%)`
        );
      }
    }
    this.builder.log.info("");
  }

  // Utility methods for asset analysis
  analyzeAssets(
    clientDir: string,
    prerenderedDir: string
  ): Promise<{ count: number; totalSize: number }> {
    // This would be implemented to analyze asset sizes
    // For now, return a placeholder
    return Promise.resolve({ count: 0, totalSize: 0 });
  }

  warnLargeAssets(assets: Array<{ path: string; size: number }>): void {
    const largeAssets = assets.filter((asset) => asset.size > 1024 * 1024); // > 1MB

    if (largeAssets.length > 0) {
      this.builder.log.warn("");
      this.builder.log.warn("⚠️  Large assets detected:");
      for (const asset of largeAssets) {
        this.builder.log.warn(
          `   • ${asset.path}: ${this.formatSize(asset.size)}`
        );
      }
      this.builder.log.warn(
        "   Consider excluding large assets from binary embedding."
      );
      this.builder.log.warn("");
    }
  }

  suggestOptimizations(stats: BuildStats): void {
    const suggestions: string[] = [];

    // Binary size suggestions
    const binarySizeMB = parseFloat(stats.binarySize);
    if (binarySizeMB > 50) {
      suggestions.push("Consider disabling static embedding for large assets");
    }

    // Asset count suggestions
    if (stats.assetCount > 1000) {
      suggestions.push(
        "Large number of assets detected - consider asset bundling"
      );
    }

    // Build time suggestions
    if (stats.totalBuildTime > 60000) {
      // > 1 minute
      suggestions.push(
        "Long build time - consider enabling incremental builds"
      );
    }

    if (suggestions.length > 0) {
      this.builder.log.info("");
      this.builder.log.info("💡 Optimization Suggestions:");
      for (const suggestion of suggestions) {
        this.builder.log.info(`   • ${suggestion}`);
      }
      this.builder.log.info("");
    }
  }
}
