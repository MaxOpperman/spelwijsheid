<script lang="ts">
	import type { PageData } from './$types';
	import generateFilteredWords from '$lib/solver';
	import { SvelteSet } from 'svelte/reactivity';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';

	const base = '';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const isDutch = $derived($locale === 'nl-NL');

	const MAX_CHARS = 8;

	let chars = $state(Array(MAX_CHARS).fill(''));
	let inputRefs: HTMLInputElement[] = [];
	let lowercaseMode = $state(false);
	let ignoreAccents = $state(true);
	let checkedWords = new SvelteSet<string>();
	let sortByLength = $state(true); // true = by length, false = alphabetically

	// Reactive statements to automatically generate words when chars, lowercaseMode, or ignoreAccents change
	let inputChars = $derived(chars.filter(Boolean));
	let wordList = $derived(ignoreAccents ? data.wordList : data.wordListWithAccents);
	let results = $derived.by(() => {
		if (inputChars.length < 1) return [];
		const raw = generateFilteredWords(wordList, inputChars, lowercaseMode);
		// Deduplicate results to avoid duplicate keys in keyed each blocks
		const unique = Array.from(new Set(raw));

		// Sort by length or alphabetically
		if (sortByLength) {
			return unique.sort((a, b) => a.length - b.length || a.localeCompare(b));
		} else {
			return unique.sort((a, b) => a.localeCompare(b));
		}
	});

	function focusInput(index: number) {
		if (inputRefs[index]) {
			inputRefs[index].focus();
			inputRefs[index].setSelectionRange(0, inputRefs[index].value.length);
		}
	}

	function focusNextInput(index: number) {
		if (index < chars.length - 1) {
			focusInput(index + 1);
		}
	}

	function focusPrevInput(index: number) {
		if (index > 0) {
			focusInput(index - 1);
		}
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Backspace' && chars[index] === '' && index > 0) {
			event.preventDefault();
			focusPrevInput(index);
		}
	}

	function handleInput(event: InputEvent, index: number) {
		const input = event.target as HTMLInputElement;
		const value = input.value.toLowerCase();

		if (value === '' && event.inputType === 'deleteContentBackward') {
			chars[index] = '';
			if (index > 0) {
				focusPrevInput(index);
			}
			return;
		}

		if (value.length === 1) {
			chars[index] = value;
			if (isDutch && value === 'i' && index < chars.length) {
				input.maxLength = 2;
			} else {
				input.maxLength = 1;
				if (index < chars.length - 1) {
					focusNextInput(index);
				}
			}
		} else if (value.length === 2) {
			if (isDutch && value === 'ij') {
				chars[index] = value;
				if (index < chars.length - 1) {
					focusNextInput(index);
				}
			} else {
				chars[index] = value[0];
				if (index < chars.length - 1) {
					chars[index + 1] = value[1];
					focusNextInput(index);
				}
			}
		}
	}

	function toggleWordCheck(word: string) {
		if (checkedWords.has(word)) {
			checkedWords.delete(word);
		} else {
			checkedWords.add(word);
		}
	}
</script>

<svelte:head>
	<title>Spelwijsheid</title>
</svelte:head>

<h1>{$t('spelwijzeSolver.title')}</h1>

<div class="help-link">
	<a href="{base}/spelwijze-solver/how-to-play">{$t('spelwijzeSolver.howItWorks')}</a>
</div>

