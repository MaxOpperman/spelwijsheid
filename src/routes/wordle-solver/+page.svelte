<script lang="ts">
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	/** Get the appropriate word list for the given word length and digraph setting */
	function getWordList(length: number, splitIj: boolean): string[] {
		const lists = {
			4: splitIj ? data.wordList4WithSplitIj : data.wordList4,
			5: splitIj ? data.wordList5WithSplitIj : data.wordList5,
			6: splitIj ? data.wordList6WithSplitIj : data.wordList6,
			7: splitIj ? data.wordList7WithSplitIj : data.wordList7
		};
		return lists[length as keyof typeof lists] || lists[5];
	}

	// State for the solver
	let wordLength = $state(5);
	let exactPositions = $state([null, null, null, null, null] as (string | null)[]);
	let wrongPositions = $state([[], [], [], [], []] as string[][]);
	let absentLetters = $state('');
	let possibleWords = $state([] as string[]);
	let allowIjDigraph = $state(true);
	let maxDisplayedWords = $state(100);

	// Input refs for focus management
	let exactInputRefs = $state<HTMLInputElement[]>([]);
	let wrongInputRefs = $state<HTMLInputElement[]>([]);

	function changeWordLength(newLength: number) {
		wordLength = newLength;
		exactPositions = Array(newLength).fill(null);
		wrongPositions = Array(newLength)
			.fill([])
			.map(() => []);
		absentLetters = '';
		possibleWords = [];
		maxDisplayedWords = 100;
	}

	// Auto-solve effect
	$effect(() => {
		// Track dependencies by reading them into a variable
		const deps = [exactPositions, wrongPositions, absentLetters, allowIjDigraph, wordLength];
		// Call solve whenever any input changes
		if (deps) solve();
	});

	function addWrongPosition(position: number, letter: string) {
		if (letter && !wrongPositions[position].includes(letter.toLowerCase())) {
			wrongPositions[position] = [...wrongPositions[position], letter.toLowerCase()];
		}
	}

	function removeWrongPosition(position: number, letter: string) {
		wrongPositions[position] = wrongPositions[position].filter((l) => l !== letter);
	}

	function focusInput(inputs: HTMLInputElement[], index: number) {
		const input = inputs[index];
		if (input) {
			input.focus();
			input.setSelectionRange(0, input.value.length);
		}
	}

	function handleExactKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Backspace' && !exactPositions[index] && index > 0) {
			event.preventDefault();
			focusInput(exactInputRefs, index - 1);
		}
	}

	function handleExactInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const value = input.value.toLowerCase();

		if (!value) {
			exactPositions[index] = null;
			if ((event as InputEvent).inputType === 'deleteContentBackward' && index > 0) {
				focusInput(exactInputRefs, index - 1);
			}
			return;
		}

		if (!/^[a-z]+$/.test(value)) {
			input.value = '';
			return;
		}

		if (value === 'i' && allowIjDigraph) {
			input.maxLength = 2;
			exactPositions[index] = value;
		} else if (value === 'ij' && allowIjDigraph) {
			exactPositions[index] = value;
			input.maxLength = 1;
			if (index < 4) focusInput(exactInputRefs, index + 1);
		} else if (value.length === 1) {
			exactPositions[index] = value;
			input.maxLength = 1;
			if (index < 4) focusInput(exactInputRefs, index + 1);
		} else if (value.length === 2) {
			// Two characters typed - split them
			exactPositions[index] = value[0];
			input.maxLength = 1;
			if (index < 4) {
				exactPositions[index + 1] = value[1];
				focusInput(exactInputRefs, index + 1);
			}
		}
	}

	function handleWrongKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter') {
			event.preventDefault();
			const input = wrongInputRefs[index];
			const value = input?.value.toLowerCase();
			if (value && /^[a-z]{1,2}$/.test(value)) {
				addWrongPosition(index, value);
				input.value = '';
			}
		}
	}

	function handleWrongInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const value = input.value.toLowerCase();

		if (!value || !/^[a-z]+$/.test(value)) {
			input.value = '';
			return;
		}

		if (value === 'i' && allowIjDigraph) {
			input.maxLength = 2;
		} else if ((value === 'ij' && allowIjDigraph) || value.length === 1) {
			addWrongPosition(index, value.length === 2 ? value : value[0]);
			input.value = '';
			input.maxLength = 2;
		} else if (value.length === 2) {
			addWrongPosition(index, value[0]);
			input.value = '';
			input.maxLength = 2;
		}
	}

	function convertToDigraph(letter: string): string {
		return allowIjDigraph && letter === 'ij' ? 'ĳ' : letter;
	}

	function matchesPosition(word: string, index: number, expected: string): boolean {
		if (allowIjDigraph) {
			return word[index] === convertToDigraph(expected);
		}
		// Split mode: check for 'ij' as consecutive characters
		if (expected === 'ij') {
			return word[index] === 'i' && word[index + 1] === 'j';
		}
		return word[index] === expected;
	}

	function solve() {
		const absent = new Set(absentLetters.toLowerCase().match(/[a-z]/g) || []);
		const mustInclude = new Set(wrongPositions.flat().map(convertToDigraph));

		// Select the appropriate wordlist based on word length and digraph setting
		const wordsToSearch = getWordList(wordLength, !allowIjDigraph);

		const mappedWords = wordsToSearch
			.filter((word: string) => {
				// Check exact positions
				for (let i = 0; i < wordLength; i++) {
					if (exactPositions[i] && !matchesPosition(word, i, exactPositions[i]!)) {
						return false;
					}
				}

				// Check that all required letters are present
				const cleanWord = allowIjDigraph ? word : word.replace(/-/g, '');
				if ([...mustInclude].some((letter) => !cleanWord.includes(letter))) {
					return false;
				}

				// Check wrong positions (letter must NOT be at this position)
				for (let i = 0; i < wordLength; i++) {
					if (wrongPositions[i].some((letter) => matchesPosition(word, i, letter))) {
						return false;
					}
				}

				// Check absent letters
				for (const letter of absent) {
					const isRequired = mustInclude.has(letter) || exactPositions.includes(letter);
					if (!isRequired && cleanWord.includes(letter)) {
						return false;
					}
				}

				return true;
			})
			.map((word) => word.replace(/-/g, ''));

		// Deduplicate normalized words to avoid duplicate keys in keyed each blocks
		possibleWords = Array.from(new Set(mappedWords));
	}

	function reset() {
		exactPositions = Array(wordLength).fill(null);
		wrongPositions = Array(wordLength)
			.fill([])
			.map(() => []);
		absentLetters = '';
		possibleWords = [];
		maxDisplayedWords = 100;
		[...exactInputRefs, ...wrongInputRefs].forEach((input) => {
			if (input) input.value = '';
		});
	}

	function showMoreWords() {
		maxDisplayedWords += 100;
	}
