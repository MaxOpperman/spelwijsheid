<script lang="ts">
	export interface SegmentedOption<T extends string | number = string> {
		value: T;
		label: string;
		disabled?: boolean;
		formAction?: string;
	}

	interface Props<T extends string | number> {
		options: SegmentedOption<T>[];
		value: T;
		label: string;
		name?: string;
		buttonType?: 'button' | 'submit';
		onchange?: (value: T) => void;
	}

	let {
		options,
		value,
		label,
		name,
		buttonType = 'button',
		onchange
	}: Props<string | number> = $props();
</script>

<div class="segmented-control" role="group" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type={buttonType}
			class:selected={option.value === value}
			class="segment"
			aria-pressed={option.value === value}
			aria-label={name ? `${name} ${option.label}` : undefined}
			disabled={option.disabled}
			formaction={option.formAction}
			name={buttonType === 'submit' ? name : undefined}
			value={buttonType === 'submit' ? option.value : undefined}
			onclick={() => onchange?.(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.segmented-control {
		display: inline-flex;
		gap: var(--space-1);
		max-width: 100%;
		padding: var(--space-1);
		background: var(--color-surface-alt);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
	}

	.segment {
		min-width: var(--control-height);
		min-height: var(--control-height);
		padding: var(--space-2) var(--space-3);
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.segment:hover:not(:disabled) {
		background: var(--color-bg-0);
	}

	.segment.selected {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-on-primary);
	}

	.segment:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	@media (max-width: 480px) {
		.segment {
			padding-inline: var(--space-2);
		}
	}
</style>