<fieldset>
	<legend>{$t('spelwijzeSolver.enterMax', { n: MAX_CHARS })}</legend>
	<div class="input-grid">
		{#each chars as _char, index (index)}
			<input
				type="text"
				bind:this={inputRefs[index]}
				bind:value={chars[index]}
				maxlength={index === 0 ? 1 : 2}
				placeholder={index === 0 ? '!' : '?'}
				class:selected={index === 0}
				title={index === 0
					? $t('spelwijzeSolver.requiredLetter')
					: $t('spelwijzeSolver.letterN', { n: index + 1 })}
				oninput={(event: Event) => handleInput(event as InputEvent, index)}
				onkeydown={(event: KeyboardEvent) => handleKeydown(event, index)}
			/>
		{/each}
	</div>

	<div class="options">
		<label>
			<input type="checkbox" bind:checked={lowercaseMode} />
			{$t('spelwijzeSolver.caseInsensitive')}
		</label>
		<label>
			<input type="checkbox" bind:checked={ignoreAccents} />
			{$t('spelwijzeSolver.ignoreAccents')}
		</label>

		<div class="sort-control">
			<span class="sort-label">{$t('spelwijzeSolver.sortBy')}</span>
			<div class="toggle-buttons">
				<button type="button" class:active={sortByLength} onclick={() => (sortByLength = true)}>
					{$t('spelwijzeSolver.sortByLength')}
				</button>
				<button type="button" class:active={!sortByLength} onclick={() => (sortByLength = false)}>
					{$t('spelwijzeSolver.sortAlpha')}
				</button>
			</div>
		</div>
	</div>
</fieldset>

<div class="results-section">
	{#if inputChars.length >= 1}
		<h2>{$t('spelwijzeSolver.foundWords', { n: results.length })}</h2>
		{#if results.length > 0}
			<ul>
				{#each results as word (word)}
					<li class:checked={checkedWords.has(word)}>
						<label>
							<input
								type="checkbox"
								checked={checkedWords.has(word)}
								onchange={() => toggleWordCheck(word)}
							/>
							<span>{word}</span>
						</label>
					</li>
				{/each}
			</ul>
		{:else}
			<p>{$t('spelwijzeSolver.noWords')}</p>
		{/if}
	{:else}
		<p>{$t('spelwijzeSolver.enterAtLeast')}</p>
	{/if}
</div>

<style>
	h1 {
		text-align: center;
	}

	fieldset {
		border: 2px solid var(--color-primary-light);
		border-radius: 12px;
		padding: 2rem;
		margin: 2rem auto;
		max-width: 600px;
		background-color: var(--color-surface);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	legend {
		font-weight: 600;
		color: var(--color-primary);
		padding: 0 1rem;
		font-size: 1.1rem;
	}

	.input-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin: 1.5rem 0;
		justify-items: center;
	}

	input[type='text'] {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 3.6rem;
		height: 3.6rem;
		font-size: 1.4rem;
		font-weight: 600;
		text-align: center;
		background-color: var(--color-surface);
		border: 2px solid var(--color-primary-light);
		border-radius: 8px;
		box-sizing: border-box;
		transition: all 0.2s ease;
		color: var(--color-text);
	}

	input[type='text']:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-light);
		background-color: var(--color-bg-2);
	}

	h2 {
		margin-top: 2rem;
		text-align: center;
	}

	.results-section {
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	ul {
		list-style-type: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	li {
		background-color: var(--color-surface);
		border: 1px solid var(--color-primary-light);
		margin: 0;
		padding: 0;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		color: var(--color-text);
		overflow: hidden;
	}

	li label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		cursor: pointer;
		width: 100%;
		box-sizing: border-box;
	}

	li label input[type='checkbox'] {
		width: 1.1rem;
		height: 1.1rem;
		cursor: pointer;
		accent-color: var(--color-primary);
		flex-shrink: 0;
	}

	li:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
		background-color: var(--color-primary-light);
	}

	/* Checked state must come after hover to override */
	li.checked {
		opacity: 0.5;
		background-color: var(--color-bg-0);
		border-color: rgba(128, 128, 128, 0.3);
	}

	li.checked:hover {
		transform: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		background-color: var(--color-bg-0);
	}

	li.checked label {
		cursor: default;
		pointer-events: none;
	}

	li.checked label input[type='checkbox'] {
		pointer-events: auto;
		cursor: pointer;
	}

	input[type='text'].selected {
		border-color: var(--color-accent);
		border-width: 3px;
		background-color: rgba(5, 150, 105, 0.05);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.options {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
		padding: 0 0.5rem;
	}

	.options label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 1rem;
		cursor: pointer;
		color: var(--color-text);
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.options label:hover {
		color: var(--color-primary);
	}

	.options input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		accent-color: var(--color-primary);
	}

	.sort-control {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.sort-label {
		font-size: 1rem;
		color: var(--color-text);
		font-weight: 500;
	}

	.toggle-buttons {
		display: flex;
		gap: 0;
		border: 2px solid var(--color-primary-light);
		border-radius: 8px;
		overflow: hidden;
	}

	.toggle-buttons button {
		padding: 0.5rem 1.25rem;
		background-color: var(--color-surface);
		color: var(--color-text);
		border: none;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s ease;
		border-right: 1px solid var(--color-primary-light);
	}

	.toggle-buttons button:last-child {
		border-right: none;
	}

	.toggle-buttons button:hover {
		background-color: var(--color-primary-light);
	}

	.toggle-buttons button.active {
		background-color: var(--color-primary);
		color: white;
		font-weight: 600;
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
</style>
