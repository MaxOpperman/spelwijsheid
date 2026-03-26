<script lang="ts">
	import { generatePuzzle, QueensGame, getRegionColor, type Cell } from './game';
	import { confetti } from '@neoconfetti/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { onMount, onDestroy } from 'svelte';
	import StatsPanel from './StatsPanel.svelte';
	import { getStats } from './stats';
	import { t } from '$lib/i18n';

	/** Whether the user prefers reduced motion */
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	let game = $state<QueensGame | null>(null);
	let board = $state<Cell[][]>([]);
	let won = $state(false);
	let elapsedTime = $state(0);
	let isDragging = $state(false);
	let pausedTime = $state(0); // Track accumulated time when paused
	let stats = $state(getStats());

	/** Update elapsed time every 100ms */
	$effect(() => {
		if (!won && game) {
			const interval = setInterval(() => {
				elapsedTime = pausedTime + (Date.now() - game!.startTime) / 1000;
			}, 100);

			return () => clearInterval(interval);
		}
	});

	onMount(() => {
		// Try to load saved game from localStorage
		const saved = localStorage.getItem('queens-game');
		if (saved) {
			try {
				game = QueensGame.deserialize(saved);
				board = game.puzzle.board;

				// Check if the loaded game is already in a solved state
				if (game.isSolved()) {
					won = true;
					// Load the saved completion time
					const savedCompletionTime = localStorage.getItem('queens-last-completion-time');
					elapsedTime = savedCompletionTime ? parseFloat(savedCompletionTime) : 0;
					// Load stats without adding a new win entry
					stats = getStats();
				} else {
					// Load paused time and reset start time to now
					const savedPausedTime = localStorage.getItem('queens-paused-time');
					pausedTime = savedPausedTime ? parseFloat(savedPausedTime) : 0;
					game.startTime = Date.now();
					elapsedTime = pausedTime;
				}
			} catch (e) {
				console.error('Failed to load saved game', e);
				startNewGame();
			}
		} else {
			startNewGame();
		}
	});

	onDestroy(() => {
		// Save accumulated time when leaving the page
		if (game && !won) {
			const totalTime = pausedTime + (Date.now() - game.startTime) / 1000;
			localStorage.setItem('queens-paused-time', totalTime.toString());
		}
	});

	function startNewGame(size: number = Math.floor(Math.random() * 7) + 6) {
		const puzzle = generatePuzzle(size);
		game = new QueensGame(puzzle);
		board = game.puzzle.board;
		won = false;
		elapsedTime = 0;
		pausedTime = 0;
		localStorage.removeItem('queens-paused-time');
		localStorage.removeItem('queens-last-completion-time');
		saveGame();
	}

	function saveGame() {
		if (game) {
			localStorage.setItem('queens-game', game.serialize());
		}
	}

	function handleCellClick(row: number, col: number) {
		if (!game || won) return;

		game.toggleCell(row, col);
		board = game.puzzle.board;
		checkWin();
		saveGame();
	}

	function handleCellMouseDown(row: number, col: number, event: MouseEvent) {
		if (!game || won) return;

		event.preventDefault();
		isDragging = true;

		const cell = game.puzzle.board[row][col];
		if (cell.state === 'empty') {
			game.setCross(row, col);
			board = game.puzzle.board;
			saveGame();
		}
	}

	function handleCellMouseEnter(row: number, col: number) {
		if (!game || won || !isDragging) return;

		const cell = game.puzzle.board[row][col];
		if (cell.state === 'empty') {
			game.setCross(row, col);
			board = game.puzzle.board;
			saveGame();
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function checkWin() {
		if (game && game.isSolved()) {
			won = true;
			elapsedTime = pausedTime + (Date.now() - game.startTime) / 1000;
			localStorage.removeItem('queens-paused-time');
			// Save the completion time
			localStorage.setItem('queens-last-completion-time', elapsedTime.toString());

			// Save to leaderboard (localStorage for now)
			interface LeaderboardEntry {
				size: number;
				time: number;
				date: string;
			}
			const leaderboard: LeaderboardEntry[] = JSON.parse(
				localStorage.getItem('queens-leaderboard') || '[]'
			);
			leaderboard.push({
				size: game.puzzle.size,
				time: elapsedTime,
				date: new Date().toISOString()
			});
			localStorage.setItem('queens-leaderboard', JSON.stringify(leaderboard));

			// Update stats
			stats = getStats();
		}
	}

	function handleUndo() {
		if (game && !won) {
			game.undo();
			board = game.puzzle.board;
			saveGame();
		}
	}

	function handleClear() {
		if (game && !won) {
			game.clear();
			board = game.puzzle.board;
			saveGame();
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = (seconds % 60).toFixed(1);
		if (mins > 0) {
			return `${mins}m ${secs}s`;
		}
		return secs + 's';
	}

	function isQueenInvalid(row: number, col: number): boolean {
		if (!game || !board || board.length === 0) return false;
		if (!board[row] || !board[row][col]) return false;
		if (board[row][col].state !== 'queen') return false;

		const size = game.puzzle.size;
		const currentRegion = board[row][col].region;

		// Check if another queen is in the same region
		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				if (
					(r !== row || c !== col) &&
					board[r][c].state === 'queen' &&
					board[r][c].region === currentRegion
				) {
					return true;
				}
			}
		}

		// Check row for conflicts
		for (let c = 0; c < size; c++) {
			if (c !== col && board[row][c].state === 'queen') {
				return true;
			}
		}

		// Check column for conflicts
		for (let r = 0; r < size; r++) {
			if (r !== row && board[r][col].state === 'queen') {
				return true;
			}
		}

		// Check diagonally adjacent cells
		const diagonalOffsets = [
			[-1, -1],
			[-1, 1],
			[1, -1],
			[1, 1]
		];

		for (const [dr, dc] of diagonalOffsets) {
			const newRow = row + dr;
			const newCol = col + dc;
			if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
				if (board[newRow][newCol].state === 'queen') {
					return true;
				}
			}
		}

		return false;
	}
