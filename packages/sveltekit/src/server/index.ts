// Libs
import { file } from "bun";
import path from "node:path";
import { execPath } from "process";
import { $ } from "bun";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// @ts-ignore
import { assetMap } from "./assets.generated.ts";
// @ts-ignore
import { adapterConfig } from "./config.generated.ts";

// Types
import type { Server as ServerType } from "@sveltejs/kit";
import type { SSRManifest } from "@sveltejs/kit";

// Variables
const manifest = await getSvelteKitManifest();
const prerenderedRoutes = await getPrerenderedRoutes(manifest);
const svelteKitServer = await instantiateServer(manifest);
const staticServer = {
  respond: async (req: Request) => {
    const url = new URL(req.url);
    const headers = new Headers({
      "Cache-Control": "max-age=0, must-revalidate",
    });

    if (prerenderedRoutes.includes(url.pathname)) {
      const htmlPath =
        url.pathname === "/" ? "/index.html" : `${url.pathname}.html`;
      const htmlFile = await getFile(htmlPath);
      if (htmlFile) {
        headers.set(
          "Content-Type",
          htmlFile.type || "application/octet-stream"
        );
        return new Response(htmlFile, {
          headers,
        });
      }
    }

    const assetFile = await getFile(url.pathname);
    if (assetFile) {
      if (url.pathname.startsWith(`/${manifest.appDir}/immutable/`))
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Content-Type", assetFile.type || "application/octet-stream");
      return new Response(assetFile, {
        headers,
      });
    }

    return null;
  },
};

async function getSvelteKitManifest() {
  // @ts-ignore
  const manifestModule = await import("../manifest.js");
  const manifest = manifestModule.default;
  return manifest as SSRManifest;
}

async function getPrerenderedRoutes(manifest: SSRManifest) {
  return Array.from(manifest._.prerendered_routes);
}

async function instantiateServer(manifest: SSRManifest) {
  const serverModule = await import("../server/index.js");
  const { Server } = serverModule as {
    Server: new (manifest: SSRManifest) => ServerType;
  };

  const server = new Server(manifest);
  await server.init({ env: Bun.env as Record<string, string> });

  return server;
}

async function getFile(pathname: string) {
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(pathname);
    // Prevent path traversal
    if (decodedPathname.includes("../") || decodedPathname.includes("..\\"))
      return null;
  } catch (error) {
    decodedPathname = pathname;
  }

  // Search in embedded assetMap
  if (assetMap.has(decodedPathname)) return file(assetMap.get(decodedPathname));

  // Search on disk
  const binaryDir = path.dirname(execPath);
  const staticBuildDirs = ["client", "prerendered"];

  for (const dir of staticBuildDirs) {
    const externalFile = file(path.join(binaryDir, dir, decodedPathname));
    if (await externalFile.exists()) return externalFile;
  }
}

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  hostname: "0.0.0.0",
  async fetch(req: Request, bunServer: Bun.Server) {
    // Handle static assets
    const staticResponse = await staticServer.respond(req);
    if (staticResponse) return staticResponse;

    // Handle other routes (SSR, API endpoints, etc.)
    return await svelteKitServer.respond(req, {
      getClientAddress() {
        return bunServer.requestIP(req)?.address || "127.0.0.1";
      },
    });
  },
  error(e: Error) {
    return Response.json(
      {
        code: 500,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  },
});

console.log(
  `${colors.green}${colors.bright}[SERVER]${colors.reset} ${colors.cyan}Listening on ${colors.bright}http://localhost:${server.port}${colors.reset}`
);

// Auto-open browser if enabled in adapter configuration
if (adapterConfig.openBrowser) {
  try {
    if (process.platform === "win32") {
      await $`start http://localhost:${server.port}`;
    } else if (process.platform === "darwin") {
      await $`open http://localhost:${server.port}`;
    } else {
      await $`xdg-open http://localhost:${server.port}`;
    }
    console.log(
      `${colors.blue}${colors.bright}[BROWSER]${colors.reset} ${colors.cyan}Opening ${colors.bright}http://localhost:${server.port}${colors.reset} in default browser`
    );
  } catch (error) {
    console.log(
      `${colors.blue}${colors.bright}[BROWSER]${colors.reset} ${colors.cyan}Could not auto-open browser. Please visit ${colors.bright}http://localhost:${server.port}${colors.reset} manually`
    );
  }
}
