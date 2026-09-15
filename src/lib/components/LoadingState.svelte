<script lang="ts">
	interface Props {
		label: string;
		detail?: string;
	}

	let { label, detail }: Props = $props();
</script>

<div class="loading-state" role="status" aria-live="polite">
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
