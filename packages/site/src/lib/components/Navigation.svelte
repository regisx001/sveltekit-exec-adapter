<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Github, ExternalLink, Menu, X } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import favicon from '$lib/assets/favicon.png';
	import { base } from '$app/paths';
	import { GITHUB_URL, PACKAGE_VERSION } from '$lib/constants';

	let mobileMenuOpen = $state(false);

	const navigation = [
		{ name: 'Features', href: '#features' },
		{ name: 'Use Cases', href: '#use-cases' },
		{ name: 'Quick Start', href: '#quick-start' },
		{ name: 'Docs', href: base + '/docs' }
	];
</script>

<nav
	class="border-border bg-background/80 fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-sm"
>
	<div class="container mx-auto px-4">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex items-center space-x-3">
				<img src="{base}/favicon.png" width="80" alt="" />
				<div class="text-lg font-bold">
					<span class="text-primary">SvelteKit</span>
					<span class="text-foreground">Exec</span>
				</div>
				<Badge variant="outline" class="hidden text-xs sm:inline-flex">v{PACKAGE_VERSION}</Badge>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden items-center space-x-8 md:flex">
				{#each navigation as item}
					<a
						href={item.href}
						class="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
					>
						{item.name}
					</a>
				{/each}
			</div>

			<!-- Actions -->
			<div class="flex items-center space-x-3">
				<Button
					href={GITHUB_URL}
					target="_blank"
					variant="ghost"
					size="sm"
					class="hidden sm:inline-flex"
				>
					<Github class="mr-2 h-4 w-4" />
					GitHub
				</Button>
				<Button size="sm" href={base + '/docs/quick-start/'} class="hidden sm:inline-flex">
					Get Started
					<ExternalLink class="ml-1 h-3 w-3" />
				</Button>

				<!-- Mobile menu button -->
				<Button
					variant="ghost"
					size="icon"
					class="md:hidden"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				>
					{#if mobileMenuOpen}
						<X class="h-5 w-5" />
					{:else}
						<Menu class="h-5 w-5" />
					{/if}
				</Button>
			</div>
		</div>

		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="border-border border-t py-4 md:hidden">
				<div class="space-y-3">
					{#each navigation as item}
						<a
							href={item.href}
							class="text-muted-foreground hover:text-primary block py-2 text-sm font-medium transition-colors"
							onclick={() => (mobileMenuOpen = false)}
						>
							{item.name}
						</a>
					{/each}
					<div class="border-border space-y-2 border-t pt-3">
						<Button
							href={GITHUB_URL}
							target="_blank"
							variant="ghost"
							size="sm"
							class="hidden sm:inline-flex"
						>
							<Github class="mr-2 h-4 w-4" />
							GitHub
						</Button>
						<Button href={base + '/docs/quick-start/'} size="sm" class="w-full">
							Get Started
							<ExternalLink class="ml-1 h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</nav>