</script>

<svelte:head>
	<title>Wordle Solver</title>
	<meta name="description" content="Solve Wordle puzzles by entering known information" />
</svelte:head>

<div class="solver-container">
	<h1>Wordle Solver</h1>
	<p class="description">{$t('wordleSolver.description')}</p>

	<!-- Word length selector -->
	<div class="word-length-selector">
		<button class:active={wordLength === 4} onclick={() => changeWordLength(4)}> 4 letters </button>
		<button class:active={wordLength === 5} onclick={() => changeWordLength(5)}> 5 letters </button>
		<button class:active={wordLength === 6} onclick={() => changeWordLength(6)}> 6 letters </button>
		<button class:active={wordLength === 7} onclick={() => changeWordLength(7)}> 7 letters </button>
	</div>

	<div class="solver-grid">
		<section class="input-section">
			<h2>{$t('wordleSolver.exactPositions')}</h2>
			<div class="exact-positions">
				{#each exactPositions as letter, i (i)}
					<input
						type="text"
						bind:this={exactInputRefs[i]}
						maxlength="1"
						value={letter || ''}
						oninput={(e) => handleExactInput(e, i)}
						onkeydown={(e) => handleExactKeydown(e, i)}
						placeholder={String(i + 1)}
						class="letter-input exact"
					/>
				{/each}
			</div>
		</section>

		<section class="input-section">
			<h2>{$t('wordleSolver.wrongPositions')}</h2>
			<p class="hint">{$t('wordleSolver.wrongPositionsHint')}</p>
			<div class="wrong-positions">
				{#each wrongPositions as letters, i (i)}
					<div class="position-group">
						<div class="position-label">{$t('wordleSolver.position', { n: i + 1 })}</div>
						<input
							type="text"
							bind:this={wrongInputRefs[i]}
							maxlength="2"
							oninput={(e) => handleWrongInput(e, i)}
							onkeydown={(e) => handleWrongKeydown(e, i)}
							placeholder="+"
							class="letter-input wrong"
						/>
						<div class="letters-list">
							{#each letters as letter (letter)}
								<button onclick={() => removeWrongPosition(i, letter)} class="letter-tag">
									{letter} ×
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="input-section">
			<h2>{$t('wordleSolver.absentLetters')}</h2>
			<p class="hint">{$t('wordleSolver.absentLettersHint')}</p>
			<input
				type="text"
				bind:value={absentLetters}
				placeholder={$t('wordleSolver.absentPlaceholder')}
				class="text-input"
			/>
		</section>

		<section class="input-section options-section">
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={allowIjDigraph} />
				{$t('wordleSolver.digraph')}
			</label>
		</section>

		<div class="actions">
			<button onclick={reset} class="reset-button">{$t('common.reset')}</button>
		</div>
	</div>

	{#if possibleWords.length > 0}
		<section class="results">
			<h2>{$t('wordleSolver.possibleWords', { n: possibleWords.length })}</h2>
			<div class="words-grid">
				{#each possibleWords.slice(0, maxDisplayedWords) as word (word)}
					<div class="word-card">{word}</div>
				{/each}
			</div>
			{#if possibleWords.length > maxDisplayedWords}
				<div class="show-more-container">
					<p class="note">
						{$t('wordleSolver.showing', { shown: maxDisplayedWords, total: possibleWords.length })}
					</p>
					<button onclick={showMoreWords} class="show-more-button"
						>{$t('wordleSolver.showMore')}</button
					>
				</div>
			{/if}
		</section>
	{:else if possibleWords.length === 0 && (exactPositions.some((p) => p !== null) || wrongPositions.some((p) => p.length > 0) || absentLetters)}
		<section class="results">
			<p class="no-results">
				{$t('wordleSolver.noResults')}
			</p>
		</section>
	{/if}
</div>

<style>
	.solver-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		text-align: center;
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.description {
		text-align: center;
		color: var(--color-text);
		opacity: 0.8;
		margin-bottom: 1rem;
	}

	.word-length-selector {
		display: flex;
		gap: 0.5rem;
		margin: 0 auto 2rem;
		justify-content: center;
	}

	.word-length-selector button {
		padding: 0.5rem 1rem;
		border: 2px solid var(--color-primary);
		background: var(--color-surface);
		color: var(--color-text);
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.word-length-selector button:hover {
		background: var(--color-primary-light);
	}

	.word-length-selector button.active {
		background: var(--color-primary);
		color: white;
	}

	.solver-grid {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.input-section {
		background: var(--color-surface);
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.input-section h2 {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		color: var(--color-text);
	}

	.hint {
		font-size: 0.9rem;
		color: var(--color-text);
		opacity: 0.7;
		margin: 0 0 1rem 0;
	}

	.exact-positions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.letter-input {
		width: 3rem;
		height: 3rem;
		text-align: center;
		font-size: 1.5rem;
		text-transform: lowercase;
		border: 2px solid var(--color-text);
		border-radius: 4px;
		background: var(--color-bg-0);
		color: var(--color-text);
		font-weight: bold;
	}

	.letter-input.exact {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-bg-0);
	}

	.letter-input.wrong {
		border-color: #f59e0b;
		width: 2.5rem;
		height: 2.5rem;
		font-size: 1.2rem;
	}

	.letter-input:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.wrong-positions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.position-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.position-label {
		font-size: 0.9rem;
		color: var(--color-text);
		opacity: 0.8;
		font-weight: 500;
	}

	.letters-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		min-height: 2rem;
	}

	.letter-tag {
		padding: 0.25rem 0.5rem;
		background: #f59e0b;
		color: var(--color-bg-0);
		border: none;
		border-radius: 4px;
		font-size: 0.9rem;
		cursor: pointer;
		font-weight: 500;
	}

	.letter-tag:hover {
		background: #d97706;
	}

	.text-input {
		width: 100%;
		max-width: 36ch;
		box-sizing: border-box;
		padding: 0.75rem;
		font-size: 1rem;
		border: 2px solid var(--color-text);
		border-radius: 4px;
		background: var(--color-bg-0);
		color: var(--color-text);
		text-transform: lowercase;
	}

	.text-input:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.reset-button,
	.show-more-button {
		padding: 1rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-button {
		background: var(--color-surface);
		color: var(--color-text);
		border: 2px solid var(--color-text);
	}

	.reset-button:hover {
		background: var(--color-text);
		color: var(--color-surface);
	}

	.show-more-container {
		margin-top: 1rem;
		text-align: center;
	}

	.show-more-button {
		background: var(--color-primary);
		color: var(--color-bg-0);
		margin-top: 0.5rem;
	}

	.show-more-button:hover {
		background: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.results {
		margin-top: 2rem;
		padding: 1.5rem;
		background: var(--color-surface);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.results h2 {
		margin: 0 0 1rem 0;
		color: var(--color-text);
	}

	.words-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
	}

	.word-card {
		padding: 0.75rem;
		background: var(--color-bg-0);
		border: 2px solid var(--color-accent);
		border-radius: 4px;
		text-align: center;
		font-weight: 600;
		font-size: 1.1rem;
		color: var(--color-text);
		text-transform: lowercase;
	}

	.no-results {
		text-align: center;
		color: var(--color-text);
		opacity: 0.7;
		font-size: 1.1rem;
	}

	.note {
		margin-top: 1rem;
		text-align: center;
		color: var(--color-text);
		opacity: 0.7;
		font-size: 0.9rem;
	}

	.options-section {
		padding: 1rem 1.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		color: var(--color-text);
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox'] {
		width: 1.2rem;
		height: 1.2rem;
		cursor: pointer;
	}

	@media (max-width: 640px) {
		.solver-container {
			padding: 1rem;
		}

		.exact-positions {
			gap: 0.25rem;
		}

		.letter-input {
			width: 2.5rem;
			height: 2.5rem;
			font-size: 1.2rem;
		}

		.wrong-positions {
			grid-template-columns: 1fr;
		}

		.actions {
			flex-direction: column;
		}

		.words-grid {
			grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		}
	}
</style>
