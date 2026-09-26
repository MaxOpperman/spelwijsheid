<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		detail?: string;
		children?: Snippet;
	}

	let { title, detail, children }: Props = $props();
</script>

<div class="empty-state">
	<strong>{title}</strong>
	{#if detail}<p>{detail}</p>{/if}
	{#if children}{@render children()}{/if}
</div>

<style>
	.empty-state {
		padding: var(--space-panel);
		color: var(--color-text-muted);
		text-align: center;
	}

	.empty-state p {
		margin: 0.5rem 0 0;
	}
</style>
