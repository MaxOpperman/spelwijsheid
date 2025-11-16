<script lang="ts">
	export let chars: string[];
	export let foundWords: string[];
	export let gameComplete: boolean;
	export let gamePaused: boolean;
	export let formattedTime: string;
	export let totalPossibleWords: number;
	export let completionPercentage: number;
	export let wordInput: string;
	export let score: number;
	export let onPauseGame: () => void;
	export let onResumeGame: () => void;
	export let onResetGame: () => void;
	export let onSubmitWord: () => void;
	export let onKeydown: (event: KeyboardEvent) => void;

	$: inputChars = chars.filter(Boolean);
</script>

<div class="game">
	<div class="game-header">
		<div class="letters-display">
			<span class="mandatory">{chars[0]}</span>
			{#each chars.slice(1).filter(Boolean) as char}
				<span class="optional">{char}</span>
			{/each}
		</div>
		
		<div class="game-stats">
			<div class="stat">
				<span class="label">Tijd:</span>
				<span class="value">{formattedTime}</span>
			</div>
			<div class="stat">
				<span class="label">Gevonden:</span>
				<span class="value">{foundWords.length}/{totalPossibleWords}</span>
			</div>
			<div class="stat">
				<span class="label">Voortgang:</span>
				<span class="value">{completionPercentage}%</span>
			</div>
		</div>
		
		<div class="game-controls">
			{#if gamePaused}
				<button class="resume-button" on:click={onResumeGame}>
					▶️ Doorgaan
				</button>
			{:else}
				<button class="pause-button" on:click={onPauseGame}>
					⏸️ Pauzeren
				</button>
			{/if}
		</div>
	</div>

	<div class="word-input-section">
		<div class="word-input">
			<input
				type="text"
				bind:value={wordInput}
				placeholder={gamePaused ? "Spel is gepauzeerd..." : "Typ een woord..."}
				on:keydown={onKeydown}
				disabled={gameComplete || gamePaused}
			/>
			<button on:click={onSubmitWord} disabled={gameComplete || gamePaused || !wordInput}>
				Toevoegen
			</button>
		</div>
	</div>

	<div class="progress-bar">
		<div class="progress" style="width: {completionPercentage}%"></div>
	</div>

	<div class="found-words">
		<h3>Gevonden woorden ({foundWords.length}):</h3>
		{#if foundWords.length > 0}
			<div class="words-grid">
				{#each foundWords as word}
					<span class="found-word" class:new={word === foundWords[foundWords.length - 1]}>
						{word}
					</span>
				{/each}
			</div>
		{:else}
			<p class="no-words">Nog geen woorden gevonden. Begin met typen!</p>
		{/if}
	</div>

	<div class="game-actions">
		<button class="reset-button" on:click={onResetGame}>
			Nieuw spel
		</button>
	</div>
</div>

{#if gameComplete}
	<div class="completion-modal">
		<div class="modal-content">
			<h2>🎉 Gefeliciteerd!</h2>
			<p>Je hebt alle {totalPossibleWords} woorden gevonden!</p>
			<div class="final-stats">
				<div>Tijd: {formattedTime}</div>
				<div>Score: {score} punten</div>
			</div>
			<button on:click={onResetGame}>Speel opnieuw</button>
		</div>
	</div>
{/if}

<style>
	/* Game phase styles */
	.game {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background-color: var(--color-surface);
		border: 2px solid var(--color-primary-light);
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.letters-display {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.letters-display span {
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-weight: 600;
		font-size: 1.1rem;
		border: 2px solid transparent;
	}

	.mandatory {
		background-color: var(--color-accent);
		color: var(--color-surface);
		border-color: var(--color-accent);
	}

	.optional {
		background-color: var(--color-surface);
		color: var(--color-primary);
		border-color: var(--color-primary-light);
	}

	.game-stats {
		display: flex;
		gap: 1rem;
	}

	.stat {
		text-align: center;
	}

	.stat .label {
		display: block;
		font-size: 0.8rem;
		color: var(--color-text-light);
		font-weight: 500;
	}

	.stat .value {
		display: block;
		font-weight: 600;
		font-size: 1rem;
		color: var(--color-text);
	}

	.word-input-section {
		margin-bottom: 2rem;
	}

	.word-input {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: center;
	}

	.word-input input {
		flex: 1;
		max-width: 300px;
		padding: 0.75rem;
		border: 2px solid var(--color-primary-light);
		border-radius: 8px;
		font-size: 1rem;
		background-color: var(--color-surface);
		color: var(--color-text);
		transition: border-color 0.2s ease;
	}

	.word-input input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.word-input button {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: var(--color-surface);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.word-input button:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.word-input button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.progress-bar {
		width: 100%;
		height: 6px;
		background-color: var(--color-primary-light);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 2rem;
	}

	.progress {
		height: 100%;
		background: var(--color-accent);
		transition: width 0.3s ease;
	}

	.found-words {
		margin-bottom: 2rem;
	}

	.words-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.found-word {
		background-color: var(--color-surface);
		border: 1px solid var(--color-primary-light);
		padding: 0.5rem;
		border-radius: 6px;
		text-align: center;
		font-weight: 500;
		transition: all 0.2s ease;
		color: var(--color-text);
	}

	.found-word.new {
		background-color: var(--color-accent);
		color: var(--color-surface);
		border-color: var(--color-accent);
		animation: highlight 0.5s ease;
	}

	.no-words {
		text-align: center;
		color: var(--color-text-light);
		font-style: italic;
	}

	.game-actions {
		text-align: center;
	}

	.reset-button {
		background-color: var(--color-secondary);
		color: var(--color-surface);
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: background-color 0.2s ease;
	}

	.reset-button:hover {
		background-color: var(--color-text-light);
	}

	/* Game controls */
	.game-controls {
		margin: 1rem 0;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.pause-button, .resume-button {
		background: var(--color-accent);
		color: var(--color-surface);
		border: none;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		cursor: pointer;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		transition: all 0.2s;
	}

	.pause-button:hover, .resume-button:hover {
		background-color: var(--color-accent);
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	.resume-button {
		background-color: var(--color-accent);
	}

	.resume-button:hover {
		background-color: var(--color-accent);
		filter: brightness(1.1);
	}

	/* Completion modal */
	.completion-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background-color: var(--color-surface);
		border: 2px solid var(--color-primary-light);
		padding: 2rem;
		border-radius: 8px;
		text-align: center;
		max-width: 400px;
		margin: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.modal-content h2 {
		color: var(--color-primary);
		margin-bottom: 1rem;
	}

	.final-stats {
		margin: 1.5rem 0;
		padding: 1rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-primary-light);
		border-radius: 8px;
	}

	.final-stats div {
		margin: 0.5rem 0;
		font-weight: 600;
	}

	.modal-content button {
		background-color: var(--color-primary);
		color: var(--color-surface);
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		margin-top: 1rem;
		transition: background-color 0.2s ease;
	}

	.modal-content button:hover {
		background-color: var(--color-primary-hover);
	}

	@keyframes highlight {
		0% { transform: scale(1); }
		50% { transform: scale(1.05); }
		100% { transform: scale(1); }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.game-header {
			flex-direction: column;
			gap: 1rem;
		}
		
		.game-stats {
			flex-wrap: wrap;
			justify-content: center;
		}
		
		.word-input {
			flex-direction: column;
		}
		
		.word-input input {
			max-width: 100%;
		}
	}
</style>
