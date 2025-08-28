// Libs
import { cp } from "fs/promises";
import { $ } from "bun";
import { readFile } from "fs/promises";
import { writeFile } from "fs/promises";

await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	target: "node",
	format: "esm",
});

const filePath = "./dist/index.js";
const code = await readFile(filePath, "utf8");
const shebang = "#!/usr/bin/env node\n";
await writeFile(filePath, shebang + code);
await $`chmod +x ${filePath}`;

await $`bun tsc --project tsconfig.types.json`;
await cp("./src/types", "./dist/types", { recursive: true });

console.log("✅ TanStack package built successfully");
