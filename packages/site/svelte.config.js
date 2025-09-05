import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter(),
		paths: {
			base: process.env.BASE_URL || ''
		},
		prerender: {
			handleMissingId: 'ignore', // or 'warn' to see it without failing
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore 404s for favicon and other assets
				if (path === '/favicon.png' || path.startsWith('/favicon')) {
					return;
				}
				// Log other errors
				console.warn(`${message} (${path} referenced by ${referrer})`);
			},
			entries: [
				'*' // Include all routes by default
				// Dynamic routes will be handled by their individual entries functions
			]
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
