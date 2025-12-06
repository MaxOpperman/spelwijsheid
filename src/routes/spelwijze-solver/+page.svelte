<script lang="ts">
	import type { PageData } from './$types';
	import generateFilteredWords from '$lib/solver';

	const base = '';

	export let data: PageData;

	const MAX_CHARS = 8;

	let chars = Array(MAX_CHARS).fill('');
	let inputRefs: HTMLInputElement[] = [];
	let lowercaseMode = false;
	let ignoreAccents = true;

	// Reactive statements to automatically generate words when chars, lowercaseMode, or ignoreAccents change
	$: inputChars = chars.filter(Boolean);
	$: wordList = ignoreAccents ? data.wordList : data.wordListWithAccents;
	$: results = (() => {
		if (inputChars.length < 1) return [];
		const raw = generateFilteredWords(wordList, inputChars, lowercaseMode);
		// Deduplicate results to avoid duplicate keys in keyed each blocks
		return Array.from(new Set(raw));
	})();

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
			if (value === 'i' && index < chars.length) {
				input.maxLength = 2;
			} else {
				input.maxLength = 1;
				if (index < chars.length - 1) {
					focusNextInput(index);
				}
			}
		} else if (value.length === 2) {
			if (value === 'ij') {
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
</script>

<svelte:head>
	<title>Spelwijsheid</title>
</svelte:head>

<h1>Spelwijsheid - Spelwijze Oplossingen</h1>

<div class="help-link">
	<a href="{base}/spelwijze-solver/how-to-play">Hoe werkt de Spelwijze Solver?</a>
</div>

<fieldset>
	<legend>Voer maximaal {MAX_CHARS} karakters in:</legend>
	<div class="input-grid">
		{#each chars as char, index (index)}
			<input
				type="text"
				bind:this={inputRefs[index]}
				bind:value={char}
				maxlength={index === 0 ? 1 : 2}
				placeholder={index === 0 ? '!' : '?'}
				class:selected={index === 0}
				title={index === 0 ? 'Verplichte letter' : `Letter ${index + 1}`}
				on:input={(event: Event) => handleInput(event as InputEvent, index)}
				on:keydown={(event: KeyboardEvent) => handleKeydown(event, index)}
			/>
		{/each}
	</div>

	<div class="options">
		<label>
			<input type="checkbox" bind:checked={lowercaseMode} />
			Hoofdletterongevoelig zoeken
		</label>
		<label>
			<input type="checkbox" bind:checked={ignoreAccents} />
			Negeer accenten (bijv. ü → u)
		</label>
	</div>
</fieldset>

<div class="results-section">
	{#if inputChars.length >= 1}
		<h2>Gevonden woorden ({results.length}):</h2>
		{#if results.length > 0}
			<ul>
				{#each results as word (word)}
					<li>{word}</li>
				{/each}
			</ul>
		{:else}
			<p>Geen woorden gevonden met deze letters.</p>
		{/if}
	{:else}
		<p>Voer ten minste 1 karakter in om woorden te genereren.</p>
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
		padding: 0.75rem;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		color: var(--color-text);
	}

	li:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
		background-color: var(--color-primary-light);
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
