<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { capitalizeFirstChar } from '$lib/utils';
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';

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

	function textColor(index: number) {
		return index >= 3 ? '#fff' : '#1e3a5f';
	}
</script>

<svelte:head>
	<title>Pinpoint - Spelwijsheid</title>
	<meta name="description" content="Guess the word from progressive clues" />
</svelte:head>

<div class="page">
	<div class="how-to-play-wrap">
		<a class="how-to-play" href="/pinpoint/how-to-play">{$t('common.howToPlay')}</a>
	</div>
	<h1>Pinpoint</h1>
	<p class="subtitle">{$t('pinpoint.subtitle')}</p>

	{#if isGenerating}
		<div class="generating">
			<span class="spinner"></span>
			{$t('pinpoint.generating')}
		</div>
	{:else if !data.started}
		<div class="welcome">
			<p class="welcome-desc">
				{$t('pinpoint.welcomeDesc')}
			</p>
			<form
				method="POST"
				action="?/startGame"
				use:enhance={() => {
					isGenerating = true;
					return async ({ update }) => {
						await update();
						isGenerating = false;
					};
				}}
			>
				<button type="submit" class="start-btn">{$t('pinpoint.startGame')}</button>
			</form>
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
					{#if revealed}
						<span class="clue-text">{capitalizeFirstChar(clue)}</span>
					{:else if data.solved}
						<span class="clue-bonus">✓ {capitalizeFirstChar(clue)}</span>
					{:else}
						<span class="clue-placeholder">{$t('pinpoint.clue', { n: i + 1 })}</span>
					{/if}
				</div>
			{/each}

			{#if data.solved}
				<div class="band answer-band" style:background-color="#bfdbfe" style:color="#1e3a5f">
					<span class="answer-text">✓ {capitalizeFirstChar(data.word)}!</span>
				</div>
			{:else if data.failed}
				<div class="band failed-band">
					<span class="answer-text"
						>{$t('pinpoint.theAnswerWas', { word: capitalizeFirstChar(data.word) })}</span
					>
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
				<span class="clue-counter">{$t('pinpoint.clueCounter', { revealed: data.revealed })}</span>
				<button type="submit" disabled={isGuessing || !guessValue.trim()}
					>{$t('pinpoint.guess')}</button
				>
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
				<button type="submit" class="new-game-btn">{$t('common.newGame')}</button>
			</form>
			<form method="POST" action="?/pausePlaying" use:enhance>
				<button type="submit" class="pause-playing-btn">
					<i class="fa-solid fa-circle-pause"></i>
					{$t('pinpoint.pausePlaying')}
				</button>
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

	.how-to-play {
		display: inline-block;
		color: var(--color-primary);
		text-decoration: none;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.how-to-play-wrap {
		text-align: center;
		margin-bottom: 0.75rem;
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
		border: 1.5px solid var(--color-primary);
		border-radius: 50%;
		text-align: center;
		margin: 0 0.5em 0 0;
	}

	h1 {
		font-size: 1.8rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
		color: var(--color-text);
	}

	.subtitle {
		color: var(--color-text-light);
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

	.clue-bonus {
		background: rgba(255, 255, 255, 0.92);
		color: #1e3a5f;
		border-radius: 6px;
		padding: 0.3rem 0.9rem;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.01em;
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
		background-color: var(--color-warning) !important;
		color: var(--color-surface) !important;
	}

	/* Previous wrong guesses */
	.previous-guesses {
		color: var(--color-text-muted);
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
		border: 1px solid var(--color-primary-light);
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		background: var(--color-surface);
	}

	.guess-form input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
		font-family: inherit;
		background: transparent;
		color: var(--color-text);
	}

	.clue-counter {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.guess-form button {
		background: transparent;
		border: none;
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-primary);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		transition: background 0.15s;
	}

	.guess-form button:hover:not(:disabled) {
		background: var(--color-primary-light);
	}

	.guess-form button:disabled {
		color: var(--color-text-muted);
		cursor: not-allowed;
	}

	.new-game-btn {
		flex: 1;
		text-align: center;
		font-size: 1rem !important;
		color: var(--color-primary) !important;
	}

	.pause-playing-btn {
		display: block;
		width: 100%;
		text-align: center;
		background: none;
		border: none;
		font-family: inherit;
		font-size: 0.9rem;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.4rem 0;
		margin-top: 0.5rem;
		transition: color 0.15s;
	}

	.pause-playing-btn:hover {
		color: var(--color-text);
	}

	/* Welcome screen */
	.welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem 1rem;
		text-align: center;
	}

	.welcome-desc {
		color: var(--color-text-light);
		font-size: 1rem;
		line-height: 1.6;
		max-width: 400px;
		margin: 0;
	}

	.start-btn {
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 2.5rem;
		font-size: 1.1rem;
		font-weight: 700;
		font-family: inherit;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.start-btn:hover {
		opacity: 0.88;
	}

	/* Generating spinner */
	.generating {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--color-text-light);
		font-size: 1rem;
		padding: 2rem 0;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 3px solid var(--color-bg-2);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
