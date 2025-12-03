<script lang="ts">
	import { confetti } from '@neoconfetti/svelte';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { MediaQuery } from 'svelte/reactivity';
	import { Game } from './game';

	// Get base path - empty in dev, /Spelwijsheid in production
	const base = dev ? '' : '/Spelwijsheid';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	/** Whether the user prefers reduced motion */
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	/** Get the appropriate word list for the given word length */
	function getWordList(length: number): string[] {
		switch (length) {
			case 4:
				return data.wordList4;
			case 5:
				return data.wordList5;
			case 6:
				return data.wordList6;
			case 7:
				return data.wordList7;
			default:
				return data.wordList5;
		}
	}

	let wordLength = $state(5);
	let game = $state<Game | null>(null);
	let badGuess = $state(false);

	/** Whether or not the user has won */
	let won = $derived(game?.answers.at(-1) === 'x'.repeat(wordLength));

	/** The index of the current guess */
	let i = $derived(won ? -1 : (game?.answers.length ?? 0));

	/** The current guess */
	let currentGuess = $derived(game?.guesses[i] || '');

	/** Whether the current answer uses the Unicode digraph ĳ */
	let answerUsesDigraph = $derived((game?.answer ?? '').includes('ĳ'));
	/** Whether the current guess can be submitted */
	let submittable = $derived(currentGuess.length === wordLength);

	const { classnames, description } = $derived.by(() => {
		/**
		 * A map of classnames for all letters that have been guessed,
		 * used for styling the keyboard
		 */
		let classnames: Record<string, 'exact' | 'close' | 'missing'> = {};
		/**
		 * A map of descriptions for all letters that have been guessed,
		 * used for adding text for assistive technology (e.g. screen readers)
		 */
		let description: Record<string, string> = {};
		if (!game) return { classnames, description };

		game.answers.forEach((answer, i) => {
			const guess = game ? game.guesses[i] : '';
			for (let i = 0; i < wordLength; i += 1) {
				const letter = guess[i];
				if (answer[i] === 'x') {
					classnames[letter] = 'exact';
					description[letter] = 'correct';
				} else if (!classnames[letter]) {
					classnames[letter] = answer[i] === 'c' ? 'close' : 'missing';
					description[letter] = answer[i] === 'c' ? 'present' : 'absent';
				}
			}
		});
		return { classnames, description };
	});

	onMount(() => {
		// Load game from localStorage or create new one
		const storageKey = `wordle-${wordLength}`;
		const saved = localStorage.getItem(storageKey);
		const currentWordList = getWordList(wordLength);
		game = new Game(saved ?? undefined, currentWordList, wordLength);
	});

	function changeWordLength(newLength: number) {
		wordLength = newLength;
		const storageKey = `wordle-${wordLength}`;
		const saved = localStorage.getItem(storageKey);
		const currentWordList = getWordList(wordLength);
		game = new Game(saved ?? undefined, currentWordList, wordLength);
	}

	function saveGame() {
		if (game) {
			const storageKey = `wordle-${wordLength}`;
			localStorage.setItem(storageKey, game.toString());
		}
	}

	/**
	 * Update the game state when a key is pressed
	 */
	function update(key: string) {
		if (!game) return;

		const currentIndex = game.answers.length;

		if (key === 'backspace') {
			// If the answer uses the digraph, treat ĳ as a single backspace target
			if (answerUsesDigraph && game.guesses[currentIndex].slice(-1) === 'ĳ') {
				game.guesses[currentIndex] = game.guesses[currentIndex].slice(0, -1) + 'i';
			} else {
				game.guesses[currentIndex] = game.guesses[currentIndex].slice(0, -1);
			}
			if (badGuess) badGuess = false;
		} else if (game.guesses[currentIndex].length < 5) {
			// Special case for Dutch ĳ digraph: only convert if the answer actually uses the digraph
			if (answerUsesDigraph && game.guesses[currentIndex].slice(-1) === 'i' && key === 'j') {
				game.guesses[currentIndex] = game.guesses[currentIndex].slice(0, -1) + 'ĳ';
			} else {
				game.guesses[currentIndex] += key;
			}
		} else if (
			game.guesses[currentIndex].length === 5 &&
			game.guesses[currentIndex].slice(-1) === 'i' &&
			key === 'j'
		) {
			if (answerUsesDigraph) {
				game.guesses[currentIndex] = game.guesses[currentIndex].slice(0, -1) + 'ĳ';
			} else {
				// If digraph is not used, treat 'i'+'j' as two characters; append 'j'
				game.guesses[currentIndex] += 'j';
			}
		}

		// Create new Game instance to trigger reactivity
		const serialized = game.toString();
		const currentWordList = getWordList(wordLength);
		game = new Game(serialized, currentWordList, wordLength);
		saveGame();
	} /**
	 * Submit the current guess
	 */
	function enter() {
		if (!game || !submittable) return;

		const guess = game.guesses[game.answers.length].split('');
		const valid = game.enter(guess);

		if (!valid) {
			badGuess = true;
		} else {
			badGuess = false;
		}

		// Create new Game instance to trigger reactivity
		const serialized = game.toString();
		const currentWordList = getWordList(wordLength);
		game = new Game(serialized, currentWordList, wordLength);
		saveGame();
	} /**
	 * Restart the game
	 */
	function restart() {
		if (!game) return;
		const storageKey = `wordle-${wordLength}`;
		localStorage.removeItem(storageKey);
		const currentWordList = getWordList(wordLength);
		game = new Game(undefined, currentWordList, wordLength);
		badGuess = false;
		saveGame();
	}

	/**
	 * Handle button clicks
	 */
	function handleClick(event: MouseEvent) {
		const key = (event.target as HTMLButtonElement).getAttribute('data-key');
		if (!key) return;

		if (key === 'enter') {
			enter();
		} else {
			update(key);
		}
	}

	/**
	 * Trigger form logic in response to a keydown event, so that
	 * desktop users can use the keyboard to play the game
	 */
	function keydown(event: KeyboardEvent) {
		if (event.metaKey) return;

		if (event.key === 'Enter') {
			if (submittable) enter();
			return;
		}

		if (event.key === 'Backspace') {
			update('backspace');
			return;
		}

		if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
			update(event.key.toLowerCase());
		}
	}
