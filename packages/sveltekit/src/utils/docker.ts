// Libs
import { writeFile } from "fs/promises";
import { join } from "path";

// Types
import type { AdapterOptions } from "../types/AdapterOptions";

export async function generateDockerfile(options: AdapterOptions) {
	const binaryName = options.binaryName || "app";
	const out = options.out || "dist";
	const volume = options.volume || "";
	const base = options.target?.endsWith("-musl") ? "alpine:3.20" : "debian:bookworm-slim";

	const content = [
		"# Auto-generated Dockerfile",
		"FROM " + base,
		"",
		"WORKDIR /app",
		"",
		"COPY . .",
		"",
		"# Ensure the binary exists",
		`RUN test -f ./${binaryName}`,
		"",
		`RUN chmod +x ./${binaryName}`,
		"",
		...(volume ? [`VOLUME ["${volume}"]`, ""] : []),
		"EXPOSE 3000",
		"",
		"# Start the application",
		`CMD ["./${binaryName}"]`,
	].join("\n");
	await writeFile(join(out, "Dockerfile"), content, "utf-8");
}
