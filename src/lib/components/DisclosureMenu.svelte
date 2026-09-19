<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		children?: Snippet;
		open?: boolean;
		onToggle?: (open: boolean) => void;
		closeOnOutsideClick?: boolean;
	}

	let {
		label,
		children,
		open = $bindable(false),
		onToggle,
		closeOnOutsideClick = true
	}: Props = $props();
	let details: HTMLDetailsElement | undefined;
	let summary: HTMLElement | undefined;
	let opener: HTMLElement | null = null;

	function restoreFocus(): void {
		if (opener?.isConnected) {
			opener.focus();
		} else {
			summary?.focus();
		}
		opener = null;
	}

	function setOpen(next: boolean): void {
		if (open === next) return;
		open = next;
		onToggle?.(next);
		if (next) {
			opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		} else {
			restoreFocus();
		}
	}

	function handleToggle(): void {
		setOpen(details?.open ?? false);
	}

	function handleWindowClick(event: MouseEvent): void {
		if (!open || !closeOnOutsideClick) return;
		if (details && event.target instanceof Node && !details.contains(event.target)) {
			setOpen(false);
		}
	}

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && open) {
			event.preventDefault();
			setOpen(false);
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

<details bind:this={details} {open} class="disclosure-menu" ontoggle={handleToggle}>
	<summary bind:this={summary} aria-expanded={open}>{label}</summary>
	<div class="disclosure-content">
		{#if children}{@render children()}{/if}
	</div>
</details>

<style>
	.disclosure-menu {
		position: relative;
	}

	summary {
		min-height: var(--control-min-height);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-control);
		color: var(--color-text);
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary::after {
		content: '▾';
		margin-left: var(--space-2);
	}

	.disclosure-menu[open] summary::after {
		content: '▴';
	}

	summary:hover {
		background: var(--color-bg-0);
	}

	.disclosure-content {
		position: absolute;
		top: calc(100% + var(--space-1));
		left: 0;
		z-index: var(--layer-navigation);
		min-width: 12rem;
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: var(--color-surface);
		box-shadow: var(--shadow-menu);
	}
</style>
