<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from './Panel.svelte';

	export interface StatMetric {
		label: string;
		value: string | number;
	}

	export type StatDistribution = StatMetric;

	interface Props {
		title: string;
		metrics: StatMetric[];
		current?: StatMetric;
		distributionTitle?: string;
		distribution?: StatDistribution[];
		children?: Snippet;
	}

	let { title, metrics, current, distributionTitle, distribution, children }: Props = $props();
</script>

<Panel class="stats-panel">
	<h3>{title}</h3>

	{#if current}
		<div class="current-value">
			<div class="current-label">{current.label}</div>
			<div class="current-number">{current.value}</div>
		</div>
	{/if}

	<div class="stats-overview">
		{#each metrics as metric (metric.label)}
			<div class="stat-item">
				<div class="stat-value">{metric.value}</div>
				<div class="stat-label">{metric.label}</div>
			</div>
		{/each}
	</div>

	{#if distribution?.length}
		{#if distributionTitle}<h4>{distributionTitle}</h4>{/if}
		<div class="distribution">
			{#each distribution as item (item.label)}
				<div class="distribution-row">
					<div class="distribution-label">{item.label}</div>
					<div class="distribution-bar-container">
						<div
							class="distribution-bar"
							style="width: {Math.max(...distribution.map((entry) => Number(entry.value)), 0) > 0
								? Math.max(
										(Number(item.value) /
											Math.max(...distribution.map((entry) => Number(entry.value)), 1)) *
											100,
										Number(item.value) > 0 ? 7 : 0
									)
								: 0}%"
						></div>
						<span class="distribution-count">{item.value}</span>
					</div>
				</div>
			{/each}
		</div>
	{:else if children}
		{@render children()}
	{/if}
</Panel>

<style>
	:global(.stats-panel) {
		width: 100%;
		max-width: min(90vw, 500px);
		padding: var(--space-panel);
		margin: 1rem auto;
		text-align: center;
		box-sizing: border-box;
	}

	:global(.stats-panel h3) {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		color: var(--color-primary);
	}

	:global(.stats-panel h4) {
		margin: 1rem 0 0.5rem;
		font-size: 0.95rem;
		color: var(--color-text);
	}

	.current-value {
		margin-bottom: 1rem;
		padding: 0.75rem;
	}

	.current-label,
	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.current-number {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.stats-overview {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		padding: 0.75rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.distribution {
		display: grid;
		gap: 0.25rem;
		padding: 0 0.5rem;
		text-align: left;
	}

	.distribution-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.distribution-label {
		min-width: 1.25rem;
		font-weight: 700;
	}

	.distribution-bar-container {
		position: relative;
		flex: 1;
		height: 1.75rem;
		background: var(--color-bg-0);
		border-radius: var(--radius-control);
		overflow: hidden;
	}

	.distribution-bar {
		height: 100%;
		background: var(--color-accent);
		border-radius: inherit;
		transition: width 0.3s ease;
	}

	.distribution-count {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		font-weight: 700;
	}

	@media (max-width: 600px) {
		:global(.stats-panel) {
			padding: 0.75rem;
		}

		.stats-overview {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
