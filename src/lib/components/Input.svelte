<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		value?: string;
		label?: string;
		ariaLabel?: string;
		name?: string;
		type?: 'text' | 'search' | 'email' | 'number';
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		disabled?: boolean;
		required?: boolean;
		error?: string;
		onkeydown?: (event: KeyboardEvent) => void;
		oninput?: (event: Event) => void;
	}

	let {
		value = $bindable(''),
		label,
		ariaLabel,
		name,
		type = 'text',
		placeholder,
		autocomplete,
		disabled = false,
		required = false,
		error,
		onkeydown,
		oninput
	}: Props = $props();

	let inputId = `input-${Math.random().toString(36).slice(2)}`;
	let errorId = `${inputId}-error`;
</script>

<div class:error class="input-field">
	{#if label}
		<label for={inputId}>{label}</label>
	{/if}
	<input
		id={inputId}
		{name}
		{type}
		bind:value
		{placeholder}
		{autocomplete}
		{disabled}
		{required}
		aria-label={label ? undefined : ariaLabel}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? errorId : undefined}
		{onkeydown}
		{oninput}
	/>
	{#if error}
		<p id={errorId} class="error-message" role="alert">{error}</p>
	{/if}
</div>

<style>
	.input-field {
		display: grid;
		gap: var(--space-2);
		min-width: 0;
	}

	.input-field label {
		color: var(--color-text);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.input-field input {
		width: 100%;
		min-height: var(--control-height);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-control);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.input-field input::placeholder {
		color: var(--color-text-muted);
	}

	.input-field input:focus-visible {
		border-color: var(--color-primary);
	}

	.input-field input:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.input-field.error input {
		border-color: var(--color-error);
	}

	.error-message {
		margin: 0;
		color: var(--color-error);
		font-size: 0.875rem;
	}
</style>
