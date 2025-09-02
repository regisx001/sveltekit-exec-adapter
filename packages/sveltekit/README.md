# SvelteKit Exec Adapter

A SvelteKit adapter that builds your full-stack web application as a **single executable binary** with zero runtime dependencies.

## How It Works

This adapter transforms your SvelteKit application into a standalone executable by:

1. **Bundling your entire application** - All server-side code, client-side assets, and static files
2. **Compiling to a native binary** - Using Bun's compiler to create a platform-specific executable
3. **Embedding assets** - Static files are embedded directly into the binary (optional)
4. **Preserving SvelteKit features** - SSR, API routes, server hooks, and middleware all work as expected

The result is a single file that contains your entire web application and can run on any compatible system without requiring Node.js, npm, or any other runtime dependencies.

> **Note**: Bun is only used during the build process to compile your application into an executable. The final binary runs independently and does not require Bun to be installed on the target system.

## Requirements

- [Bun](https://bun.com/) installed on your development machine (for building only)

## Installation

```bash
npm install sveltekit-exec-adapter
```

## Usage

Configure the adapter in your SvelteKit config file:

```js
// svelte.config.js
import adapter from "sveltekit-exec-adapter";

export default {
  kit: {
    adapter: adapter({
      // Optional configuration
      out: "dist",
      binaryName: "my-app",
    }),
  },
};
```

Build your application:

```bash
npm run build
```

Run the generated executable:

```bash
./dist/my-app
```

Your SvelteKit application will start and be accessible at `http://localhost:3000` (or your configured port).

## Configuration Options

The adapter accepts the following options:

- **`out`** (string): Output directory for the built binary (default: `"dist"`)
- **`binaryName`** (string): Name of the executable file (default: `"app"`)
- **`embedStatic`** (boolean): Whether to embed static assets in the binary (default: `true`)
- **`target`** (string): Target platform for the binary. Available targets:
  - `linux-x64` (default on Linux)
  - `darwin-x64` (Intel Mac)
  - `darwin-arm64` (Apple Silicon Mac, default on macOS)
  - `windows-x64` (default on Windows)
  - `linux-x64-musl` (Alpine Linux)
  - `linux-arm64-musl` (ARM64 Alpine Linux)
- **`volume`** (string): Volume mount point for persistent storage (optional, useful for self-hosting scenarios, e.g., `"/data"`)

### Example with all options:

```js
import adapter from "sveltekit-exec-adapter";

export default {
  kit: {
    adapter: adapter({
      out: "build",
      binaryName: "my-awesome-app",
      embedStatic: true,
      target: "linux-x64",
      volume: "/data",
    }),
  },
};
```

## Environment Variables

When using environment variables in your SvelteKit application:

- ✅ **Use**: `$env/dynamic/private` for server-side environment variables
- ❌ **Avoid**: `$env/static/private` (these are resolved at build time)

This ensures your executable can read environment variables from the runtime environment where it's deployed.

## Cross-Platform Building

You can build executables for different platforms from any development machine by specifying the `target` option. This is useful for creating distribution packages for multiple operating systems.
