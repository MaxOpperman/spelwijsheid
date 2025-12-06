<script lang="ts">
	const base = '';

	export let inputChars: string[];
	export let totalPossibleWords: number;
	export let hasSavedGame: boolean;
	export let gamePaused: boolean;
	export let onStartGame: () => void;
	export let onResumeGame: () => void;
	export let onNewGame: () => void;
</script>

<h1>Spelwijze</h1>

<div class="help-link">
	<a href="{base}/spelwijze/how-to-play">Hoe werkt het spel?</a>
</div>

<div class="welcome-screen">
	<div class="welcome-header">
		<div class="welcome-icon">🎯</div>
		<h2>Welkom bij Spelwijze!</h2>
		<p class="welcome-subtitle">Vind alle Nederlandse woorden met de gegeven letters</p>
	</div>

	<div class="game-preview">
		<div class="challenge-section">
			<h3>🎲 Vandaag's Uitdaging</h3>
			<p class="challenge-description">
				Gebruik deze letters om zo veel mogelijk woorden te vinden:
			</p>

			<div class="letters-display">
				{#each inputChars || [] as char, index (index)}
					<span class="letter-tile" class:mandatory={index === 0}>
						{char}
					</span>
				{/each}
			</div>

			<div class="letter-legend">
				<div class="legend-item">
					<span class="legend-color mandatory-color"></span>
					<span>Verplichte letter (moet in elk woord)</span>
				</div>
				<div class="legend-item">
					<span class="legend-color optional-color"></span>
					<span>Optionele letters</span>
				</div>
			</div>
		</div>

		{#if inputChars && inputChars.length >= 1}
			<div class="game-stats-preview">
				<div class="stat-card">
					<div class="stat-number">{totalPossibleWords}</div>
					<div class="stat-label">Mogelijke woorden</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{inputChars.length}</div>
					<div class="stat-label">Letters om mee te spelen</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">∞</div>
					<div class="stat-label">Tijd om te spelen</div>
				</div>
			</div>

			<div class="game-actions-welcome">
				{#if hasSavedGame}
					{#if gamePaused}
						<button class="continue-button-hero" onclick={onResumeGame}>
							▶️ Doorgaan met spel
						</button>
					{:else}
						<button class="continue-button-hero" onclick={onStartGame}>
							🚀 Start het nieuwe spel!
						</button>
					{/if}
				{:else}
					<button class="start-button-hero" onclick={onStartGame}> 🚀 Start het spel! </button>
				{/if}
				<button class="new-game-button" onclick={onNewGame}> 🎲 Nieuwe letters </button>
			</div>

			<div class="game-tips">
				<h4>💡 Spelregels:</h4>
				<ul>
					<li>Elk woord <strong>moet</strong> de groene letter bevatten.</li>
					<li>Je mag alleen de andere letters gebruiken die zichtbaar zijn.</li>
					<li>Je voortgang wordt automatisch opgeslagen.</li>
					<li>Probeer alle {totalPossibleWords} woorden te vinden!</li>
				</ul>
			</div>
		{:else}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p class="loading-text">Genereren van perfecte lettercombinatie...</p>
			</div>
		{/if}
	</div>
</div>

<style>
	h1 {
		text-align: center;
		margin-bottom: 1rem;
	}

	.help-link {
		text-align: center;
		margin: 1rem 0 2rem 0;
	}

	.help-link a {
		color: var(--color-text);
		text-decoration: none;
		display: inline-block;
	}

	.help-link a::before {
		content: 'i';
		display: inline-block;
		font-size: 0.8em;
		font-weight: 900;
		width: 1em;
		height: 1em;
		padding: 0.2em;
		line-height: 1;
		border: 1.5px solid var(--color-text);
		border-radius: 50%;
		text-align: center;
		margin: 0 0.5em 0 0;
		position: relative;
		top: -0.05em;
	}

	/* Welcome Screen Styles */
	.welcome-screen {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.welcome-header {
		text-align: center;
		margin-bottom: 2rem;
		background-color: var(--color-surface);
		border: 2px solid var(--color-primary-light);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.welcome-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.welcome-header h2 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: var(--color-primary);
	}

	.welcome-subtitle {
		font-size: 1.1rem;
		color: var(--color-text-light);
		margin: 0;
	}

	.game-preview {
		background-color: var(--color-surface);
		border: 2px solid var(--color-primary-light);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.challenge-section {
		text-align: center;
		margin-bottom: 2rem;
	}

	.challenge-section h3 {
		color: var(--color-primary);
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}

	.challenge-description {
		color: var(--color-text);
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.letters-display {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin: 2rem 0;
		flex-wrap: wrap;
	}

	.letter-tile {
		width: 4rem;
		height: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.6rem;
		font-weight: 700;
		border-radius: 8px;
		text-transform: uppercase;
		transition: all 0.2s ease;
		position: relative;
		border: 2px solid var(--color-primary-light);
		background-color: var(--color-surface);
		color: var(--color-text);
	}

	.letter-tile.mandatory {
		background-color: var(--color-accent);
		color: var(--color-surface);
		border-color: var(--color-accent);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--color-text);
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 4px;
	}

	.mandatory-color {
		background: var(--color-accent);
	}

	.optional-color {
		background: var(--color-primary);
	}

	.game-stats-preview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin: 2rem 0;
	}

	.stat-card {
		background-color: var(--color-surface);
		border: 1px solid var(--color-primary-light);
		padding: 1.5rem 1rem;
		border-radius: 8px;
		text-align: center;
		transition: transform 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: var(--color-text);
		font-weight: 500;
	}

	.game-actions-welcome {
		text-align: center;
		margin: 2rem 0;
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.start-button-hero,
	.continue-button-hero {
		background: var(--color-primary);
		color: var(--color-surface);
		border: none;
		padding: 1rem 2.5rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.continue-button-hero {
		background: var(--color-accent);
	}

	.start-button-hero:hover,
	.continue-button-hero:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.start-button-hero:hover {
		background: var(--color-primary-hover);
	}

	.continue-button-hero:hover {
		background: var(--color-accent);
		filter: brightness(1.1);
	}

	.new-game-button {
		background: var(--color-surface);
		color: var(--color-primary);
		border: 2px solid var(--color-primary);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.new-game-button:hover {
		background: var(--color-primary);
		color: var(--color-surface);
		transform: translateY(-1px);
	}

	.game-tips {
		background-color: var(--color-surface);
		border: 1px solid var(--color-primary-light);
		padding: 1.5rem;
		border-radius: 8px;
		margin-top: 2rem;
		border-left: 4px solid var(--color-accent);
	}

	.game-tips h4 {
		color: var(--color-primary);
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.game-tips ul {
		margin: 0;
		padding-left: 1.5rem;
		color: var(--color-text);
	}

	.game-tips li {
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	.loading-state {
		text-align: center;
		padding: 3rem 2rem;
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 4px solid var(--color-primary-light);
		border-top: 4px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	.loading-text {
		color: var(--color-text-light);
		font-style: italic;
		font-size: 1.1rem;
		margin: 0;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.welcome-header {
			padding: 2rem 1rem;
			margin-bottom: 2rem;
		}

		.welcome-header h2 {
			font-size: 2rem;
		}

		.welcome-subtitle {
			font-size: 1rem;
		}

		.game-preview {
			padding: 1.5rem;
		}

		.letters-display {
			gap: 0.75rem;
		}

		.letter-tile {
			width: 3rem;
			height: 3rem;
			font-size: 1.2rem;
		}

		.legend-item {
			font-size: 0.8rem;
		}

		.game-stats-preview {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.stat-card {
			padding: 1rem;
		}

		.stat-number {
			font-size: 1.5rem;
		}

		.game-actions-welcome {
			flex-direction: column;
			align-items: center;
		}

		.start-button-hero,
		.continue-button-hero {
			width: 100%;
			max-width: 300px;
			padding: 1rem 2rem;
			font-size: 1.1rem;
		}

		.new-game-button {
			width: 100%;
			max-width: 300px;
			padding: 0.75rem 1.5rem;
		}

		.game-tips {
			padding: 1rem;
			margin-top: 1.5rem;
		}
	}
</style>
