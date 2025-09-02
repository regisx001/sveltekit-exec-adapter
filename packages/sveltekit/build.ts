// Libs
import { cp } from "fs/promises";
import { $ } from "bun";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
});

await $`bun tsc --project tsconfig.types.json`;
await cp("./src/server", "./dist/server", { recursive: true });
await cp("./src/types", "./dist/types", { recursive: true });

console.log("✅ SvelteKit package built successfully");
