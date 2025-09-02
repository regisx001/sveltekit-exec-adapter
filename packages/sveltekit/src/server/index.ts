// Libs
import { file } from "bun";
import path from "node:path";
import { execPath } from "process";

// @ts-ignore
import { assetMap } from "./assets.generated.ts";

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
    // Track request for graceful shutdown
    const finishRequest = trackRequest(req);

    try {
      // Handle static assets
      const staticResponse = await staticServer.respond(req);
      if (staticResponse) return staticResponse;

      // Handle other routes (SSR, API endpoints, etc.)
      return await svelteKitServer.respond(req, {
        getClientAddress() {
          return bunServer.requestIP(req)?.address || "127.0.0.1";
        },
      });
    } finally {
      // Always finish tracking the request
      finishRequest();
    }
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

console.log(`Listening on http://localhost:${server.port}`);

// Graceful shutdown implementation
let shutdownTimeoutId: Timer | null = null;
let idleTimeoutId: Timer | null = null;
let activeRequests = 0;
const shutdownTimeout = 10; // seconds
const idleTimeout = 30; // seconds (optional idle shutdown)

/**
 * Graceful shutdown handler similar to Node.js adapter
 * @param reason - The reason for shutdown ('SIGINT' | 'SIGTERM' | 'SIGHUP' | 'IDLE')
 */
function gracefulShutdown(reason: string) {
  if (shutdownTimeoutId) {
    console.log("⚠️  Shutdown already in progress...");
    return;
  }

  console.log(`🔄 Received ${reason}, initiating graceful shutdown...`);

  // Stop accepting new connections
  server.stop();
  console.log("🚫 Server stopped accepting new connections");

  // Set a timeout to force exit if graceful shutdown takes too long
  shutdownTimeoutId = setTimeout(() => {
    console.log("⚠️  Graceful shutdown timeout reached, forcing exit");
    process.exit(1);
  }, shutdownTimeout * 1000);

  // Check if we can shutdown immediately (no active requests)
  checkForGracefulExit(reason);
}

/**
 * Check if we can exit gracefully (no active requests)
 */
function checkForGracefulExit(reason: string) {
  if (activeRequests === 0) {
    console.log("✅ All requests completed, shutting down gracefully");

    if (shutdownTimeoutId) {
      clearTimeout(shutdownTimeoutId);
      shutdownTimeoutId = null;
    }
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = null;
    }

    console.log(`🏁 Shutdown completed (reason: ${reason})`);
    process.exit(0);
  } else {
    console.log(
      `🔄 Waiting for ${activeRequests} active request(s) to complete...`
    );
    // Check again in 100ms
    setTimeout(() => checkForGracefulExit(reason), 100);
  }
}

/**
 * Track request lifecycle for graceful shutdown
 */
function trackRequest(req: Request): () => void {
  activeRequests++;

  // Clear idle timeout when we receive a request
  if (idleTimeoutId) {
    clearTimeout(idleTimeoutId);
    idleTimeoutId = null;
  }

  // Return cleanup function
  return () => {
    activeRequests--;

    // If we're shutting down and this was the last request, proceed with shutdown
    if (shutdownTimeoutId && activeRequests === 0) {
      checkForGracefulExit("REQUEST_COMPLETE");
    }

    // Optional: Set idle timeout if no requests are active
    if (activeRequests === 0 && !shutdownTimeoutId && idleTimeout > 0) {
      idleTimeoutId = setTimeout(() => {
        gracefulShutdown("IDLE");
      }, idleTimeout * 1000);
    }
  };
}

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGHUP", () => gracefulShutdown("SIGHUP"));

// Handle uncaught exceptions gracefully
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});