</script>

<svelte:window onmouseup={handleMouseUp} />

<svelte:head>
	<title>Queens - N-Queens Puzzle</title>
	<meta name="description" content="LinkedIn N-Queens puzzle game with colors" />
</svelte:head>

<div class="game-container">
	<a class="how-to-play" href="/queens/how-to-play">{$t('queens.howToPlay')}</a>

	<div class="header-controls">
		<div class="timer">⏱ {formatTime(elapsedTime)}</div>
		<div class="controls-right">
			<button class="control-button" onclick={handleClear}>{$t('queens.clearBoard')}</button>
		</div>
	</div>

	{#if game}
		<div
			class="board"
			style="--board-size: {game.puzzle.size}"
			role="grid"
			aria-label="N-Queens puzzle board"
		>
			{#each board as row, rowIndex (rowIndex)}
				{#each row as cell, colIndex (`${rowIndex}-${colIndex}`)}
					{@const color = getRegionColor(cell.region, game.puzzle.size)}
					{@const invalid = isQueenInvalid(rowIndex, colIndex)}
					<button
						class="cell"
						class:has-cross={cell.state === 'cross'}
						class:has-queen={cell.state === 'queen'}
						class:invalid-queen={invalid}
						style="background-color: {color}"
						onclick={() => handleCellClick(rowIndex, colIndex)}
						onmousedown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
						onmouseenter={() => handleCellMouseEnter(rowIndex, colIndex)}
						role="gridcell"
						aria-label="Cell {rowIndex + 1}, {colIndex + 1}"
					>
						{#if cell.state === 'cross'}
							<span class="cross">✕</span>
						{/if}
						{#if cell.state === 'queen'}
							<span class="queen" class:invalid>♛</span>
							{#if invalid}
								<span class="invalid-cross">✕</span>
							{/if}
						{/if}
					</button>
				{/each}
			{/each}
		</div>

		{#if !won}
			<div class="bottom-controls">
				<button class="action-button" onclick={handleUndo}>{$t('common.undo')}</button>
			</div>
		{/if}

		{#if won}
			<StatsPanel {stats} currentTime={elapsedTime} />
			<button class="new-game-button" onclick={() => startNewGame()}>
				{$t('queens.newGame')}
			</button>
		{/if}
	{:else}
		<div class="loading">{$t('common.loading')}</div>
	{/if}
</div>

{#if won}
	<div
		style="position: fixed; left: 50%; top: 50%; pointer-events: none;"
		use:confetti={{
			particleCount: reducedMotion.current ? 0 : 150,
			force: 0.8,
			stageWidth: window.innerWidth,
			stageHeight: window.innerHeight,
			colors: ['#ff3e00', '#40b3ff', '#676778', '#ffd700', '#ff1493']
		}}
	></div>
{/if}

<style>
	.game-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 1rem;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
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
		justify-content: space-between;
		align-items: center;
		width: 100%;
		max-width: min(90vw, 600px);
		padding: 0.5rem 0;
	}

	.timer {
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--color-text);
	}

	.controls-right {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.control-button {
		padding: 0.5rem 1rem;
		background: var(--color-bg-1);
		border: 1px solid var(--color-text);
		border-radius: 4px;
		cursor: pointer;
		color: var(--color-text);
		font-size: 0.9rem;
	}

	.control-button:hover {
		background: var(--color-theme-1);
		color: white;
		border-color: var(--color-theme-1);
	}

	.board {
		display: grid;
		grid-template-columns: repeat(var(--board-size), 1fr);
		gap: 2px;
		background: var(--color-bg-0);
		padding: 2px;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		width: min(90vw, 600px);
		aspect-ratio: 1;
		user-select: none;
	}

	.cell {
		aspect-ratio: 1;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: clamp(0.8rem, calc(600px / var(--board-size) * 0.6), 2.5rem);
		transition: all 0.15s ease;
		position: relative;
		padding: 0;
	}

	@media (max-width: 768px) {
		.cell {
			font-size: clamp(0.6rem, calc(95vw / var(--board-size) * 0.6), 2rem);
		}
	}

	.cell:hover {
		filter: brightness(0.9);
		transform: scale(0.95);
	}

	.cell:active {
		transform: scale(0.9);
	}

	.cross {
		color: rgba(0, 0, 0, 0.6);
		font-weight: bold;
		font-size: 0.8em;
		filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3));
		display: block;
		pointer-events: none;
	}

	.queen {
		color: rgba(0, 0, 0, 0.9);
		font-size: 1em;
		filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3));
		display: block;
		pointer-events: none;
	}

	.queen.invalid {
		color: white;
		filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
	}

	.invalid-cross {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: darkred;
		font-size: 1.2em;
		font-weight: bold;
		pointer-events: none;
		text-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
	}

	.invalid-queen {
		animation: shake 0.3s ease-in-out;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-2px);
		}
		75% {
			transform: translateX(2px);
		}
	}

	:global(.dark) .queen.invalid {
		color: white;
		filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.7));
	}

	.bottom-controls {
		display: flex;
		gap: 1rem;
		width: 100%;
		max-width: min(90vw, 600px);
		justify-content: center;
	}

	.action-button {
		flex: 1;
		padding: 0.75rem 1.5rem;
		background: var(--color-bg-1);
		border: 2px solid var(--color-text);
		border-radius: 8px;
		cursor: pointer;
		color: var(--color-text);
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: var(--color-theme-1);
		color: white;
		border-color: var(--color-theme-1);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.action-button:active {
		transform: translateY(0);
	}

	.new-game-button {
		padding: 1rem 3rem;
		background: var(--color-theme-1);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1.1rem;
		font-weight: 600;
		transition: all 0.2s ease;
		margin: 1rem auto;
		display: block;
	}

	.new-game-button:hover {
		background: var(--color-theme-2);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.new-game-button:active {
		transform: translateY(0);
	}

	.loading {
		font-size: 1.5rem;
		color: var(--color-text);
	}

	@media (max-width: 768px) {
		.game-container {
			gap: 0.75rem;
		}

		.header-controls {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.timer {
			font-size: 1rem;
		}

		.control-button {
			font-size: 0.8rem;
			padding: 0.4rem 0.8rem;
		}

		.board {
			width: 95vw;
		}

		.action-button {
			font-size: 0.9rem;
			padding: 0.6rem 1rem;
		}

		.new-game-button {
			font-size: 1rem;
			padding: 0.875rem 2rem;
		}
	}
</style>
