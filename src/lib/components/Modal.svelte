<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children?: Snippet;
		onclose?: () => void;
	}

	let { title, children, onclose }: Props = $props();
	let dialog: HTMLDivElement;

	onMount(() => {
		dialog?.focus();
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose?.();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="modal-backdrop"
	role="presentation"
	onclick={(event) => event.target === event.currentTarget && onclose?.()}
>
	<div
		bind:this={dialog}
		class="modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<h2 id="modal-title">{title}</h2>
		{#if children}{@render children()}{/if}
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: var(--color-overlay);
		z-index: var(--layer-modal);
	}

	.modal {
		width: min(100%, 28rem);
		padding: var(--space-panel);
		background: var(--color-surface);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-overlay);
		box-shadow: var(--shadow-modal);
		text-align: center;
	}

	.modal h2 {
		margin-top: 0;
	}
</style>
