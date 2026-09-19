<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		backHref?: string;
		backLabel?: string;
		children?: Snippet;
	}

	let { title, description, backHref, backLabel, children }: Props = $props();
</script>

<article class="documentation-page">
	<header>
		{#if backHref && backLabel}<a class="back-link" href={backHref}>← {backLabel}</a>{/if}
		<h1>{title}</h1>
		{#if description}<p class="description">{description}</p>{/if}
	</header>
	<div class="documentation-content">
		{#if children}{@render children()}{/if}
	</div>
</article>

<style>
	.documentation-page {
		width: min(100%, 48rem);
		margin: 0 auto;
		padding: var(--space-section) var(--space-4);
		color: var(--color-text);
	}

	.documentation-page header {
		margin-bottom: var(--space-section);
		text-align: center;
	}

	.documentation-page h1 {
		margin: var(--space-3) 0 var(--space-2);
		color: var(--color-primary);
	}

	.back-link {
		display: inline-flex;
		min-height: var(--control-min-height);
		align-items: center;
		color: var(--color-primary);
	}

	.description {
		margin: 0;
		color: var(--color-text-light);
	}

	.documentation-content {
		line-height: 1.6;
	}

	.documentation-content :global(h2) {
		margin-top: var(--space-section);
		color: var(--color-primary);
	}

	.documentation-content :global(h2:first-child) {
		margin-top: 0;
	}

	.documentation-content :global(img) {
		max-width: 100%;
		height: auto;
	}
</style>
