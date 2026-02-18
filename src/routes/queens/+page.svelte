<script lang="ts">
	import { generatePuzzle, QueensGame, getRegionColor } from './game';
	import { confetti } from '@neoconfetti/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	/** Whether the user prefers reduced motion */
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	let game = $state<QueensGame | null>(null);
	let won = $state(false);
	let elapsedTime = $state(0);
	let isDragging = $state(false);

	// Timer update
	let timerInterval: number;

	onMount(() => {
		// Try to load saved game from localStorage
		const saved = localStorage.getItem('queens-game');
		if (saved) {
			try {
				game = QueensGame.deserialize(saved);
			} catch (e) {
				console.error('Failed to load saved game', e);
				startNewGame();
			}
		} else {
			startNewGame();
		}

		// Update timer every second
		timerInterval = setInterval(() => {
			if (game && !won) {
				elapsedTime = game.getElapsedTime();
			}
		}, 1000);

		return () => {
			clearInterval(timerInterval);
		};
	});

	function startNewGame(size: number = 8) {
		const puzzle = generatePuzzle(size);
		game = new QueensGame(puzzle);
		won = false;
		elapsedTime = 0;
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
			saveGame();
		}
	}

	function handleCellMouseEnter(row: number, col: number) {
		if (!game || won || !isDragging) return;

		const cell = game.puzzle.board[row][col];
		if (cell.state === 'empty') {
			game.setCross(row, col);
			saveGame();
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function checkWin() {
		if (game && game.isSolved()) {
			won = true;
			elapsedTime = game.getElapsedTime();
			clearInterval(timerInterval);

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
			leaderboard.sort((a, b) => a.time - b.time);
			localStorage.setItem('queens-leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
		}
	}

	function handleUndo() {
		if (game && !won) {
			game.undo();
			saveGame();
		}
	}

	function handleClear() {
		if (game && !won) {
			game.clear();
			saveGame();
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function goHome() {
		goto('/');
	}
</script>

<svelte:window onmouseup={handleMouseUp} />

<svelte:head>
	<title>Queens - N-Queens Puzzle</title>
	<meta name="description" content="LinkedIn N-Queens puzzle game with colors" />
</svelte:head>

<div class="game-container">
	<div class="header">
		<button class="back-button" onclick={goHome}> ← Queens </button>
		<div class="timer">⏱ {formatTime(elapsedTime)}</div>
		<div class="controls-right">
			<button class="control-button" onclick={handleClear}>Clear</button>
		</div>
	</div>

	{#if game}
		<div
			class="board"
			style="--board-size: {game.puzzle.size}"
			role="grid"
			aria-label="N-Queens puzzle board"
		>
			{#each game.puzzle.board as row, rowIndex (rowIndex)}
				{#each row as cell, colIndex (colIndex)}
					{@const color = getRegionColor(cell.region, game.puzzle.size)}
					<button
						class="cell"
						class:has-cross={cell.state === 'cross'}
						class:has-queen={cell.state === 'queen'}
						style="background-color: {color}"
						onclick={() => handleCellClick(rowIndex, colIndex)}
						onmousedown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
						onmouseenter={() => handleCellMouseEnter(rowIndex, colIndex)}
						role="gridcell"
						aria-label="Cell {rowIndex + 1}, {colIndex + 1}"
					>
						{#if cell.state === 'cross'}
							<span class="cross">✕</span>
						{:else if cell.state === 'queen'}
							<span class="queen">♛</span>
						{/if}
					</button>
				{/each}
			{/each}
		</div>

		<div class="bottom-controls">
			<button class="action-button" onclick={handleUndo}>Undo</button>
		</div>

		{#if won}
			<div class="win-message">
				<h2>🎉 Congratulations! 🎉</h2>
				<p>You solved the puzzle in {formatTime(elapsedTime)}!</p>
				<button class="new-game-button" onclick={() => startNewGame(game?.puzzle.size)}>
					New Game
				</button>
			</div>
		{/if}
	{:else}
		<div class="loading">Loading...</div>
	{/if}

	<div class="how-to-play">
		<details>
			<summary>How to Play</summary>
			<div class="instructions">
				<p>Place {game?.puzzle.size || 8} queens on the board following these rules:</p>
				<ul>
					<li>Each colored region must contain exactly one queen</li>
					<li>No two queens can be in the same row</li>
					<li>No two queens can be in the same column</li>
					<li>No two queens can be diagonally adjacent (touching corners)</li>
				</ul>
				<p><strong>Controls:</strong></p>
				<ul>
					<li>Click once to place an X (cross)</li>
					<li>Click again to place a queen</li>
					<li>Click a queen to remove it</li>
					<li>Drag to place multiple crosses</li>
				</ul>
			</div>
		</details>
	</div>
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
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
		gap: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		max-width: min(90vw, 600px);
		padding: 0.5rem 0;
	}

	.back-button {
		background: none;
		border: none;
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
		color: var(--color-text);
		padding: 0.5rem 1rem;
	}

	.back-button:hover {
		color: var(--color-theme-1);
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
		font-size: clamp(1rem, 4vw, 2.5rem);
		transition: all 0.15s ease;
		position: relative;
		padding: 0;
	}

	.cell:hover {
		filter: brightness(0.9);
		transform: scale(0.95);
	}

	.cell:active {
		transform: scale(0.9);
	}

	.cross {
		color: rgba(0, 0, 0, 0.4);
		font-weight: bold;
		font-size: 0.8em;
	}

	.queen {
		color: rgba(0, 0, 0, 0.8);
		font-size: 1em;
		filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3));
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

	.win-message {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		text-align: center;
		z-index: 1000;
		min-width: 300px;
	}

	.win-message h2 {
		margin: 0 0 1rem 0;
		color: var(--color-theme-1);
	}

	.win-message p {
		margin: 0 0 1.5rem 0;
		font-size: 1.1rem;
	}

	.new-game-button {
		padding: 0.75rem 2rem;
		background: var(--color-theme-1);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.new-game-button:hover {
		background: var(--color-theme-2);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.loading {
		font-size: 1.5rem;
		color: var(--color-text);
	}

	.how-to-play {
		width: 100%;
		max-width: min(90vw, 600px);
		margin-top: 1rem;
	}

	.how-to-play details {
		background: var(--color-bg-1);
		border: 1px solid var(--color-text);
		border-radius: 8px;
		padding: 1rem;
	}

	.how-to-play summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 1.1rem;
		color: var(--color-text);
		user-select: none;
	}

	.how-to-play summary:hover {
		color: var(--color-theme-1);
	}

	.instructions {
		margin-top: 1rem;
		color: var(--color-text);
	}

	.instructions ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.instructions li {
		margin: 0.5rem 0;
	}

	.instructions p {
		margin: 0.5rem 0;
	}

	@media (max-width: 768px) {
		.game-container {
			padding: 0.5rem;
		}

		.header {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.back-button {
			font-size: 1rem;
			padding: 0.25rem 0.5rem;
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
	}

	:global(.dark) .win-message {
		background: var(--color-bg-1);
		color: var(--color-text);
	}
</style>
