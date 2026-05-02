<script lang="ts">
	import type { PageData } from './$types';
	import GameState from '$lib/components/GameState.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Spelwijze - Spelwijsheid</title>
</svelte:head>

<GameState wordList={data.wordList} locale={data.locale} />
