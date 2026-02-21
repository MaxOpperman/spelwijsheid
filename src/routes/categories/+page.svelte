<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { capitalizeFirstChar } from '$lib/utils';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data = $bindable() }: Props = $props();

	let guessValue = $state('');
	let isGuessing = $state(false);
	let isGenerating = $state(false);
	let guessInput = $state<HTMLInputElement | undefined>(undefined);

	function focusInput(node: HTMLInputElement) {
		node.focus();
	}

	// band colors light → dark
	const bandColors = [
		'#bfdbfe', // lightest
		'#93c5fd',
		'#60a5fa',
		'#3b82f6',
		'#1d4ed8' // darkest
	];

	// text color on dark bands
	function textColor(index: number) {
		return index >= 3 ? '#fff' : '#1e3a5f';
	}
</script>

<svelte:head>
	<title>Categories – Spelwijsheid</title>
	<meta name="description" content="Guess the word from progressive clues" />
</svelte:head>

<div class="page">
	<h1>Categories</h1>
	<p class="subtitle">Guess the word. A new clue reveals after every wrong answer.</p>

	{#if isGenerating}
		<div class="generating">
			<span class="spinner"></span>
			Generating a new puzzle…
		</div>
	{:else}
		<div class="board">
			{#each data.clues as clue, i (i)}
				{@const revealed = i < data.revealed}
				{@const isAnswer = (data.solved || data.failed) && i === data.revealed - 1 && data.solved}
				<div
					class="band"
					class:revealed
					class:answer-band={isAnswer}
					style:background-color={bandColors[i]}
					style:color={textColor(i)}
				>
					{#if data.solved && i === data.clues.length - 1 && data.revealed <= data.clues.length}
						<!-- only show answer row once, handled below -->
					{/if}
					{#if revealed}
						<span class="clue-text">{capitalizeFirstChar(clue)}</span>
					{:else}
						<span class="clue-placeholder">CLUE {i + 1}</span>
					{/if}
				</div>
			{/each}

			{#if data.solved}
				<div class="band answer-band" style:background-color="#bfdbfe" style:color="#1e3a5f">
					<span class="answer-text">✓ {capitalizeFirstChar(data.word)}!</span>
				</div>
			{:else if data.failed}
				<div class="band failed-band">
					<span class="answer-text">The answer was: {capitalizeFirstChar(data.word)}</span>
				</div>
			{/if}
		</div>

		{#if data.previousGuesses.length > 0}
			<p class="previous-guesses">
				{#each data.previousGuesses as g, i (i)}
					<s>{g}</s>{#if i < data.previousGuesses.length - 1}<span class="sep">, </span>{/if}
				{/each}
			</p>
		{/if}

		{#if !data.solved && !data.failed}
			<form
				method="POST"
				action="?/guess"
				class="guess-form"
				use:enhance={() => {
					isGuessing = true;
					return async ({ update }) => {
						await update();
						guessValue = '';
						isGuessing = false;
						await tick();
						guessInput?.focus();
					};
				}}
			>
				<input
					type="text"
					name="guess"
					bind:value={guessValue}
					bind:this={guessInput}
					use:focusInput
					placeholder="Guess the category…"
					autocomplete="off"
					disabled={isGuessing}
				/>
				<span class="clue-counter">{data.revealed} of 5</span>
				<button type="submit" disabled={isGuessing || !guessValue.trim()}>Guess</button>
			</form>
		{:else}
			<form
				method="POST"
				action="?/newGame"
				class="guess-form"
				use:enhance={() => {
					isGenerating = true;
					return async ({ update }) => {
						await update();
						isGenerating = false;
					};
				}}
			>
				<button type="submit" class="new-game-btn">New Game</button>
			</form>
		{/if}
	{/if}
</div>

<style>
	.page {
		max-width: 560px;
		margin: 2rem auto;
		padding: 1rem;
		font-family: inherit;
	}

	h1 {
		font-size: 1.8rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
		color: #1e3a5f;
	}

	.subtitle {
		color: #666;
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}

	/* Board */
	.board {
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
		margin-bottom: 1rem;
	}

	.band {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.25rem;
		min-height: 3.25rem;
		transition: background-color 0.3s;
	}

	.clue-text {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.clue-placeholder {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		opacity: 0.65;
	}

	.answer-band {
		font-size: 1.3rem;
		font-weight: 700;
	}

	.answer-text {
		font-size: 1.2rem;
		font-weight: 700;
	}

	.failed-band {
		background-color: #f87171 !important;
		color: #fff !important;
	}

	/* Previous wrong guesses */
	.previous-guesses {
		color: #888;
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
		min-height: 1.4rem;
	}

	.sep {
		margin-right: 0.15rem;
	}

	/* Guess form */
	.guess-form {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		background: #fff;
	}

	.guess-form input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
		font-family: inherit;
		background: transparent;
		color: #1e3a5f;
	}

	.clue-counter {
		font-size: 0.85rem;
		color: #aaa;
		white-space: nowrap;
	}

	.guess-form button {
		background: transparent;
		border: none;
		font-size: 1rem;
		font-weight: 700;
		color: #1d4ed8;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		transition: background 0.15s;
	}

	.guess-form button:hover:not(:disabled) {
		background: #eff6ff;
	}

	.guess-form button:disabled {
		color: #ccc;
		cursor: not-allowed;
	}

	.new-game-btn {
		flex: 1;
		text-align: center;
		font-size: 1rem !important;
		color: #1d4ed8 !important;
	}

	/* Generating spinner */
	.generating {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #666;
		font-size: 1rem;
		padding: 2rem 0;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 3px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Dark mode */
	@media (prefers-color-scheme: dark) {
		h1 {
			color: #e0f2fe;
		}
		.subtitle {
			color: #aaa;
		}
		.previous-guesses {
			color: #999;
		}

		.guess-form {
			background: #1e293b;
			border-color: #334155;
		}

		.guess-form input {
			color: #e0f2fe;
		}

		.guess-form button {
			color: #60a5fa;
		}

		.guess-form button:hover:not(:disabled) {
			background: #1e3a5f;
		}

		.generating {
			color: #aaa;
		}
	}
</style>
