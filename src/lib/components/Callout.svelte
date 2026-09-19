<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'info' | 'success' | 'warning' | 'error';
		title?: string;
		children?: Snippet;
	}

	let { tone = 'info', title, children }: Props = $props();
</script>

<aside
	class="callout callout-{tone}"
	role={tone === 'error' || tone === 'warning' ? 'alert' : 'note'}
>
	{#if title}<h2>{title}</h2>{/if}
	{#if children}{@render children()}{/if}
</aside>

<style>
	.callout {
		padding: var(--space-4);
		border: 1px solid var(--color-border);
		border-left: 4px solid var(--color-primary);
		border-radius: var(--radius-control);
		background: var(--color-surface-alt);
		color: var(--color-text);
	}

	.callout h2 {
		margin: 0 0 var(--space-2);
		font-size: 1rem;
	}

	.callout :global(p:last-child) {
		margin-bottom: 0;
	}

	.callout-info {
		border-left-color: var(--color-primary);
	}

	.callout-success {
		border-left-color: var(--color-success);
		background: var(--color-success-bg);
	}

	.callout-warning {
		border-left-color: var(--color-warning);
		background: var(--color-warning-bg);
	}

	.callout-error {
		border-left-color: var(--color-error);
		background: var(--color-error-bg);
	}
</style>
