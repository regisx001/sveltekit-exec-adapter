// Types
import type { Builder } from "@sveltejs/kit";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

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
    { name: "config", description: "Generating configurations", weight: 1 },
    { name: "assets", description: "Processing assets", weight: 2 },
    { name: "validation", description: "Validation of assets", weight: 1 },
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
    this.builder.log.info(
      `${colors.magenta}${colors.bright}[BUILD]${colors.reset} ${colors.magenta}Starting SvelteKit Exec Adapter build...${colors.reset}`
    );
    this.logBuildInfo();
  }

  startStep(stepName: string): void {
    const step = this.steps.find((s) => s.name === stepName);
    if (!step) {
      this.builder.log.warn(
        `${colors.yellow}${colors.bright}[WARNING]${colors.reset} ${colors.yellow}Unknown step: ${stepName}${colors.reset}`
      );
      return;
    }

    this.metrics.currentStep = stepName;
    this.metrics.stepTimes.set(stepName, Date.now());

    const progress = this.calculateProgress();
    const progressBar = this.createProgressBar(progress);

    this.builder.log.info(
      `${colors.blue}${progressBar}${colors.reset} ${colors.cyan}${step.description}...${colors.reset}`
    );
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
      `${colors.green}${progressBar}${colors.reset} ${
        colors.green
      }${this.getStepDescription(stepName)} completed in ${
        colors.bright
      }${durationStr}${colors.reset}${colors.green}${detailsStr}${colors.reset}`
    );
  }

  completeBuild(stats: BuildStats): void {
    const totalTime = Date.now() - this.metrics.startTime;

    this.builder.log.info("");
    this.builder.log.success(
      `${colors.green}${colors.bright}[SUCCESS]${colors.reset} ${colors.green}Build completed successfully!${colors.reset}`
    );
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

    const filledBar = `${colors.green}█${colors.reset}`.repeat(filled);
    const emptyBar = `${colors.dim}░${colors.reset}`.repeat(empty);
    const bar = filledBar + emptyBar;
    return `[${bar}] ${colors.bright}${percentage}%${colors.reset}`;
  }

  private getStepDescription(stepName: string): string {
    return this.steps.find((s) => s.name === stepName)?.description || stepName;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(1)}s`;
  }

  private logBuildInfo(): void {
    this.builder.log.info(
      `${colors.blue}${colors.bright}[INFO]${colors.reset} ${colors.blue}Build Configuration:${colors.reset}`
    );
    this.builder.log.info(
      `   ${colors.dim}•${colors.reset} Total steps: ${colors.bright}${this.metrics.totalSteps}${colors.reset}`
    );
    this.builder.log.info(
      `   ${colors.dim}•${colors.reset} Started at: ${
        colors.bright
      }${new Date().toLocaleTimeString()}${colors.reset}`
    );
    this.builder.log.info("");
  }

  private logBuildStats(stats: BuildStats, totalTime: number): void {
    this.builder.log.info(
      `${colors.cyan}${colors.bright}[STATS]${colors.reset} ${colors.cyan}Build Statistics:${colors.reset}`
    );
    this.builder.log.info(
      `   ${colors.dim}•${colors.reset} Total build time: ${
        colors.bright
      }${this.formatDuration(totalTime)}${colors.reset}`
    );
    this.builder.log.info(
      `   ${colors.dim}•${colors.reset} Binary size: ${colors.bright}${stats.binarySize}${colors.reset}`
    );
    this.builder.log.info(
      `   ${colors.dim}•${colors.reset} Assets processed: ${colors.bright}${stats.assetCount}${colors.reset}`
    );
    this.builder.log.info(
      `   ${colors.dim}•${colors.reset} Static embedding: ${
        stats.embedStatic
          ? `${colors.green}Enabled${colors.reset}`
          : `${colors.red}Disabled${colors.reset}`
      }`
    );
    if (stats.target) {
      this.builder.log.info(
        `   ${colors.dim}•${colors.reset} Target platform: ${colors.bright}${stats.target}${colors.reset}`
      );
    }
    this.builder.log.info("");
  }

  private logStepTimings(): void {
    this.builder.log.info(
      `${colors.magenta}${colors.bright}[TIMINGS]${colors.reset} ${colors.magenta}Step Timings:${colors.reset}`
    );

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
          `   ${colors.dim}•${colors.reset} ${colors.white}${
            step.description
          }:${colors.reset} ${colors.bright}${this.formatDuration(duration)}${
            colors.reset
          } ${colors.dim}(${percentage}%)${colors.reset}`
        );
      }
    }
    this.builder.log.info("");
  }
}
