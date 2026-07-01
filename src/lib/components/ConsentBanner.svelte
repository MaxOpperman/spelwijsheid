<script lang="ts">
	import { onMount } from 'svelte';
	import { consent, saveConsent } from '$lib/stores/consent';
	import { t } from '$lib/i18n';

	let visible = $derived(!$consent.decided);

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	function acceptAll() {
		saveConsent(true);
	}

	function essentialOnly() {
		saveConsent(false);
	}
</script>

{#if mounted && visible}
	<div class="consent-banner" role="dialog" aria-live="polite" aria-label={$t('consent.title')}>
		<div class="consent-content">
			<h2>{$t('consent.title')}</h2>
			<p>{$t('consent.message')}</p>
		</div>
		<div class="consent-actions">
			<button class="btn btn-secondary" onclick={essentialOnly}>
				{$t('consent.essentialOnly')}
			</button>
			<button class="btn btn-primary" onclick={acceptAll}>
				{$t('consent.acceptAll')}
			</button>
		</div>
	</div>
{/if}

<style>
	.consent-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: #ffffff;
		color: #1a1a1a;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
	}

	:global(.dark) .consent-banner {
		background: #16213e;
		color: #f0f0f0;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.consent-content {
		flex: 1 1 320px;
		min-width: 0;
	}

	.consent-content h2 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
	}

	.consent-content p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.consent-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.btn-primary {
		background: #ff3e00;
		color: #ffffff;
	}

	.btn-primary:hover {
		background: #e63600;
	}

	.btn-secondary {
		background: transparent;
		color: inherit;
		border-color: currentColor;
	}

	.btn-secondary:hover {
		background: rgba(127, 127, 127, 0.15);
	}
</style>
