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
	let opener: HTMLElement | null = null;

	onMount(() => {
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		dialog?.focus();
		return () => {
			if (opener?.isConnected) {
				opener.focus();
			}
		};
	});

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			onclose?.();
			return;
		}

		if (event.key !== 'Tab') return;
		const focusable = Array.from(
			dialog.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => !element.hasAttribute('disabled'));
		if (focusable.length === 0) {
			event.preventDefault();
			dialog.focus();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

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
		onkeydown={handleKeydown}
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
