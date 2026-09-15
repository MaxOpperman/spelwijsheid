<script lang="ts">
	interface Props {
		value: number;
		label?: string;
	}

	let { value, label = 'Progress' }: Props = $props();
	let clampedValue = $derived(Math.min(100, Math.max(0, value)));
</script>

<div
	class="progress-track"
	role="progressbar"
	aria-label={label}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={clampedValue}
>
	<div class="progress-value" style="width: {clampedValue}%"></div>
</div>

<style>
	.progress-track {
		height: var(--control-progress-height);
		background: var(--color-primary-light);
		border-radius: var(--radius-round);
		overflow: hidden;
	}

	.progress-value {
		height: 100%;
		background: var(--color-accent);
		border-radius: inherit;
		transition: width 0.3s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-value {
			transition: none;
		}
	}
</style>
