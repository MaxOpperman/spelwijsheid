<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		status?: string;
		children?: Snippet;
	}

	let { status, children }: Props = $props();
</script>

<div class="inline-form-row">
	<div class="form-control">
		{#if children}{@render children()}{/if}
	</div>
	{#if status}<span class="form-status">{status}</span>{/if}
</div>

<style>
	.inline-form-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-width: 0;
	}

	.form-control {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 1;
		min-width: 0;
	}

	.form-status {
		flex: 0 0 auto;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.inline-form-row {
			align-items: stretch;
			flex-direction: column;
		}

		.form-control {
			width: 100%;
		}
	}
</style>
