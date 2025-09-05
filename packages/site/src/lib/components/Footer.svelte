<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Github, ExternalLink, Heart, Coffee } from '@lucide/svelte';

	const currentYear = new Date().getFullYear();

	const links = {
		product: [
			{ name: 'Features', href: '#features' },
			{ name: 'Use Cases', href: '#use-cases' },
			{ name: 'Quick Start', href: '#quick-start' },
			{ name: 'Documentation', href: '/docs' }
		],
		resources: [
			{ name: 'GitHub Repository', href: 'https://github.com/regisx001/sveltekit-exec-adapter' },
			{ name: 'Asset Validation Guide', href: '/docs/validation' },
			{ name: 'Examples', href: '/examples' },
			{ name: 'Changelog', href: '/changelog' }
		],
		community: [
			{ name: 'Issues', href: 'https://github.com/regisx001/sveltekit-exec-adapter/issues' },
			{
				name: 'Discussions',
				href: 'https://github.com/regisx001/sveltekit-exec-adapter/discussions'
			},
			{ name: 'Contributing', href: '/contributing' },
			{ name: 'License', href: '/license' }
		]
	};
</script>

<footer class="bg-muted text-muted-foreground">
	<div class="container mx-auto px-4 py-16">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
			<!-- Brand Section -->
			<div class="lg:col-span-2">
				<div class="mb-4 flex items-center space-x-3">
					<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
						<div class="bg-primary-foreground h-4 w-4 rounded-sm"></div>
					</div>
					<div class="text-xl font-bold">
						<span class="text-primary">SvelteKit</span>
						<span class="text-foreground">Exec</span>
					</div>
				</div>
				<p class="mb-6 max-w-md leading-relaxed">
					Transform your SvelteKit applications into standalone executables with zero runtime
					dependencies. Build once, run anywhere.
				</p>

				<!-- Social Links -->
				<div class="flex space-x-3">
					<Button variant="ghost" size="icon" class="hover:text-foreground">
						<Github class="h-5 w-5" />
					</Button>
					<Button variant="ghost" size="icon" class="hover:text-foreground">
						<ExternalLink class="h-5 w-5" />
					</Button>
				</div>
			</div>

			<!-- Product Links -->
			<div>
				<h3 class="text-foreground mb-4 font-semibold">Product</h3>
				<ul class="space-y-2">
					{#each links.product as link}
						<li>
							<a href={link.href} class="hover:text-foreground text-sm transition-colors">
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Resources Links -->
			<div>
				<h3 class="text-foreground mb-4 font-semibold">Resources</h3>
				<ul class="space-y-2">
					{#each links.resources as link}
						<li>
							<a
								href={link.href}
								class="hover:text-foreground flex items-center text-sm transition-colors"
							>
								{link.name}
								{#if link.href.startsWith('http')}
									<ExternalLink class="ml-1 h-3 w-3" />
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Community Links -->
			<div>
				<h3 class="text-foreground mb-4 font-semibold">Community</h3>
				<ul class="space-y-2">
					{#each links.community as link}
						<li>
							<a
								href={link.href}
								class="hover:text-foreground flex items-center text-sm transition-colors"
							>
								{link.name}
								{#if link.href.startsWith('http')}
									<ExternalLink class="ml-1 h-3 w-3" />
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<Separator class="my-8" />

		<!-- Bottom Section -->
		<div class="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
			<div class="flex items-center space-x-4 text-sm">
				<span>© {currentYear} SvelteKit Exec Adapter</span>
				<span>•</span>
				<span>MIT License</span>
				<span>•</span>
				<span>Made with <Heart class="text-destructive inline h-4 w-4" /> by Ezzoubair ZARQI</span>
			</div>

			<div class="flex items-center space-x-4">
				<div class="flex items-center space-x-1 text-sm">
					<span>Powered by</span>
					<Coffee class="h-4 w-4" />
					<span>and</span>
					<span class="text-primary font-semibold">Bun</span>
				</div>

				<div class="bg-destructive/10 text-destructive rounded px-2 py-1 text-xs">
					⚠️ Experimental
				</div>
			</div>
		</div>

		<!-- Credits -->
		<div class="border-border mt-8 border-t pt-8">
			<p class="text-muted-foreground text-center text-xs">
				This project is based on the original work by
				<a href="https://www.hugoduprez.com/" class="text-primary hover:text-primary/80 underline">
					Hugo Duprez
				</a>. Special thanks for the foundational concepts and initial implementation.
			</p>
		</div>
	</div>
</footer>
