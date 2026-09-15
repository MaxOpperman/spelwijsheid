<script lang="ts">
	import StatsPanel from '$lib/components/StatsPanel.svelte';
	import type { QueensStats } from './stats';
	import { formatTime } from './stats';
	import { t } from '$lib/i18n';

	interface Props {
		stats: QueensStats;
		currentTime: number;
	}

	let { stats, currentTime }: Props = $props();
	const sortedSizes = $derived(
		Object.keys(stats.sizeTimes)
			.map(Number)
			.sort((a, b) => a - b)
	);
</script>

<StatsPanel
	title={$t('queens.puzzleSolved')}
	current={{ label: $t('queens.yourTime'), value: formatTime(currentTime) }}
	metrics={[
		{ value: stats.gamesWon, label: $t('queens.completed') },
		{ value: formatTime(stats.fastestTime), label: $t('queens.fastest') },
		{ value: formatTime(stats.averageTime), label: $t('queens.average') }
	]}
>
	{#if sortedSizes.length > 0}
		<h4>{$t('queens.avgPerBoardSize')}</h4>
		<div class="size-stats">
			{#each sortedSizes as size (size)}
				{@const sizeData = stats.sizeTimes[size]}
				{@const avgTime = sizeData.totalTime / sizeData.count}
				<div class="size-row">
					<div class="size-label">{size}x{size}</div>
					<div class="size-info">
						<span class="size-avg">{formatTime(avgTime)}</span>
						<span class="size-count"
							>({sizeData.count}
							{sizeData.count !== 1 ? $t('queens.gamePlural') : $t('queens.gameSingular')})</span
						>
					</div>
					<div class="size-fastest">{$t('queens.fastest')}: {formatTime(sizeData.fastestTime)}</div>
				</div>
			{/each}
		</div>
	{/if}
</StatsPanel>

<style>
	.size-stats {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.size-row {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--color-bg-0);
		border-radius: var(--radius-control);
		text-align: left;
	}

	.size-label {
		min-width: 60px;
		font-size: 1.1rem;
		font-weight: 700;
	}

	.size-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.size-avg {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.size-count {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.size-fastest {
		font-size: 0.85rem;
		text-align: right;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.size-row {
			grid-template-columns: auto 1fr;
			gap: 0.5rem;
		}

		.size-fastest {
			grid-column: 2;
			text-align: left;
			font-size: 0.75rem;
		}
	}
</style>
