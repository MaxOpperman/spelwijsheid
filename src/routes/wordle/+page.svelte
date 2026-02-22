<script lang="ts">
	import { enhance } from '$app/forms';
	import { confetti } from '@neoconfetti/svelte';
	import type { PageData } from './$types';
	import { MediaQuery } from 'svelte/reactivity';
	import StatsPanel from './StatsPanel.svelte';
	import { t } from '$lib/i18n';

	interface FormData {
		badGuess?: boolean;
	}

	interface Props {
		data: PageData;
		form: FormData | null;
	}
	let { data, form = $bindable() }: Props = $props();

	/** Track loading state */
	let isLoading = $state(false);

	/** Whether the user prefers reduced motion */
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	/** Whether or not the user has won */
	let won = $derived(data.answers.at(-1) === 'x'.repeat(data.wordLength));

	/** The index of the current guess */
	let i = $derived(won ? -1 : data.answers.length);

	/** The current guess */
	let currentGuess = $derived(data.guesses[i] || '');

	/** Whether the current guess can be submitted */
	let submittable = $derived(currentGuess.length === data.wordLength);

	/** Whether the current answer uses the Unicode digraph ĳ */
	let answerUsesDigraph = $derived(data.answerUsesDigraph);

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
		data.answers.forEach((answer, i) => {
			const guess = data.guesses[i];
			for (let i = 0; i < data.wordLength; i += 1) {
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

	/**
	 * Modify the game state without making a trip to the server,
	 * if client-side JavaScript is enabled
	 */
	function update(event: MouseEvent) {
		event.preventDefault();
		const key = (event.target as HTMLButtonElement).getAttribute('data-key');

		if (key === 'backspace') {
			// If the answer uses the digraph, treat ĳ as a single backspace target
			if (answerUsesDigraph && currentGuess.slice(-1) === 'ĳ') {
				currentGuess = currentGuess.slice(0, -1) + 'i';
			} else {
				currentGuess = currentGuess.slice(0, -1);
			}
			if (form?.badGuess) form.badGuess = false;
		} else if (currentGuess.length < data.wordLength) {
			// Special case for Dutch ĳ digraph: only convert if the answer actually uses the digraph
			if (answerUsesDigraph && currentGuess.slice(-1) === 'i' && key === 'j') {
				currentGuess = currentGuess.slice(0, -1) + 'ĳ';
			} else {
				currentGuess += key;
			}
		} else if (
			currentGuess.length === data.wordLength &&
			currentGuess.slice(-1) === 'i' &&
			key === 'j'
		) {
			if (answerUsesDigraph) {
				currentGuess = currentGuess.slice(0, -1) + 'ĳ';
			} else {
				// If digraph is not used, treat 'i'+'j' as two characters; append 'j'
				currentGuess += 'j';
			}
		}
	}

	/**
	 * Trigger form logic in response to a keydown event, so that
	 * desktop users can use the keyboard to play the game
	 */
	function keydown(event: KeyboardEvent) {
		if (event.metaKey) return;

		if (event.key === 'Enter' && !submittable) return;

		document
			.querySelector(`[data-key="${event.key}" i]`)
			?.dispatchEvent(new MouseEvent('click', { cancelable: true, bubbles: true }));
	}
</script>

<svelte:window onkeydown={keydown} />

<svelte:head>
	<title>Wordle</title>
	<meta name="description" content="Nederlandse Wordle" />
</svelte:head>

<h1 class="visually-hidden">Wordle</h1>

<form
	method="post"
	action="?/enter"
	use:enhance={() => {
		isLoading = true;
		// prevent default callback from resetting the form
		return ({ update }) => {
			update({ reset: false }).finally(() => {
				isLoading = false;
			});
		};
	}}
>
	<a class="how-to-play" href="/wordle/how-to-play">Hoe te spelen</a>

	<div class="header-controls">
		<div class="word-length-selector">
			{#each [4, 5, 6, 7] as length (length)}
				<button
					type="submit"
					formaction="?/changeLength"
					name="length"
					value={length}
					class:selected={data.wordLength === length}
					disabled={data.wordLength === length}
				>
					{length}
				</button>
			{/each}
		</div>

		{#if isLoading}
			<div class="loading-indicator">
				<div class="spinner"></div>
			</div>
		{/if}
	</div>

	<div
		class="grid"
		class:playing={!won}
		class:bad-guess={form?.badGuess}
		style="--word-length: {data.wordLength}"
	>
		{#each Array.from(Array(6).keys()) as row (row)}
			{@const current = row === i}
			<h2 class="visually-hidden">Rij {row + 1}</h2>
			<div class="row" class:current>
				{#each Array.from(Array(data.wordLength).keys()) as column (column)}
					{@const guess = current ? currentGuess : data.guesses[row]}
					{@const answer = data.answers[row]?.[column]}
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
								(aanwezig)
							{:else if missing}
								(afwezig)
							{:else}
								leeg
							{/if}
						</span>
						<input name="guess" disabled={!current} type="hidden" {value} />
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<div class="controls">
		{#if won || data.answers.length >= 6}
			{#if !won && data.answer}
				<p>{$t('wordle.theAnswerWas', { answer: data.answer })}</p>
			{/if}

			<StatsPanel stats={data.stats} />

			<button data-key="enter" class="restart selected" formaction="?/restart">
				{won ? $t('wordle.youWon') : $t('wordle.gameOver')}
				{$t('wordle.playAgain')}
			</button>
		{:else}
			<div class="keyboard">
				<button data-key="enter" class:selected={submittable} disabled={!submittable}>
					{$t('wordle.enter')}
				</button>

				<button
					onclick={update}
					data-key="backspace"
					formaction="?/update"
					name="key"
					value="backspace"
				>
					{$t('wordle.back')}
				</button>

				{#each ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as row (row)}
					<div class="row">
						{#each row as letter, index (index)}
							<button
								onclick={update}
								data-key={letter}
								class={classnames[letter]}
								disabled={submittable}
								formaction="?/update"
								name="key"
								value={letter}
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
</form>

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
	form {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 1rem;
		flex: 1;
		padding: 2rem 0;
		overflow-y: auto;
	}

	.how-to-play {
		color: var(--color-text);
		text-decoration: none;
		margin-bottom: 0.5rem;
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

	.header-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		max-width: min(100vw, calc(var(--word-length, 5) * 8vh), calc(var(--word-length, 5) * 76px));
		gap: 1rem;
		position: relative;
	}

	.word-length-selector {
		display: flex;
		gap: 0.5rem;
	}

	/* keep the loading indicator visually right-aligned while the selector is centered */
	.loading-indicator {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.word-length-selector button {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-text);
		border-radius: 4px;
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		font-size: 1rem;
	}

	.word-length-selector button.selected {
		background: var(--color-theme-1);
		color: white;
		border-color: var(--color-theme-1);
	}

	.word-length-selector button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.grid {
		--width: min(100vw, calc(var(--word-length, 5) * 8vh), calc(var(--word-length, 5) * 76px));
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
		filter: drop-shadow(3px 3px 10px var(--color-theme-2));
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
		border: 1px solid var(--color-text);
		font-size: calc(0.08 * var(--width));
		border-radius: 2px;
		background: var(--color-bg-1);
		margin: 0;
		color: var(--color-text);
	}

	.letter.missing {
		background: var(--color-bg-0);
		color: var(--color-text);
		opacity: 0.6;
	}

	.letter.exact {
		background: var(--color-theme-2);
		color: white;
		border-color: var(--color-theme-2);
	}

	.letter.close {
		border: 2px solid var(--color-theme-2);
	}

	.selected {
		outline: 2px solid var(--color-theme-1);
	}

	.controls {
		text-align: center;
		justify-content: center;
		width: 100%;
		max-width: min(100vw, calc(var(--word-length, 5) * 8vh), calc(var(--word-length, 5) * 76px));
	}

	.keyboard {
		--gap: 0.2rem;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		height: min(18vh, 10rem);
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
		background-color: var(--color-bg-1);
		color: var(--color-text);
		width: var(--size);
		border: 1px solid var(--color-text);
		border-radius: 2px;
		font-size: calc(var(--size) * 0.5);
		margin: 0;
	}

	.keyboard button.exact {
		background: var(--color-theme-2);
		color: white;
		border-color: var(--color-theme-2);
	}

	.keyboard button.missing {
		opacity: 0.5;
	}

	.keyboard button.close {
		border: 2px solid var(--color-theme-2);
	}

	.keyboard button:focus {
		background: var(--color-theme-1);
		color: white;
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
		background: var(--color-theme-1);
		color: white;
		outline: none;
	}

	.loading-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spinner {
		width: 30px;
		height: 30px;
		border: 3px solid rgba(var(--color-theme-1-rgb, 255, 62, 0), 0.3);
		border-top-color: var(--color-theme-1);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes wiggle {
		0% {
			transform: translateX(0);
		}
		10% {
			transform: translateX(-2px);
		}
		20% {
			transform: translateX(2px);
		}
		30% {
			transform: translateX(-2px);
		}
		40% {
			transform: translateX(2px);
		}
		50% {
			transform: translateX(0);
		}
	}
</style>
