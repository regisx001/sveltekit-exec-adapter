<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<Navigation />

<main class="">
	{@render children?.()}
</main>

<Footer />
