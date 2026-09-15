<script lang="ts">
	import StatsPanel from '$lib/components/StatsPanel.svelte';
	import type { WordleStats } from './stats.ts';
	import { t } from '$lib/i18n';

	interface Props {
		stats: WordleStats;
	}

	let { stats }: Props = $props();
</script>

<StatsPanel
	title={$t('wordle.stats')}
	metrics={[
		{ value: stats.gamesPlayed, label: $t('wordle.played') },
		{ value: stats.gamesWon, label: $t('wordle.won') },
		{ value: stats.currentStreak, label: $t('wordle.currentStreak') },
		{ value: stats.maxStreak, label: $t('wordle.bestStreak') }
	]}
	distributionTitle={$t('wordle.guessDistribution')}
	distribution={[1, 2, 3, 4, 5, 6].map((guessNum) => ({
		label: String(guessNum),
		value: stats.guessDistribution[guessNum as 1 | 2 | 3 | 4 | 5 | 6]
	}))}
/>
