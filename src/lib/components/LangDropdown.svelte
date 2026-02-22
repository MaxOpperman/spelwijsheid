<script lang="ts">
	import { locale, LOCALES, type Locale } from '$lib/stores/locale';

	let open = $state(false);
	let current = $derived(LOCALES.find((l) => l.value === $locale) ?? LOCALES[0]);

	function select(value: Locale) {
		locale.set(value);
		open = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="lang-dropdown" class:open>
	<button
		class="lang-trigger"
		onclick={() => (open = !open)}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label="Select language"
		title={current.label}
	>
		<span class="fi fi-{current.countryCode} fis"></span>
		<span class="arrow">▼</span>
	</button>

	{#if open}
		<div class="backdrop" role="presentation" onclick={() => (open = false)}></div>
		<ul class="lang-menu" role="listbox">
			{#each LOCALES as loc (loc.value)}
				<li role="option" aria-selected={loc.value === $locale}>
					<button onclick={() => select(loc.value)} class:active={loc.value === $locale}>
						<span class="fi fi-{loc.countryCode} fis"></span>
						<span class="label">{loc.label}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.lang-dropdown {
		position: relative;
		display: flex;
		align-items: center;
	}

	.lang-trigger {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem 0.35rem;
		border-radius: 6px;
		font-family: inherit;
		transition: background 0.15s;
		color: var(--color-text);
	}

	.lang-trigger:hover {
		background: var(--color-bg-2);
	}

	/* flag-icons overrides */
	:global(.fi.fis) {
		width: 1.4em;
		height: 1.4em;
		border-radius: 50%;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
		flex-shrink: 0;
	}

	.arrow {
		font-size: 0.55rem;
		opacity: 0.6;
		transition: transform 0.2s ease;
	}

	.open .arrow {
		transform: rotate(180deg);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 999;
	}

	.lang-menu {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		background: var(--color-surface);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		padding: 0.4rem 0;
		list-style: none;
		margin: 0;
		z-index: 1000;
		min-width: 160px;
	}

	.lang-menu li {
		height: auto;
	}

	.lang-menu button {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		padding: 0.55rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.85rem;
		color: var(--color-text);
		text-align: left;
		transition: background 0.15s;
	}

	.lang-menu button:hover {
		background: var(--color-bg-2);
	}

	.lang-menu button.active {
		font-weight: 700;
		color: var(--color-primary);
	}

	.label {
		white-space: nowrap;
	}
</style>
