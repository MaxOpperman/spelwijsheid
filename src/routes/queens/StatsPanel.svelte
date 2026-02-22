<script lang="ts">
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

<div class="stats-panel">
	<h3>{$t('queens.puzzleSolved')}</h3>
	<div class="current-time">
		<div class="current-time-label">{$t('queens.yourTime')}</div>
		<div class="current-time-value">{formatTime(currentTime)}</div>
	</div>

	<div class="stats-overview">
		<div class="stat-item">
			<div class="stat-value">{stats.gamesWon}</div>
			<div class="stat-label">{$t('queens.completed')}</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{formatTime(stats.fastestTime)}</div>
			<div class="stat-label">{$t('queens.fastest')}</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{formatTime(stats.averageTime)}</div>
			<div class="stat-label">{$t('queens.average')}</div>
		</div>
	</div>

	{#if sortedSizes.length > 0}
		<h4>{$t('queens.avgPerBoardSize')}</h4>
		<div class="size-stats">
			{#each sortedSizes as size (size)}
				{@const sizeData = stats.sizeTimes[size]}
				{@const avgTime = sizeData.totalTime / sizeData.count}
				<div class="size-row">
					<div class="size-label">{size}×{size}</div>
					<div class="size-info">
						<span class="size-avg">{formatTime(avgTime)}</span>
						<span class="size-count"
							>({sizeData.count}
							{sizeData.count !== 1 ? $t('queens.gamePlural') : $t('queens.gameSingular')})</span
						>
					</div>
					<div class="size-fastest">
						{$t('queens.fastest')}: {formatTime(sizeData.fastestTime)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.stats-panel {
		width: 100%;
		max-width: min(90vw, 500px);
		padding: 1.5rem;
		margin: 1rem auto;
		background: var(--color-bg-1);
		border: 2px solid var(--color-theme-1);
		border-radius: 12px;
		text-align: center;
		box-sizing: border-box;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
	}

	.stats-panel h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		color: var(--color-theme-1);
	}

	.current-time {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--color-bg-0);
		border-radius: 8px;
	}

	.current-time-label {
		font-size: 0.9rem;
		color: var(--color-text);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.current-time-value {
		font-size: 2.5rem;
		font-weight: bold;
		color: var(--color-theme-1);
	}

	.stats-overview {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--color-bg-0);
		border-radius: 8px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--color-theme-1);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stats-panel h4 {
		margin: 1.5rem 0 1rem 0;
		font-size: 1rem;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

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
		border-radius: 6px;
		text-align: left;
	}

	.size-label {
		font-weight: bold;
		font-size: 1.1rem;
		color: var(--color-text);
		min-width: 60px;
	}

	.size-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.size-avg {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-theme-1);
	}

	.size-count {
		font-size: 0.75rem;
		color: var(--color-text);
		opacity: 0.7;
	}

	.size-fastest {
		font-size: 0.85rem;
		color: var(--color-text);
		text-align: right;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.stats-panel {
			padding: 1rem;
		}

		.stats-panel h3 {
			font-size: 1.25rem;
		}

		.current-time-value {
			font-size: 2rem;
		}

		.stats-overview {
			gap: 0.5rem;
			padding: 0.75rem;
		}

		.stat-value {
			font-size: 1.25rem;
		}

		.stat-label {
			font-size: 0.7rem;
		}

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
