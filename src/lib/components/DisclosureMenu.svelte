<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		children?: Snippet;
		open?: boolean;
	}

	let { label, children, open = false }: Props = $props();
</script>

<details {open} class="disclosure-menu">
	<summary>{label}</summary>
	<div class="disclosure-content">
		{#if children}{@render children()}{/if}
	</div>
</details>

<style>
	.disclosure-menu {
		position: relative;
	}

	summary {
		min-height: var(--control-min-height);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-control);
		color: var(--color-text);
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary::after {
		content: '▾';
		margin-left: var(--space-2);
	}

	.disclosure-menu[open] summary::after {
		content: '▴';
	}

	summary:hover {
		background: var(--color-bg-0);
	}

	.disclosure-content {
		position: absolute;
		top: calc(100% + var(--space-1));
		left: 0;
		z-index: var(--layer-navigation);
		min-width: 12rem;
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: var(--color-surface);
		box-shadow: var(--shadow-menu);
	}
</style>
