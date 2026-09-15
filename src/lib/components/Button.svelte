<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		variant?: 'primary' | 'secondary' | 'ghost';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		ariaLabel?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		children,
		variant = 'primary',
		type = 'button',
		disabled = false,
		ariaLabel,
		onclick
	}: Props = $props();
</script>

<button class="button button-{variant}" {type} {disabled} aria-label={ariaLabel} {onclick}>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.button {
		min-height: var(--control-height);
		padding: 0.5rem 1rem;
		border: 1px solid transparent;
		border-radius: var(--radius-control);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.button-primary {
		background: var(--color-primary);
		color: var(--color-on-primary);
	}

	.button-primary:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.button-secondary {
		background: var(--color-surface);
		border-color: var(--color-border-strong);
		color: var(--color-text);
	}

	.button-secondary:hover:not(:disabled),
	.button-ghost:hover:not(:disabled) {
		background: var(--color-bg-0);
	}

	.button-ghost {
		background: transparent;
		color: var(--color-text);
	}

	.button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
</style>
