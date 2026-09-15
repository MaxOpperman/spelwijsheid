<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<section class="panel {className}">
	{#if children}
		{@render children()}
	{/if}
</section>

<style>
	.panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-panel);
		box-shadow: var(--shadow-panel);
	}
</style>
