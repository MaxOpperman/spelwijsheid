<script lang="ts">
	import type { ImpossibleWordleStats } from './stats.ts';
	import { formatTime, getAverageTime } from './stats.ts';

	interface Props {
		stats: ImpossibleWordleStats;
	}

	let { stats }: Props = $props();

	const averageTime = $derived(getAverageTime(stats));

	// Get guess distribution data
	const guessDistributionData = $derived.by(() => {
		const distribution = stats.guessDistribution || {};
		const counts = Object.values(distribution);
		const maxCount = Math.max(...counts, 0);
		return { distribution, maxCount };
	});
</script>

<div class="stats-panel">
	<h3>Statistieken</h3>
	<div class="stats-overview">
		<div class="stat-item">
			<div class="stat-value">{stats.gamesPlayed}</div>
			<div class="stat-label">Gespeeld</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{stats.totalCorrectGuesses}</div>
			<div class="stat-label">Correct</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{formatTime(stats.bestTime)}</div>
			<div class="stat-label">Beste Tijd</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">{formatTime(averageTime)}</div>
			<div class="stat-label">Gemiddelde Tijd</div>
		</div>
	</div>

	{#if Object.keys(stats.guessDistribution || {}).length > 0}
		<h4>Aantal beurten per woord</h4>
		<div class="guess-distribution">
			{#each Object.entries(stats.guessDistribution || {})
				.map(([k, v]) => ({ guessNum: parseInt(k), count: v }))
				.sort((a, b) => a.guessNum - b.guessNum) as { guessNum, count } (guessNum)}
				{@const percentage =
					guessDistributionData.maxCount > 0 ? (count / guessDistributionData.maxCount) * 100 : 0}
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
	{/if}
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
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
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
		font-size: 0.9rem;
		z-index: 1;
	}

	@media (max-width: 600px) {
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

		.distribution-bar-container {
			height: 1.5rem;
		}

		.distribution-count {
			font-size: 0.8rem;
		}
	}
</style>
