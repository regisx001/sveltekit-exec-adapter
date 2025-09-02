# SvelteKit Exec Adapter

> ⚠️ **Experimental Project**: This adapter is currently under active development and testing. Use with caution in production environments.

A SvelteKit adapter that builds your full-stack web application as a **single executable binary** with zero runtime dependencies.

Unlike static builds that strip away server capabilities, this adapter preserves **all server-side features** of SvelteKit: SSR, API endpoints, server middleware, server-side authentication, and more.

## Why Use This Adapter?

**Traditional standalone software approaches lose functionality:**

- SPA builds + Rust/Go → Lose SvelteKit's server features (SSR, API routes, etc.)
- Desktop apps → Can't be deployed to the web
- Docker → Requires Docker installation and container management

**With this SvelteKit adapter:**

- ✅ Full SvelteKit capabilities preserved
- ✅ Single binary, no runtime dependencies
- ✅ Cross-platform executable
- ✅ Runs anywhere: locally or on cloud machines

## Perfect For

- **Open-source tools** users can run without Docker/Node.js
- **Commercial software** sold as one-time purchase for self-hosting
- **Privacy-focused apps** prioritizing local data ownership
- **Demos** for users to try before purchasing
- **Portable applications** that need to run without installation

Examples: AI chat apps, project management tools, content management systems, web analytics dashboards...

## Installation

Requires [Bun](https://bun.com/) installed on your machine to build the executable.

```bash
npm install @jesterkit/exe-sveltekit
```

## Usage

```js
// svelte.config.js
import adapter from "@jesterkit/exe-sveltekit";

export default {
  kit: {
    adapter: adapter({
      binaryName: "my-app",
      // Additional options...
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

Your SvelteKit app will run at `http://localhost:3000` with **full server capabilities**.

## Configuration Options

The adapter accepts various configuration options. Check the [detailed documentation](./packages/sveltekit/README.md) for complete configuration details.

## Deployment

🎁 **Bonus**: When targeting `linux-x64`, a Dockerfile is automatically generated, enabling easy deployment with services like Fly.io:

```bash
fly launch
```

## Contributing

This project is under active development. Contributions, bug reports, and feature requests are welcome!

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Credits

This project is based on the original work by [Hugo Duprez](https://www.hugoduprez.com/). Special thanks for the foundational concepts and initial implementation.
