<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface DefinitionRow {
		term: string;
		value: string;
	}

	interface Props {
		title?: string;
		rows?: DefinitionRow[];
		children?: Snippet;
	}

	let { title, rows = [], children }: Props = $props();
</script>

<section class="definition-section">
	{#if title}<h2>{title}</h2>{/if}
	<dl>
		{#each rows as row (row.term)}
			<div class="definition-row">
				<dt>{row.term}</dt>
				<dd>{row.value}</dd>
			</div>
		{/each}
		{#if children}{@render children()}{/if}
	</dl>
</section>

<style>
	.definition-section {
		padding: var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-panel);
		background: var(--color-surface);
	}

	.definition-section h2 {
		margin: 0 0 var(--space-3);
		font-size: 1.1rem;
		color: var(--color-primary);
	}

	dl {
		display: grid;
		gap: var(--space-2);
		margin: 0;
	}

	.definition-row {
		display: grid;
		grid-template-columns: minmax(9rem, 1fr) 2fr;
		gap: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	.definition-row:last-child {
		padding-bottom: 0;
		border-bottom: 0;
	}

	dt {
		color: var(--color-text-muted);
		font-weight: 600;
	}

	dd {
		margin: 0;
		color: var(--color-text);
		word-break: break-word;
	}

	@media (max-width: 600px) {
		.definition-row {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
