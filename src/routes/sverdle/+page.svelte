<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	const MAX_CHARS = 8;
	const wordList = data.wordList;

	let chars = Array(MAX_CHARS).fill('');
	let results: string[] = [];

	function generateWords() {
		const inputChars = chars.filter(Boolean);
		if (inputChars.length < 1) {
			alert('Voer ten minste 1 karakter in.');
			return;
		}

		// Filter words that contain only a subset of the available characters
		// The first character (mandatory) must always be present in the word
		results = wordList.filter(word => {
			// Convert word to lowercase for comparison
			const normalizedWord = word.toLowerCase();
			
			// Count characters, treating 'ij' as a single character
			const charCount = normalizedWord.replace(/ij/g, 'x').length;
			if (charCount < 4) return false; // Only words with at least 4 characters
			
			// Check if mandatory first character is present in the word
			const mandatoryChar = inputChars[0].toLowerCase();
			if (!normalizedWord.includes(mandatoryChar)) {
				return false; // Mandatory character must be present
			}
			
			// Get unique characters from the word (treating 'ij' as single unit)
			const wordCharsSet = new Set<string>();
			let i = 0;
			while (i < normalizedWord.length) {
				if (i < normalizedWord.length - 1 && normalizedWord.substring(i, i + 2) === 'ij') {
					wordCharsSet.add('ij');
					i += 2;
				} else {
					wordCharsSet.add(normalizedWord[i]);
					i += 1;
				}
			}
			
			// Convert input characters to lowercase set
			const availableCharsSet = new Set(inputChars.map(char => char.toLowerCase()));
			
			// Check if all unique characters in the word are available in input
			for (const wordChar of wordCharsSet) {
				if (!availableCharsSet.has(wordChar)) {
					return false; // Word contains a character not in input
				}
			}
			
			return true;
		});		// Sort results by length (shorter words first)
		results.sort((a, b) => a.length - b.length);
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		const input = event.target as HTMLInputElement;
		
		if (event.key === 'Backspace' && input.value === '' && index > 0) {
			event.preventDefault();
			chars[index] = '';
			const prevInput = document.querySelectorAll('input')[index - 1] as HTMLInputElement;
			prevInput.focus();
			prevInput.setSelectionRange(0, prevInput.value.length);
		}
	}

	function handleInput(event: InputEvent, index: number) {
		const input = event.target as HTMLInputElement;
		const value = input.value.toLowerCase();
		console.log(`Input at index ${index}: ${value}`, {event});

		if (value === '' && event.inputType === 'deleteContentBackward') {
			chars[index] = '';
			if (index > 0) {
				const prevInput = document.querySelectorAll('input')[index - 1] as HTMLInputElement;
				prevInput.focus();
				prevInput.setSelectionRange(0, prevInput.value.length);
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
					const nextInput = document.querySelectorAll('input')[index + 1] as HTMLInputElement;
					nextInput.focus();
					nextInput.setSelectionRange(0, nextInput.value.length);
				}
			}
		} else if (value.length === 2) {
			if (value === 'ij') {
				chars[index] = value;
				if (index < chars.length - 1) {
					const nextInput = document.querySelectorAll('input')[index + 1] as HTMLInputElement;
					nextInput.focus();
					nextInput.setSelectionRange(0, nextInput.value.length);
				}
			} else {
				chars[index] = value[0];
				if (index < chars.length - 1) {
					chars[index + 1] = value[1];
					const nextInput = document.querySelectorAll('input')[index + 1] as HTMLInputElement;
					nextInput.focus();
					nextInput.setSelectionRange(0, nextInput.value.length);
				}
			}
		}
	}

	console.log('Loaded wordList:', wordList);
</script>

<svelte:head>
	<title>Spelwijsheid</title>
</svelte:head>

<h1>Spelwijsheid - Spelwijzer Oplossingen</h1>

<fieldset>
	<legend>Voer maximaal {MAX_CHARS} karakters in:</legend>
	<div>
		{#each chars as char, index}
			<input
				bind:value={char}
				maxlength={index === 0 ? 1 : 2}
				placeholder={index === 0 ? 'Verplichte letter' : `Letter ${index + 1}`}
				class:selected={index === 0}
				on:input={(event: Event) => handleInput(event as InputEvent, index)}
				on:keydown={(event: KeyboardEvent) => handleKeydown(event, index)}
			/>
		{/each}
	</div>
	<button id="generate-button" on:click={generateWords}>Generate Words</button>
</fieldset>

{#if results.length > 0}
	<h2>Genereer woorden:</h2>
	<ul>
		{#each results as word}
			<li>{word}</li>
		{/each}
	</ul>
{:else}
	<p>Nog geen woorden gegenereerd.</p>
{/if}

<style>
	h1 {
		text-align: center;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	input {
		padding: 0.5rem;
		font-size: 1rem;
		width: 100%;
		max-width: 300px;
	}

	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	h2 {
		margin-top: 2rem;
		text-align: center;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		background-color: #f8f9fa;
		margin: 0.5rem 0;
		padding: 0.5rem;
		border-radius: 0.25rem;
	}

	input.selected {
		border-color: cadetblue;
		border-width: 3px;
	}
</style>
