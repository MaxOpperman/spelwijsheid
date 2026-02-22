<script lang="ts">
	import type { WordleStats } from './stats.ts';
	import { t } from '$lib/i18n';

	interface Props {
		stats: WordleStats;
	}

	let { stats }: Props = $props();
</script>

<div class="stats-panel">
	<h3>{$t('wordle.stats')}</h3>
	<div class="stats-overview">
		<div class="stat-item">
			<div class="stat-value">{stats.gamesPlayed}</div>
			<div class="stat-label">{$t('wordle.played')}</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{stats.gamesWon}</div>
			<div class="stat-label">{$t('wordle.won')}</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{stats.currentStreak}</div>
			<div class="stat-label">{$t('wordle.currentStreak')}</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{stats.maxStreak}</div>
			<div class="stat-label">{$t('wordle.bestStreak')}</div>
		</div>
	</div>

	<h4>{$t('wordle.guessDistribution')}</h4>
	<div class="guess-distribution">
		{#each [1, 2, 3, 4, 5, 6] as guessNum (guessNum)}
			{@const count = stats.guessDistribution[guessNum as 1 | 2 | 3 | 4 | 5 | 6]}
			{@const maxCount = Math.max(...Object.values(stats.guessDistribution))}
			{@const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0}
			<div class="distribution-row">
				<div class="guess-number">{guessNum}</div>
				<div class="distribution-bar-container">
					<div
						class="distribution-bar"
						style="width: {Math.max(percentage, count > 0 ? 7 : 0)}%"
					></div>
					<span class="distribution-count">{count}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.stats-panel {
		width: 100%;
		max-width: min(90vw, 450px);
		padding: 0.75rem;
		margin: 0.5rem auto 1rem auto;
		background: var(--color-bg-1);
		border: 1px solid var(--color-text);
		border-radius: 4px;
		text-align: center;
		box-sizing: border-box;
	}

	.stats-panel h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1.1rem;
		color: var(--color-text);
	}

	.stats-panel h4 {
		margin: 1rem 0 0.5rem 0;
		font-size: 0.95rem;
		color: var(--color-text);
	}

	.stats-overview {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: bold;
		color: var(--color-theme-1);
	}

	.stat-label {
		font-size: 0.7rem;
		color: var(--color-text);
		text-transform: uppercase;
		line-height: 1.2;
	}

	.guess-distribution {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		text-align: left;
		max-width: 100%;
		margin: 0 auto;
		padding: 0 0.5rem;
		box-sizing: border-box;
	}

	.distribution-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.guess-number {
		font-weight: bold;
		min-width: 1.25rem;
		color: var(--color-text);
		font-size: 0.9rem;
	}

	.distribution-bar-container {
		flex: 1;
		background: var(--color-bg-0);
		border-radius: 3px;
		height: 1.75rem;
		position: relative;
		overflow: hidden;
	}

	.distribution-bar {
		background: var(--color-theme-2);
		height: 100%;
		border-radius: 3px;
		transition: width 0.5s ease;
	}

	.distribution-count {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text);
		font-weight: bold;
		font-size: 0.875rem;
		z-index: 1;
	}

	@media (max-width: 600px) {
		.stats-overview {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.75rem;
		}

		.stat-value {
			font-size: 1.5rem;
		}

		.stat-label {
			font-size: 0.65rem;
		}

		.stats-panel {
			padding: 0.5rem;
		}

		.guess-distribution {
			padding: 0 0.25rem;
		}
	}
</style>
