<script lang="ts">
	import type { ImpossibleWordleStats } from './stats.ts';
	import { formatTime, getAverageTime } from './stats.ts';

	interface Props {
		stats: ImpossibleWordleStats;
	}

	let { stats }: Props = $props();

	const averageTime = $derived(getAverageTime(stats));
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
	}
</style>
