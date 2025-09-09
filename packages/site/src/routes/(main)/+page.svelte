<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Download,
		Zap,
		Shield,
		Globe,
		Code,
		Server,
		Package,
		CheckCircle,
		ArrowRight,
		Github,
		ExternalLink,
		Terminal,
		Binary,
		Rocket,
		Lock,
		FileText,
		Cpu,
		X,
		AlertTriangle
	} from '@lucide/svelte';
	import { base } from '$app/paths';
	import { GITHUB_URL } from '$lib/constants';

	const features = [
		{
			icon: Binary,
			title: 'Single Binary Executable',
			description:
				'Transform your SvelteKit app into a standalone executable with zero runtime dependencies.'
		},
		{
			icon: Server,
			title: 'Full-Stack Preservation',
			description:
				'Keep all SvelteKit features: SSR, API routes, server hooks, and middleware work perfectly.'
		},
		{
			icon: Zap,
			title: 'Lightning Fast',
			description: "Built on Bun's high-performance runtime for maximum speed and efficiency."
		},
		{
			icon: Globe,
			title: 'Cross-Platform',
			description: 'Build for Linux, macOS, Windows (x64/ARM64) from any development machine.'
		},
		{
			icon: Shield,
			title: 'Asset Validation',
			description: 'Comprehensive validation ensures build reliability and optimizes binary size.'
		},
		{
			icon: Package,
			title: 'Smart Asset Embedding',
			description:
				'Automatically embed static files or serve externally - you choose what works best.'
		}
	];

	const useCases = [
		{
			icon: Code,
			title: 'Open Source Tools',
			description: 'Users can run your tools without Docker, Node.js, or complex setup procedures.',
			example: 'CLI tools, development utilities, code generators'
		},
		{
			icon: Lock,
			title: 'Commercial Software',
			description: 'Sell self-hosted software as one-time purchases with simple deployment.',
			example: 'SaaS alternatives, business tools, analytics dashboards'
		},
		{
			icon: Shield,
			title: 'Privacy-Focused Apps',
			description: 'Applications that prioritize local data ownership and offline capability.',
			example: 'Personal dashboards, local-first apps, offline tools'
		},
		{
			icon: Rocket,
			title: 'Demos & Trials',
			description: 'Easy distribution of trial software and product demonstrations.',
			example: 'MVP demos, proof-of-concepts, customer trials'
		}
	];

	const stats = [
		{ label: 'Zero Dependencies', value: '0', suffix: '' },
		{ label: 'Build Time', value: '<5', suffix: 'min' },
		{ label: 'Binary Size', value: '10-50', suffix: 'MB' },
		{ label: 'Startup Time', value: '<1', suffix: 'sec' }
	];

	let currentFeature = 0;

	// Auto-rotate features every 4 seconds
	if (typeof window !== 'undefined') {
		setInterval(() => {
			currentFeature = (currentFeature + 1) % features.length;
		}, 4000);
	}
</script>

<svelte:head>
	<title>SvelteKit Exec Adapter - Build Standalone Executables</title>
	<meta
		name="description"
		content="Transform your SvelteKit application into a single executable binary with zero runtime dependencies. Preserve all server-side features while creating truly portable applications."
	/>
</svelte:head>

<!-- Hero Section -->
<section
	class="from-background via-muted/50 to-background relative flex min-h-screen items-center justify-center bg-gradient-to-br"