</script>

<svelte:window onkeydown={keydown} />

<svelte:head>
	<title>Wordle</title>
	<meta name="description" content="A Wordle clone written in SvelteKit" />
</svelte:head>

<h1 class="visually-hidden">Wordle</h1>

<div class="wordle-container">
	<a class="how-to-play" href="{base}/wordle/how-to-play">Hoe te spelen</a>

	<!-- Word length selector -->
	<div class="word-length-selector">
		<button class:active={wordLength === 4} onclick={() => changeWordLength(4)}> 4 letters </button>
		<button class:active={wordLength === 5} onclick={() => changeWordLength(5)}> 5 letters </button>
		<button class:active={wordLength === 6} onclick={() => changeWordLength(6)}> 6 letters </button>
		<button class:active={wordLength === 7} onclick={() => changeWordLength(7)}> 7 letters </button>
	</div>

	<!-- Indicator showing whether the answer uses the ĳ digraph -->
	{#if game}
		<div class="digraph-indicator" aria-live="polite">
			{#if answerUsesDigraph}
				<span class="badge digraph">Gebruikt ĳ (digraph)</span>
			{:else}
				<span class="badge separate">Gebruikt i + j (apart)</span>
			{/if}
		</div>
	{/if}

	{#if game}
		<div
			class="grid"
			class:playing={!won}
			class:bad-guess={badGuess}
			style="--word-length: {wordLength}"
		>
			{#each Array.from(Array(6).keys()) as row (row)}
				{@const current = row === i}
				<h2 class="visually-hidden">Row {row + 1}</h2>
				<div class="row" class:current>
					{#each Array.from(Array(wordLength).keys()) as column (column)}
						{@const guess = current ? currentGuess : game.guesses[row]}
						{@const answer = game.answers[row]?.[column]}
						{@const value = guess?.[column] ?? ''}
						{@const selected = current && column === guess.length}
						{@const exact = answer === 'x'}
						{@const close = answer === 'c'}
						{@const missing = answer === '_'}
						<div class="letter" class:exact class:close class:missing class:selected>
							{value}
							<span class="visually-hidden">
								{#if exact}
									(correct)
								{:else if close}
									(present)
								{:else if missing}
									(absent)
								{:else}
									empty
								{/if}
							</span>
						</div>
					{/each}
				</div>
			{/each}
		</div>

		<div class="controls">
			{#if won || game.answers.length >= 6}
				{#if !won && game.answer}
					<p>het antwoord was "{game.answer}"</p>
				{/if}
				<button onclick={restart} class="restart selected">
					{won ? 'je hebt gewonnen :)' : `spel afgelopen :(`} opnieuw spelen?
				</button>
			{:else}
				<div class="keyboard">
					<button
						onclick={handleClick}
						data-key="enter"
						class:selected={submittable}
						disabled={!submittable}>enter</button
					>

					<button onclick={handleClick} data-key="backspace"> terug </button>

					{#each ['qwertyuiop', 'asdfghjklĳ', 'zxcvbnm'] as row (row)}
						<div class="row">
							{#each row as letter, index (index)}
								<button
									onclick={handleClick}
									data-key={letter}
									class={classnames[letter]}
									disabled={submittable}
									aria-label="{letter} {description[letter] || ''}"
								>
									{letter}
								</button>
							{/each}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if won}
	<div
		style="position: absolute; left: 50%; top: 30%"
		use:confetti={{
			particleCount: reducedMotion.current ? 0 : undefined,
			force: 0.7,
			stageWidth: window.innerWidth,
			stageHeight: window.innerHeight,
			colors: ['#ff3e00', '#40b3ff', '#676778']
		}}
	></div>
{/if}

<style>
	.wordle-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex: 1;
	}

	.how-to-play {
		color: var(--color-text);
	}

	.word-length-selector {
		display: flex;
		gap: 0.5rem;
		margin: 0.5rem 0;
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

	.how-to-play::before {
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

	.grid {
		--width: min(100vw, 40vh, 380px);
		max-width: var(--width);
		align-self: center;
		justify-self: center;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.grid .row {
		display: grid;
		grid-template-columns: repeat(var(--word-length, 5), 1fr);
		grid-gap: 0.2rem;
		margin: 0 0 0.2rem 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.grid.bad-guess .row.current {
			animation: wiggle 0.5s;
		}
	}

	.grid.playing .row.current {
		filter: drop-shadow(3px 3px 10px var(--color-bg-0));
	}

	.letter {
		aspect-ratio: 1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		box-sizing: border-box;
		text-transform: lowercase;
		border: none;
		font-size: calc(0.08 * var(--width));
		border-radius: 2px;
		background: var(--color-surface);
		margin: 0;
		color: var(--color-text);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.letter.missing {
		background: rgba(255, 255, 255, 0.5);
		color: var(--color-text);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.letter.exact {
		background: var(--color-accent);
		color: var(--color-text);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.letter.close {
		border: 2px solid var(--color-accent);
		color: var(--color-text);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.selected {
		outline: 2px solid var(--color-primary);
		color: var(--color-text);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.controls {
		text-align: center;
		justify-content: center;
		height: min(18vh, 10rem);
	}

	.keyboard {
		--gap: 0.2rem;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		height: 100%;
	}

	.keyboard .row {
		display: flex;
		justify-content: center;
		gap: 0.2rem;
		flex: 1;
	}

	.keyboard button,
	.keyboard button:disabled {
		--size: min(8vw, 4vh, 40px);
		background-color: var(--color-surface);
		color: var(--color-text);
		width: var(--size);
		border: none;
		border-radius: 2px;
		font-size: calc(var(--size) * 0.5);
		margin: 0;
	}

	.keyboard button.exact {
		background: var(--color-accent);
		color: var(--color-surface);
	}

	.keyboard button.missing {
		opacity: 0.5;
	}

	.keyboard button.close {
		border: 2px solid var(--color-accent);
	}

	.keyboard button:focus {
		background: var(--color-primary);
		color: var(--color-text);
		outline: none;
	}

	.keyboard button[data-key='enter'],
	.keyboard button[data-key='backspace'] {
		position: absolute;
		bottom: 0;
		width: calc(1.5 * var(--size));
		height: calc(1 / 3 * (100% - 2 * var(--gap)));
		text-transform: uppercase;
		font-size: calc(0.3 * var(--size));
		padding-top: calc(0.15 * var(--size));
	}

	.keyboard button[data-key='enter'] {
		right: calc(50% + 3.5 * var(--size) + 0.8rem);
	}

	.keyboard button[data-key='backspace'] {
		left: calc(50% + 3.5 * var(--size) + 0.8rem);
	}

	.keyboard button[data-key='enter']:disabled {
		opacity: 0.5;
	}

	.restart {
		width: 100%;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 2px;
		border: none;
	}

	.restart:focus,
	.restart:hover {
		background: var(--color-primary);
		color: var(--color-surface);
		outline: none;
	}

	.digraph-indicator {
		margin-top: -0.5rem;
		margin-bottom: 0.25rem;
		display: flex;
		justify-content: center;
	}

	.badge {
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-bg-0);
	}

	.badge.digraph {
		background: var(--color-accent);
	}

	.badge.separate {
		background: rgba(0, 0, 0, 0.12);
		color: var(--color-text);
	}

	@keyframes wiggle {
		0% {
			transform: translateX(0);
		}
		10% {
			transform: translateX(-2px);
		}
		30% {
			transform: translateX(4px);
		}
		50% {
			transform: translateX(-6px);
		}
		70% {
			transform: translateX(+4px);
		}
		90% {
			transform: translateX(-2px);
		}
		100% {
			transform: translateX(0);
		}
	}
</style>
