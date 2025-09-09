<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		ChevronRight,
		Book,
		Zap,
		Package,
		Settings,
		Code,
		FileText,
		Download,
		Github
	} from '@lucide/svelte';
	import { PACKAGE_VERSION } from '$lib/constants';
	import { base } from '$app/paths';

	let { children } = $props();

	const navigation = [
		{
			title: 'Getting Started',
			items: [
				{ name: 'Introduction', href: base + '/docs', icon: Book },
				{ name: 'Installation', href: base + '/docs/installation', icon: Download },
				{ name: 'Quick Start', href: base + '/docs/quick-start', icon: Zap }
			]
		},
		{
			title: 'Configuration',
			items: [
				{ name: 'Adapter Options', href: base + '/docs/configuration', icon: Settings },
				{ name: 'Build Process', href: base + '/docs/build-process', icon: Package },
				{ name: 'Advanced Setup', href: base + '/docs/advanced', icon: Code }
			]
		},
		{
			title: 'Examples',
			items: [
				{ name: 'Basic App', href: base + '/docs/examples/basic', icon: FileText },
				{ name: 'Full-Stack App', href: base + '/docs/examples/full-stack', icon: Code },
				{ name: 'API Server', href: base + '/docs/examples/api-server', icon: Settings }
			]
		}
	];

	let sidebarOpen = $state(false);
</script>

<div class="bg-background min-h-screen">
	<!-- Mobile sidebar backdrop -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-40 bg-black/50 lg:hidden"
			onclick={() => (sidebarOpen = false)}
		></div>
	{/if}

	<!-- Grid Layout Container -->
	<div class="grid min-h-screen lg:grid-cols-[256px_1fr]">
		<!-- Sidebar -->
		<aside
			class="bg-card border-border fixed inset-y-0 left-0 z-50 w-64 transform border-r transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:w-auto lg:translate-x-0 {sidebarOpen
				? 'translate-x-0'
				: '-translate-x-full'}"
		>
			<div class="sticky top-0 flex h-screen flex-col">
				<!-- Header -->
				<div class="border-border border-b p-6">
					<div class="flex items-center justify-between">
						<h2 class="text-foreground text-lg font-semibold">Documentation</h2>
						<Badge variant="outline" class="text-xs">v{PACKAGE_VERSION}</Badge>
					</div>
				</div>

				<!-- Navigation -->
				<nav class="flex-1 space-y-6 overflow-y-auto p-4">
					{#each navigation as section}
						<div>
							<h3 class="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wider">
								{section.title}
							</h3>
							<ul class="space-y-1">
								{#each section.items as item}
									<li>
										<a
											href={item.href}
											class="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
										>
											<item.icon size={16} aria-hidden="true" />
											{item.name}
										</a>
									</li>
								{/each}
							</ul>
						</div>
						{#if section !== navigation[navigation.length - 1]}
							<Separator />
						{/if}
					{/each}
				</nav>

				<!-- Footer -->
				<div class="border-border border-t p-4">
					<Button variant="outline" size="sm" class="w-full justify-start">
						<Github size={16} class="mr-2" aria-hidden="true" />
						View on GitHub
					</Button>
				</div>
			</div>
		</aside>

		<!-- Main content area -->
		<div class="flex min-h-screen flex-col">
			<!-- Mobile header -->
			<header
				class="bg-background/95 border-border sticky top-0 z-30 border-b backdrop-blur lg:hidden"
			>
				<div class="flex h-16 items-center px-4">
					<Button variant="ghost" size="sm" onclick={() => (sidebarOpen = !sidebarOpen)}>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</Button>
					<h1 class="text-foreground ml-4 text-lg font-semibold">Documentation</h1>
				</div>
			</header>

			<!-- Content area -->
			<main class="flex-1">
				<div class="container mx-auto max-w-6xl px-4 py-8 lg:px-8">
					<div class="prose prose-slate dark:prose-invert max-w-none">
						{@render children?.()}
					</div>
				</div>
			</main>
		</div>
	</div>
</div>