>
	<div class="bg-grid-pattern absolute inset-0 opacity-5"></div>
	<div class="container relative z-10 mx-auto px-4 py-20">
		<div class="mx-auto max-w-4xl text-center">
			<!-- Status Badge -->
			<Badge variant="outline" class="bg-background/50 mb-6 text-sm font-medium backdrop-blur-sm">
				<Zap class="mr-1 h-3 w-3" />
				Experimental - Active Development
			</Badge>

			<!-- Main Heading -->
			<h1
				class="from-primary via-primary/80 to-primary/60 mb-6 bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent md:text-7xl"
			>
				SvelteKit
				<span class="block">Exec Adapter</span>
			</h1>

			<!-- Subtitle -->
			<p class="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl leading-relaxed md:text-2xl">
				Transform your full-stack SvelteKit application into a
				<span class="text-primary font-semibold">single executable binary</span>
				with zero runtime dependencies.
			</p>

			<!-- Key Benefits -->
			<div class="mb-10 flex flex-wrap justify-center gap-4">
				<Badge variant="secondary" class="px-4 py-2 text-sm">
					<CheckCircle class="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
					Full SSR Support
				</Badge>
				<Badge variant="secondary" class="px-4 py-2 text-sm">
					<CheckCircle class="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
					API Routes
				</Badge>
				<Badge variant="secondary" class="px-4 py-2 text-sm">
					<CheckCircle class="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
					Cross-Platform
				</Badge>
				<Badge variant="secondary" class="px-4 py-2 text-sm">
					<CheckCircle class="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
					Asset Validation
				</Badge>
			</div>

			<!-- CTA Buttons -->
			<div class="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
				<Button href={base + '/docs'} size="lg" class="h-auto px-8 py-4 text-lg">
					<Download class="mr-2 h-5 w-5" />
					Get Started
					<ArrowRight class="ml-2 h-5 w-5" />
				</Button>
				<Button
					href={GITHUB_URL}
					target="_blank"
					variant="outline"
					size="lg"
					class="h-auto px-8 py-4 text-lg"
				>
					<Github class="mr-2 h-5 w-5" />
					View on GitHub
					<ExternalLink class="ml-2 h-4 w-4" />
				</Button>
			</div>

			<!-- Quick Stats -->
			<div class="mx-auto grid max-w-2xl grid-cols-2 gap-6 md:grid-cols-4">
				{#each stats as stat}
					<div class="text-center">
						<div class="text-primary text-2xl font-bold md:text-3xl">
							{stat.value}<span class="text-sm">{stat.suffix}</span>
						</div>
						<div class="text-muted-foreground text-sm">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Problem Statement -->
<section class="bg-background py-20">
	<div class="container mx-auto px-4">
		<div class="mx-auto mb-16 max-w-4xl text-center">
			<h2 class="mb-6 text-3xl font-bold md:text-4xl">Why Traditional Deployment Falls Short</h2>
			<p class="text-muted-foreground mb-12 text-lg">
				Most standalone approaches force you to choose between functionality and simplicity.
			</p>

			<div class="grid gap-8 md:grid-cols-3">
				<Card class="border-destructive/20 p-6">
					<CardHeader class="pb-4">
						<div
							class="bg-destructive/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
						>
							<Terminal class="text-destructive h-6 w-6" />
						</div>
						<CardTitle class="text-lg">SPA + Native Backend</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-muted-foreground space-y-2 text-sm">
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Lose SvelteKit's server features</span>
							</div>
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Requires separate API development</span>
							</div>
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Complex deployment process</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="border-destructive/20 p-6">
					<CardHeader class="pb-4">
						<div
							class="bg-destructive/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
						>
							<Package class="text-destructive h-6 w-6" />
						</div>
						<CardTitle class="text-lg">Docker Containers</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-muted-foreground space-y-2 text-sm">
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Requires Docker installation</span>
							</div>
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Complex for end users</span>
							</div>
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Large image sizes</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="border-destructive/20 p-6">
					<CardHeader class="pb-4">
						<div
							class="bg-destructive/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
						>
							<Cpu class="text-destructive h-6 w-6" />
						</div>
						<CardTitle class="text-lg">Desktop Apps</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-muted-foreground space-y-2 text-sm">
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Can't deploy to web</span>
							</div>
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>Platform-specific builds</span>
							</div>
							<div class="flex items-center gap-2">
								<X class="text-destructive h-4 w-4" />
								<span>App store restrictions</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Solution -->
		<div class="mx-auto max-w-4xl text-center">
			<div class="border-primary/20 bg-primary/5 rounded-2xl border p-8">
				<div
					class="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
				>
					<CheckCircle class="text-primary h-8 w-8" />
				</div>
				<h3 class="mb-4 text-2xl font-bold">SvelteKit Exec Adapter Solution</h3>
				<div class="text-muted-foreground mb-6 space-y-3 text-lg">
					<div class="flex items-center justify-center gap-3">
						<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
						<strong>Full SvelteKit capabilities preserved</strong>
					</div>
					<div class="flex items-center justify-center gap-3">
						<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
						<strong>Single binary, no runtime dependencies</strong>
					</div>
					<div class="flex items-center justify-center gap-3">
						<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
						<strong>Cross-platform executable</strong>
					</div>
					<div class="flex items-center justify-center gap-3">
						<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
						<strong>Runs anywhere: locally or on cloud machines</strong>
					</div>
				</div>
				<Button class="mt-4">
					Learn How It Works
					<ArrowRight class="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section id="features" class="bg-gray-50 py-20 dark:bg-gray-900">
	<div class="container mx-auto px-4">
		<div class="mx-auto mb-16 max-w-4xl text-center">
			<h2 class="mb-6 text-3xl font-bold md:text-4xl">Powerful Features</h2>
			<p class="text-lg text-gray-600 dark:text-gray-300">
				Everything you need to build and distribute standalone SvelteKit applications.
			</p>
		</div>

		<div class="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each features as feature, i}
				<Card
					class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg {i ===
					currentFeature
						? 'bg-primary/5 ring-primary ring-2'
						: ''}"
				>
					<CardHeader>
						<div
							class="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
						>
							<svelte:component this={feature.icon} class="text-primary h-6 w-6" />
						</div>
						<CardTitle>{feature.title}</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription class="text-sm leading-relaxed">
							{feature.description}
						</CardDescription>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Use Cases Section -->
<section id="use-cases" class="bg-background py-20">
	<div class="container mx-auto px-4">
		<div class="mx-auto mb-16 max-w-4xl text-center">
			<h2 class="mb-6 text-3xl font-bold md:text-4xl">Perfect For</h2>
			<p class="text-muted-foreground text-lg">
				Ideal for various types of applications that need simple deployment and distribution.
			</p>
		</div>

		<div class="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
			{#each useCases as useCase}
				<Card class="group transition-all duration-300 hover:shadow-lg">
					<CardHeader>
						<div class="flex items-start gap-4">
							<div
								class="bg-accent flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
							>
								<svelte:component this={useCase.icon} class="text-accent-foreground h-6 w-6" />
							</div>
							<div class="flex-1">
								<CardTitle class="mb-2 text-xl">{useCase.title}</CardTitle>
								<CardDescription class="mb-4 text-sm leading-relaxed">
									{useCase.description}
								</CardDescription>
								<div class="text-muted-foreground text-xs italic">
									Examples: {useCase.example}
								</div>
							</div>
						</div>
					</CardHeader>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Quick Start Section -->
<section id="quick-start" class="bg-muted/50 py-20">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-4xl">
			<div class="mb-16 text-center">
				<h2 class="mb-6 text-3xl font-bold md:text-4xl">Get Started in Minutes</h2>
				<p class="text-muted-foreground text-lg">
					Transform your existing SvelteKit app into a standalone executable with just a few lines
					of configuration.
				</p>
			</div>

			<div class="grid items-center gap-12 lg:grid-cols-2">
				<!-- Steps -->
				<div class="space-y-6">
					<div class="flex gap-4">
						<div
							class="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
						>
							1
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Install the Adapter</h3>
							<p class="text-muted-foreground text-sm">
								Add the adapter to your SvelteKit project with npm or your preferred package
								manager.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div
							class="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
						>
							2
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Configure Your Project</h3>
							<p class="text-muted-foreground text-sm">
								Update your svelte.config.js with the adapter and your preferred settings.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div
							class="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
						>
							3
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Build Your Executable</h3>
							<p class="text-muted-foreground text-sm">
								Run the build command and get a single binary file ready for distribution.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div
							class="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
						>
							<CheckCircle size={16} />
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Deploy Anywhere</h3>
							<p class="text-muted-foreground text-sm">
								Your executable runs on any compatible system without requiring Node.js or other
								dependencies.
							</p>
						</div>
					</div>
				</div>

				<!-- Code Example -->
				<Card class="bg-card border p-6 font-mono text-sm">
					<CardContent class="p-0">
						<div class="space-y-4">
							<div>
								<div class="text-muted-foreground mb-1"># Install the adapter</div>
								<div class="text-primary">npm install sveltekit-exec-adapter</div>
							</div>

							<Separator />

							<div>
								<div class="text-muted-foreground mb-1">// svelte.config.js</div>
								<div class="space-y-1">
									<div>
										<span class="text-primary">import</span> adapter
										<span class="text-primary">from</span>
										<span class="text-accent-foreground">"sveltekit-exec-adapter"</span>;
									</div>
									<div class="mt-2"><span class="text-primary">export default</span> &#123;</div>
									<div class="ml-2">kit: &#123;</div>
									<div class="ml-4">adapter: adapter(&#123;</div>
									<div class="ml-6">
										binaryName: <span class="text-accent-foreground">"my-app"</span>,
									</div>
									<div class="ml-6">embedStatic: <span class="text-primary">true</span></div>
									<div class="ml-4">&#125;)</div>
									<div class="ml-2">&#125;</div>
									<div>&#125;;</div>
								</div>
							</div>

							<Separator />

							<div>
								<div class="text-muted-foreground mb-1"># Build your app</div>
								<div class="text-primary">npm run build</div>
								<div class="text-muted-foreground mt-2"># Run the executable</div>
								<div class="text-primary">./dist/my-app</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="mt-12 text-center">
				<Button href={base + '/docs'} size="lg" class="mr-4">
					<FileText class="mr-2 h-5 w-5" />
					Read the Docs
				</Button>
				<Button href={base + 'docs/examples/basic'} variant="outline" size="lg">
					<Github class="mr-2 h-5 w-5" />
					View Examples
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-primary text-primary-foreground py-20">
	<div class="container mx-auto px-4 text-center">
		<div class="mx-auto max-w-3xl">
			<h2 class="mb-6 text-3xl font-bold md:text-4xl">Ready to Build Standalone Applications?</h2>
			<p class="mb-8 text-xl opacity-90">
				Join developers who are already using SvelteKit Exec Adapter to create portable,
				self-contained applications.
			</p>

			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<Button
					href={base + '/docs'}
					size="lg"
					variant="secondary"
					class="h-auto px-8 py-4 text-lg"
				>
					<Download class="mr-2 h-5 w-5" />
					Get Started Now
				</Button>
				<Button
					href={GITHUB_URL}
					target="_blank"
					size="lg"
					variant="outline"
					class="border-primary-foreground bg-primary-foreground text-primary h-auto px-8 py-4 text-lg"
				>
					<Github class="mr-2 h-5 w-5" />
					Star on GitHub
				</Button>
			</div>

			<div class="border-primary-foreground/20 mt-12 border-t pt-12">
				<div class="flex items-center justify-center gap-2 text-sm opacity-75">
					<AlertTriangle class="h-4 w-4" />
					<span
						><strong>Experimental Project:</strong> This adapter is currently under active development.
						Use with caution in production environments.</span
					>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.bg-grid-pattern {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
		background-size: 20px 20px;
	}

	:global(.dark) .bg-grid-pattern {
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
	}
</style>
