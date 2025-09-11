import adapter from 'sveltekit-exec-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			binaryName: 'test-example',
			windows: {
				hideConsole: false,
				iconPath: './static/app-icon.png', // Make sure this file exists!
				meta: {
					title: 'My Awesome SvelteKit App',
					publisher: 'Your Company Name',
					version: '1.2.3',
					description: 'A test application built with SvelteKit Exec Adapter',
					copyright: '© 2025 Your Company. All rights reserved.'
				}
			}
		})
	}
};

export default config;
