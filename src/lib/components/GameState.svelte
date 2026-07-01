<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import generateFilteredWords, { generateRandomChars } from '$lib/solver';
	import WelcomeScreen from './WelcomeScreen.svelte';
	import GameView from './GameView.svelte';
	import { t } from '$lib/i18n';

	export let wordList: string[];
	export let locale: string = 'en-US';

	const SAVE_URL = `${base}/api/games/spelwijze?locale=${encodeURIComponent(locale)}`;

	const MAX_CHARS = 10; // 1 mandatory + up to 9 optional (6-10 total range)

	// Game state
	let chars = Array(MAX_CHARS).fill('');
	let inputChars: string[] = []; // Declare inputChars as a regular variable
	let gameStarted = false;
	let gamePaused = false;
	let foundWords: string[] = [];
	let totalPossibleWords: number;
	let gameComplete = false;
	let score = 0;
	let timeStarted: number | null = null;
	let pausedTime = 0; // Total time paused
	let pauseStartTime: number | null = null;
	let currentTime = Date.now();
	let timer: ReturnType<typeof setInterval> | undefined;
	let gameId = '';
	let wordInput = '';
	let elapsedTime = 0;
	let formattedTime: string;
	let completionPercentage: number;
	let hasSavedGame = false;
	let isReady = false; // Track if component is ready

	// Load game state from the server on mount
	onMount(async () => {
		if (browser) {
			await loadGameFromServer();
			// Only generate new game if no saved game was found
			if (!gameId) {
				generateNewGame();
			}
		}
		isReady = true; // Component is now ready
	});

	function generateNewGame() {
		const newChars = generateRandomChars(wordList);
		chars = [...newChars, ...Array(MAX_CHARS - newChars.length).fill('')];
		gameId = Date.now().toString();
		foundWords = [];
		gameComplete = false;
		gameStarted = false;
		gamePaused = false;
		score = 0;
		timeStarted = null;
		pausedTime = 0;
		pauseStartTime = null;
		wordInput = '';
		if (timer) clearInterval(timer);
		hasSavedGame = true;
		saveGameToServer();
	}

	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	function saveGameToServer() {
		if (!browser || !gameId) return;

		// Debounce: the reactive auto-save fires every second, so coalesce writes.
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(flushGameToServer, 1000);
	}

	function flushGameToServer() {
		if (!browser || !gameId) return;

		const gameState = {
			gameId,
			chars,
			foundWords,
			gameStarted,
			gameComplete,
			gamePaused,
			score,
			timeStarted,
			pausedTime,
			pauseStartTime,
			elapsedTime: timeStarted ? Math.floor((currentTime - timeStarted - pausedTime) / 1000) : 0
		};

		fetch(SAVE_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(gameState)
		}).catch(() => {
			/* best-effort */
		});
	}

	async function loadGameFromServer() {
		if (!browser) return;

		try {
			const res = await fetch(SAVE_URL);
			if (!res.ok) return;
			const { state: gameState } = await res.json();
			if (!gameState) return;

			gameId = gameState.gameId || '';
			chars = gameState.chars || Array(MAX_CHARS).fill('');
			foundWords = gameState.foundWords || [];
			gameStarted = gameState.gameStarted || false;
			gameComplete = gameState.gameComplete || false;
			gamePaused = gameState.gamePaused || false;
			score = gameState.score || 0;
			pausedTime = gameState.pausedTime || 0;
			pauseStartTime = gameState.pauseStartTime || null;
			hasSavedGame = gameId !== '';

			// Restore time state
			if (gameState.timeStarted && gameStarted && !gameComplete) {
				if (gamePaused) {
					// If game was paused when saved, restore the time state without starting timer
					timeStarted = gameState.timeStarted;
					currentTime = Date.now();
				} else {
					// If game was active when saved, adjust time for elapsed time
					timeStarted = Date.now() - gameState.elapsedTime * 1000;
				}
			}
		} catch (e) {
			console.error('Error loading game from server:', e);
		}
	}

	// Start timer when game begins
	function startTimer() {
		if (!timeStarted) {
			timeStarted = Date.now();
			timer = setInterval(() => {
				currentTime = Date.now();
			}, 1000);
		}
	}

	function startGame() {
		if (inputChars.length >= 1) {
			gameStarted = true;
			gamePaused = false; // Ensure we're not paused when starting
			startTimer();
			saveGameToServer();
		}
	}

	function pauseGame() {
		if (!gameStarted || gameComplete || gamePaused) return;
		gamePaused = true;
		gameStarted = false; // Return to welcome screen when paused
		pauseStartTime = Date.now();
		if (timer) {
			clearInterval(timer);
			timer = undefined;
		}
		saveGameToServer();
	}

	function resumeGame() {
		if (gameComplete || !gamePaused) return;
		gamePaused = false;
		gameStarted = true; // Resume the game
		if (pauseStartTime) {
			pausedTime += Date.now() - pauseStartTime;
			pauseStartTime = null;
		}
		// Restart the timer
		timer = setInterval(() => {
			currentTime = Date.now();
		}, 1000);
		saveGameToServer();
	}

	function submitWord() {
		const word = wordInput.toLowerCase().trim().replace(/ij/g, 'ij');
		if (!word) return;

		// Check if word uses only available characters
		const allPossible = generateFilteredWords(wordList, inputChars, false);

		if (allPossible.includes(word)) {
			if (!foundWords.includes(word)) {
				foundWords = [...foundWords, word].sort((a, b) => a.length - b.length);
				saveGameToServer();
			}
		}

		wordInput = '';
	}

	function handleWordInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			submitWord();
		}
	}

	function calculateFinalScore() {
		// Score based on: words found + time bonus + completion bonus
		const wordsBonus = foundWords.length * 10;
		const timeBonus = Math.max(0, 300 - elapsedTime); // Bonus for completing under 5 minutes
		const completionBonus = gameComplete ? 100 : 0;
		score = wordsBonus + timeBonus + completionBonus;
	}

	// Reactive statements - initialize inputChars first
	$: {
		inputChars = chars.filter(Boolean);

		// Calculate total possible words only after inputChars is set
		if (inputChars && inputChars.length >= 1) {
			const allPossible = generateFilteredWords(wordList, inputChars, false);
			totalPossibleWords = allPossible.length;
		} else {
			totalPossibleWords = 0;
		}
	}

	$: if (gameStarted && !gameComplete && !gamePaused) {
		startTimer();
	}

	// Calculate elapsed time (excluding paused time)
	$: elapsedTime = timeStarted ? Math.floor((currentTime - timeStarted - pausedTime) / 1000) : 0;
	$: formattedTime = `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`;

	// Calculate completion percentage
	$: completionPercentage =
		totalPossibleWords > 0 ? Math.round((foundWords.length / totalPossibleWords) * 100) : 0;

	// Check if game is complete
	$: if (foundWords.length > 0 && foundWords.length === totalPossibleWords && !gameComplete) {
		gameComplete = true;
		clearInterval(timer);
		calculateFinalScore();
	}

	// Save game state periodically and on changes (debounced server write)
	$: if (browser && gameId) {
		saveGameToServer();
	}
</script>

{#if !isReady}
	<div class="loading">
		<h2>{$t('common.loading')}</h2>
		<p>{$t('gameState.preparingGame')}</p>
	</div>
{:else if !gameStarted}
	<WelcomeScreen
		{inputChars}
		{totalPossibleWords}
		{hasSavedGame}
		{gamePaused}
		onStartGame={startGame}
		onResumeGame={resumeGame}
		onNewGame={generateNewGame}
	/>
{:else}
	<GameView
		{chars}
		{foundWords}
		{gameComplete}
		{gamePaused}
		{formattedTime}
		{totalPossibleWords}
		{completionPercentage}
		bind:wordInput
		{score}
		onPauseGame={pauseGame}
		onResumeGame={resumeGame}
		onResetGame={generateNewGame}
		onSubmitWord={submitWord}
		onKeydown={handleWordInputKeydown}
	/>
{/if}

<style>
	.loading {
		text-align: center;
		padding: 2rem;
		color: var(--color-text);
	}

	.loading h2 {
		margin-bottom: 1rem;
	}
</style>
