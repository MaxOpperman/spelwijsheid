<script lang="ts">
	import type { PageData } from './$types';
	import GameState from '$lib/components/GameState.svelte';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;

	/** Reload page data whenever the locale changes so the correct word list and game state are used */
	onMount(() => {
		let initialised = false;
		const unsubscribe = locale.subscribe(() => {
			if (!initialised) {
				initialised = true;
				return;
			}
			invalidateAll();
		});
		return unsubscribe;
	});
</script>

<svelte:head>
	<title>Spelwijze - Spelwijsheid</title>
</svelte:head>

{#key data.locale}
	<GameState wordList={data.wordList} locale={data.locale} />
{/key}
