<script lang="ts">
	interface Props {
		label: string;
		detail?: string;
		compact?: boolean;
	}

	let { label, detail, compact = false }: Props = $props();
</script>

<div class:compact class="loading-state" role="status" aria-live="polite">
	<div class="spinner" aria-hidden="true"></div>
	<strong>{label}</strong>
	{#if detail}<p>{detail}</p>{/if}
</div>

<style>
	.loading-state {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		padding: var(--space-panel);
		text-align: center;
	}

	.spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-state p {
		margin: 0;
		color: var(--color-text-muted);
	}

	.loading-state.compact {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0;
		text-align: left;
	}

	.loading-state.compact .spinner {
		width: 1.25rem;
		height: 1.25rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>
