import { base } from '$app/paths';
import { derived, get, writable } from 'svelte/store';
import {
	generatePuzzle,
	QueensGame,
	type Cell,
	isQueenInvalid as isQueenInvalidCell
} from './game';
import { getStats, type GameResult } from './stats';

interface QueensLoadState {
	game: string | null;
	meta: { pausedTime: number; lastCompletionTime: number | null };
	leaderboard: GameResult[];
}

const API_URL = `${base}/api/games/queens`;

export function createQueensController() {
	const game = writable<QueensGame | null>(null);
	const board = writable<Cell[][]>([]);
	const won = writable(false);
	const elapsedTime = writable(0);
	const isDragging = writable(false);
	const pausedTime = writable(0);
	const leaderboard = writable<GameResult[]>([]);
	const stats = derived(leaderboard, (results) => getStats(results));

	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	let intervalTimer: ReturnType<typeof setInterval> | undefined;

	function syncGameState(currentGame: QueensGame | null): void {
		game.set(currentGame);
		board.set(currentGame?.puzzle.board ?? []);
	}

	function clearSaveTimer(): void {
		if (saveTimer) {
			clearTimeout(saveTimer);
			saveTimer = undefined;
		}
	}

	function stopTimer(): void {
		if (intervalTimer) {
			clearInterval(intervalTimer);
			intervalTimer = undefined;
		}
	}

	function startTimer(): void {
		stopTimer();
		const currentGame = get(game);
		if (!currentGame || get(won)) return;

		intervalTimer = setInterval(() => {
			const liveGame = get(game);
			if (!liveGame || get(won)) return;
			elapsedTime.set(get(pausedTime) + (Date.now() - liveGame.startTime) / 1000);
		}, 100);
	}

	function postQueens(body: Record<string, unknown>, keepalive = false): void {
		fetch(API_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
			keepalive
		}).catch(() => {});
	}

	function scheduleSave(): void {
		if (get(won)) return;
		const currentGame = get(game);
		if (!currentGame) return;

		clearSaveTimer();
		const serialized = currentGame.serialize();
		saveTimer = setTimeout(() => postQueens({ type: 'save', game: serialized }), 500);
	}

	function recordCompletion(currentGame: QueensGame): void {
		clearSaveTimer();
		stopTimer();

		const time = get(pausedTime) + (Date.now() - currentGame.startTime) / 1000;
		elapsedTime.set(time);
		won.set(true);
		leaderboard.update((results) => [
			...results,
			{ size: currentGame.puzzle.size, time, date: new Date().toISOString() }
		]);

		postQueens({
			type: 'complete',
			game: currentGame.serialize(),
			size: currentGame.puzzle.size,
			time
		});
	}

	function checkWin(): boolean {
		const currentGame = get(game);
		if (currentGame && currentGame.isSolved()) {
			recordCompletion(currentGame);
			return true;
		}
		return false;
	}

	function setCurrentGame(currentGame: QueensGame | null): void {
		syncGameState(currentGame);
	}

	async function load(): Promise<void> {
		let data: QueensLoadState | null = null;
		try {
			const res = await fetch(API_URL);
			if (res.ok) data = (await res.json()) as QueensLoadState;
		} catch {
			/* offline */
		}

		leaderboard.set(data?.leaderboard ?? []);

		const saved = data?.game ?? null;
		if (saved) {
			try {
				const currentGame = QueensGame.deserialize(saved);
				setCurrentGame(currentGame);

				if (currentGame.isSolved()) {
					won.set(true);
					elapsedTime.set(data?.meta.lastCompletionTime ?? 0);
					stopTimer();
				} else {
					won.set(false);
					pausedTime.set(data?.meta.pausedTime ?? 0);
					currentGame.startTime = Date.now();
					elapsedTime.set(get(pausedTime));
					startTimer();
				}
			} catch (error) {
				console.error('Failed to load saved game', error);
				await startNewGame();
			}
		} else {
			await startNewGame();
		}
	}

	async function startNewGame(size: number = Math.floor(Math.random() * 7) + 6): Promise<void> {
		const puzzle = generatePuzzle(size);
		const currentGame = new QueensGame(puzzle);
		won.set(false);
		elapsedTime.set(0);
		pausedTime.set(0);
		setCurrentGame(currentGame);
		startTimer();
		postQueens({ type: 'new', game: currentGame.serialize() });
	}

	function handleCellClick(row: number, col: number): void {
		const currentGame = get(game);
		if (!currentGame || get(won)) return;

		currentGame.toggleCell(row, col);
		syncGameState(currentGame);
		if (checkWin()) return;
		scheduleSave();
	}

	function handleCellMouseDown(row: number, col: number, event: MouseEvent): void {
		const currentGame = get(game);
		if (!currentGame || get(won)) return;

		event.preventDefault();
		isDragging.set(true);

		const cell = currentGame.puzzle.board[row][col];
		if (cell.state === 'empty') {
			currentGame.setCross(row, col);
			syncGameState(currentGame);
			scheduleSave();
		}
	}

	function handleCellMouseEnter(row: number, col: number): void {
		const currentGame = get(game);
		if (!currentGame || get(won) || !get(isDragging)) return;

		const cell = currentGame.puzzle.board[row][col];
		if (cell.state === 'empty') {
			currentGame.setCross(row, col);
			syncGameState(currentGame);
			scheduleSave();
		}
	}

	function handleMouseUp(): void {
		isDragging.set(false);
	}

	function handleUndo(): void {
		const currentGame = get(game);
		if (currentGame && !get(won)) {
			currentGame.undo();
			syncGameState(currentGame);
			scheduleSave();
		}
	}

	function handleClear(): void {
		const currentGame = get(game);
		if (currentGame && !get(won)) {
			currentGame.clear();
			syncGameState(currentGame);
			scheduleSave();
		}
	}

	function isQueenInvalid(row: number, col: number): boolean {
		return isQueenInvalidCell(get(board), row, col, get(game)?.puzzle.size ?? 0);
	}

	function dispose(): void {
		clearSaveTimer();
		stopTimer();

		const currentGame = get(game);
		if (currentGame && !get(won)) {
			const totalTime = get(pausedTime) + (Date.now() - currentGame.startTime) / 1000;
			postQueens({ type: 'pause', pausedTime: totalTime }, true);
		}
	}

	return {
		game,
		board,
		won,
		elapsedTime,
		isDragging,
		pausedTime,
		stats,
		leaderboard,
		load,
		startNewGame,
		handleCellClick,
		handleCellMouseDown,
		handleCellMouseEnter,
		handleMouseUp,
		handleUndo,
		handleClear,
		isQueenInvalid,
		dispose
	};
}
