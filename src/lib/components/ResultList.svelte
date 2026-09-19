<script lang="ts" generics="T extends { id: string | number }">
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		item: Snippet<[T]>;
		empty?: Snippet;
		selectable?: boolean;
		selectedIds?: (string | number)[];
		onselect?: (item: T) => void;
	}

	let { items, item, empty, selectable = false, selectedIds = [], onselect }: Props = $props();
</script>

{#if items.length > 0}
	<div class="result-list" class:selectable>
		{#each items as result (result.id)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="result-item"
				class:selected={selectedIds.includes(result.id)}
				role={selectable ? 'button' : undefined}
				tabindex={selectable ? 0 : undefined}
				aria-pressed={selectable ? selectedIds.includes(result.id) : undefined}
				onclick={() => selectable && onselect?.(result)}
				onkeydown={(event) => {
					if (selectable && (event.key === 'Enter' || event.key === ' ')) {
						event.preventDefault();
						onselect?.(result);
					}
				}}
			>
				{@render item(result)}
			</div>
		{/each}
	</div>
{:else if empty}
	<div class="result-empty">{@render empty()}</div>
{/if}

<style>
	.result-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: var(--space-2);
	}

	.result-item {
		min-width: 0;
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.result-list.selectable .result-item {
		cursor: pointer;
	}

	.result-list.selectable .result-item:hover,
	.result-item.selected {
		border-color: var(--color-primary);
		background: var(--color-primary-soft);
	}

	.result-empty {
		padding: var(--space-4);
		color: var(--color-text-muted);
		text-align: center;
	}
</style>
