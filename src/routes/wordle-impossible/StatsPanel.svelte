<script lang="ts">
	import StatsPanel from '$lib/components/StatsPanel.svelte';
	import type { ImpossibleWordleStats } from './stats.ts';
	import { formatTime, getAverageTime } from './stats.ts';
	import { t } from '$lib/i18n';

	interface Props {
		stats: ImpossibleWordleStats;
	}

	let { stats }: Props = $props();
	const averageTime = $derived(getAverageTime(stats));
	const distribution = $derived(
		Object.entries(stats.guessDistribution || {})
			.map(([label, value]) => ({ label, value }))
			.sort((a, b) => Number(a.label) - Number(b.label))
	);
</script>

<StatsPanel
	title={$t('wordleImpossible.stats')}
	metrics={[
		{ value: stats.gamesPlayed, label: $t('wordleImpossible.played') },
		{ value: stats.totalCorrectGuesses, label: $t('wordleImpossible.correct') },
		{ value: formatTime(stats.bestTime), label: $t('wordleImpossible.bestTime') },
		{ value: formatTime(averageTime), label: $t('wordleImpossible.avgTime') }
	]}
	distributionTitle={distribution.length ? $t('wordleImpossible.guessDistribution') : undefined}
	{distribution}
/>
