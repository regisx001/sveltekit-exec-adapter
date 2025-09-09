// Libs
import { cp, rm, mkdir, stat } from "fs/promises";
import { execSync } from "child_process";
import { join } from "path";

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
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

// Types
interface BuildStep {
  name: string;
  action: () => Promise<void>;
}

// Utils
const logStep = (step: string) =>
  console.log(
    `${colors.blue}${colors.bright}[BUILD]${colors.reset} ${colors.cyan}${step}...${colors.reset}`
  );
const logSuccess = (step: string, time?: number) =>
  console.log(
    `${colors.green}${colors.bright}[SUCCESS]${colors.reset} ${
      colors.green
    }${step}${colors.reset}${
      time ? ` ${colors.dim}(${time}ms)${colors.reset}` : ""
    }`
  );
const logError = (step: string, error: Error) =>
  console.error(
    `${colors.red}${colors.bright}[ERROR]${colors.reset} ${colors.red}${step} failed:${colors.reset} ${colors.yellow}${error.message}${colors.reset}`
  );

const ensureDir = async (dir: string) => {
  try {
    await stat(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
};

const safeRemove = async (path: string) => {
  try {
    await stat(path);
    await rm(path, { recursive: true, force: true });
  } catch {
    // Directory doesn't exist, ignore
  }
};

const safeCopy = async (src: string, dest: string) => {
  try {
    await stat(src);
    await cp(src, dest, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to copy ${src} to ${dest}: ${error}`);
  }
};

// Build steps
const buildSteps: BuildStep[] = [
  {
    name: "Clean dist directory",
    action: async () => {
      await safeRemove("./dist");
      await ensureDir("./dist");
    },
  },
  {
    name: "Build TypeScript bundle",
    action: async () => {
      const result = await Bun.build({
        entrypoints: ["./src/index.ts"],
        outdir: "./dist",
        target: "node",
        format: "esm",
        minify: process.env.NODE_ENV === "production",
        sourcemap: process.env.NODE_ENV === "development" ? "external" : "none",
        splitting: false,
      });

      if (!result.success) {
        throw new Error(`Build failed with ${result.logs.length} errors`);
      }
    },
  },
  {
    name: "Generate type definitions",
    action: async () => {
      try {
        // Try bun tsc first, fallback to npx tsc for older Bun versions
        try {
          execSync("bun tsc --project tsconfig.types.json", {
            stdio: "pipe",
            encoding: "utf8",
          });
        } catch (bunError) {
          // Fallback to npx tsc for Bun versions that don't support tsc
          execSync("npx tsc --project tsconfig.types.json", {
            stdio: "pipe",
            encoding: "utf8",
          });
        }
      } catch (error) {
        throw new Error(
          `TypeScript compilation failed: ${(error as any).message}`
        );
      }
    },
  },
  {
    name: "Copy server templates",
    action: async () => {
      await safeCopy("./src/server", "./dist/server");
    },
  },
  {
    name: "Copy type definitions",
    action: async () => {
      await safeCopy("./src/types", "./dist/types");
    },
  },
];

// Main build function
async function build() {
  const startTime = Date.now();

  console.log(
    `${colors.magenta}${colors.bright}[BUILD]${colors.reset} ${colors.magenta}Building SvelteKit Exec Adapter...${colors.reset}\n`
  );

  for (const step of buildSteps) {
    const stepStart = Date.now();

    try {
      logStep(step.name);
      await step.action();
      logSuccess(step.name, Date.now() - stepStart);
    } catch (error) {
      logError(step.name, error as Error);
      process.exit(1);
    }
  }

  const totalTime = Date.now() - startTime;
  console.log(
    `\n${colors.green}${colors.bright}[SUCCESS]${colors.reset} ${colors.green}Build completed successfully in ${colors.bright}${totalTime}ms${colors.reset}${colors.green}!${colors.reset}`
  );
}

// Run build
await build();
