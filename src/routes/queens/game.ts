export type CellState = 'empty' | 'cross' | 'queen';

export interface Cell {
	row: number;
	col: number;
	state: CellState;
	region: number; // Which colored region this cell belongs to
}

export interface Puzzle {
	size: number;
	board: Cell[][];
	solution: { row: number; col: number }[]; // Valid queen positions
}

/**
 * Generate a random color for a region
 */
function generateColor(index: number, total: number): string {
	const hue = (index * 360) / total;
	const saturation = 60 + (index % 3) * 10;
	const lightness = 60 + (index % 2) * 10;
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Check if placing a queen at (row, col) is valid according to N-Queens rules
 * - No queens in the same row
 * - No queens in the same column
 * - No queens in diagonally adjacent cells (only adjacent, not entire diagonal)
 */
function isValidPlacement(board: Cell[][], row: number, col: number, size: number): boolean {
	// Check row
	for (let c = 0; c < size; c++) {
		if (c !== col && board[row][c].state === 'queen') {
			return false;
		}
	}

	// Check column
	for (let r = 0; r < size; r++) {
		if (r !== row && board[r][col].state === 'queen') {
			return false;
		}
	}

	// Check diagonally adjacent cells (only 4 adjacent diagonal cells)
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
				return false;
			}
		}
	}

	return true;
}

/**
 * Check if the current board state is a winning configuration
 */
export function checkWin(board: Cell[][], size: number): boolean {
	let queensCount = 0;
	const regionsWithQueen = new Set<number>();

	// Count queens and track which regions have queens
	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			if (board[row][col].state === 'queen') {
				queensCount++;
				regionsWithQueen.add(board[row][col].region);

				// Check if this placement is valid
				if (!isValidPlacement(board, row, col, size)) {
					return false;
				}
			}
		}
	}

	// Must have exactly N queens, one in each region
	return queensCount === size && regionsWithQueen.size === size;
}

/**
 * Generate regions using a flood-fill like algorithm
 */
function generateRegions(size: number): number[][] {
	const regions: number[][] = Array(size)
		.fill(0)
		.map(() => Array(size).fill(-1));

	// Get all cells and shuffle them
	const allCells: { row: number; col: number }[] = [];
	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			allCells.push({ row, col });
		}
	}

	// Shuffle cells
	for (let i = allCells.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[allCells[i], allCells[j]] = [allCells[j], allCells[i]];
	}

	// Pick first N cells as seed positions (guaranteed to be unique)
	const startPositions: { row: number; col: number; region: number }[] = [];
	for (let i = 0; i < size; i++) {
		const { row, col } = allCells[i];
		regions[row][col] = i;
		startPositions.push({ row, col, region: i });
	}

	// Expand regions using flood fill with round-robin to keep regions balanced
	const queues: { row: number; col: number }[][] = startPositions.map((pos) => [
		{ row: pos.row, col: pos.col }
	]);

	let currentRegion = 0;
	let activeCellsRemaining = size * size - size; // Total cells minus seed cells

	while (activeCellsRemaining > 0) {
		let foundCell = false;

		// Try to expand current region
		const queue = queues[currentRegion];
		if (queue.length > 0) {
			const { row, col } = queue.shift()!;

			// Try to expand in all 4 directions
			const directions = [
				[0, 1],
				[1, 0],
				[0, -1],
				[-1, 0]
			];
			// Randomize direction order
			directions.sort(() => Math.random() - 0.5);

			for (const [dr, dc] of directions) {
				const newRow = row + dr;
				const newCol = col + dc;

				if (
					newRow >= 0 &&
					newRow < size &&
					newCol >= 0 &&
					newCol < size &&
					regions[newRow][newCol] === -1
				) {
					regions[newRow][newCol] = currentRegion;
					queue.push({ row: newRow, col: newCol });
					activeCellsRemaining--;
					foundCell = true;
				}
			}
		}

		// Move to next region (round-robin)
		currentRegion = (currentRegion + 1) % size;

		// If we've gone through all regions and found no cells to expand, we're done
		if (!foundCell && currentRegion === 0) {
			// Check if any cells are still unassigned
			let hasUnassigned = false;
			outerLoop: for (let row = 0; row < size; row++) {
				for (let col = 0; col < size; col++) {
					if (regions[row][col] === -1) {
						// Assign to nearest region
						for (const [dr, dc] of [
							[0, 1],
							[1, 0],
							[0, -1],
							[-1, 0]
						]) {
							const newRow = row + dr;
							const newCol = col + dc;
							if (
								newRow >= 0 &&
								newRow < size &&
								newCol >= 0 &&
								newCol < size &&
								regions[newRow][newCol] !== -1
							) {
								regions[row][col] = regions[newRow][newCol];
								activeCellsRemaining--;
								hasUnassigned = true;
								break outerLoop;
							}
						}
					}
				}
			}

			if (!hasUnassigned) break;
		}
	}

	return regions;
}

/**
 * Find a valid solution for the N-Queens puzzle with regions
 */
function findSolution(regions: number[][], size: number): { row: number; col: number }[] | null {
	const solution: { row: number; col: number }[] = [];
	const usedRegions = new Set<number>();

	function backtrack(col: number): boolean {
		if (col >= size) {
			return solution.length === size;
		}

		for (let row = 0; row < size; row++) {
			const region = regions[row][col];

			if (usedRegions.has(region)) {
				continue;
			}

			// Create a temporary board to check validity
			const tempBoard: Cell[][] = Array(size)
				.fill(0)
				.map((_, r) =>
					Array(size)
						.fill(0)
						.map((_, c) => ({
							row: r,
							col: c,
							state: 'empty' as CellState,
							region: regions[r][c]
						}))
				);

			// Place existing queens
			for (const { row: qRow, col: qCol } of solution) {
				tempBoard[qRow][qCol].state = 'queen';
			}

			// Try placing queen at current position
			tempBoard[row][col].state = 'queen';

			if (isValidPlacement(tempBoard, row, col, size)) {
				solution.push({ row, col });
				usedRegions.add(region);

				if (backtrack(col + 1)) {
					return true;
				}

				solution.pop();
				usedRegions.delete(region);
			}
		}

		return false;
	}

	backtrack(0);
	return solution.length === size ? solution : null;
}

/**
 * Generate a new N-Queens puzzle
 */
export function generatePuzzle(size: number): Puzzle {
	let regions: number[][];
	let solution: { row: number; col: number }[] | null = null;

	// Try to generate a valid puzzle
	let attempts = 0;
	while (solution === null && attempts < 100) {
		regions = generateRegions(size);
		solution = findSolution(regions, size);
		attempts++;
	}

	if (!solution) {
		throw new Error('Failed to generate a valid puzzle');
	}

	// Verify we have exactly 'size' regions (0 to size-1)
	const uniqueRegions = new Set<number>();
	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			uniqueRegions.add(regions![row][col]);
		}
	}

	// If we don't have exactly 'size' regions, regenerate
	if (uniqueRegions.size !== size) {
		console.warn(`Expected ${size} regions but got ${uniqueRegions.size}, regenerating...`);
		return generatePuzzle(size);
	}

	// Create the board
	const board: Cell[][] = Array(size)
		.fill(0)
		.map((_, row) =>
			Array(size)
				.fill(0)
				.map((_, col) => ({
					row,
					col,
					state: 'empty' as CellState,
					region: regions![row][col]
				}))
		);

	return {
		size,
		board,
		solution
	};
}

/**
 * Get the color for a region
 */
export function getRegionColor(region: number, totalRegions: number): string {
	return generateColor(region, totalRegions);
}

/**
 * Game class to manage game state
 */
export class QueensGame {
	puzzle: Puzzle;
	startTime: number;
	moves: number;
	history: CellState[][][];

	constructor(puzzle: Puzzle) {
		this.puzzle = puzzle;
		this.startTime = Date.now();
		this.moves = 0;
		this.history = [];
	}

	/**
	 * Save current board state to history
	 */
	private saveState() {
		const state = this.puzzle.board.map((row) => row.map((cell) => cell.state));
		this.history.push(state);
	}

	/**
	 * Toggle cell state: empty -> cross -> queen -> empty
	 */
	toggleCell(row: number, col: number) {
		this.saveState();

		const cell = this.puzzle.board[row][col];
		if (cell.state === 'empty') {
			cell.state = 'cross';
		} else if (cell.state === 'cross') {
			cell.state = 'queen';
		} else {
			cell.state = 'empty';
		}

		this.moves++;
		// Create deep copy of board to trigger Svelte reactivity
		this.puzzle.board = this.puzzle.board.map((row) => [...row]);
	}

	/**
	 * Set a cell to cross state (for drag operation)
	 */
	setCross(row: number, col: number) {
		const cell = this.puzzle.board[row][col];
		if (cell.state === 'empty') {
			// Only save state if this is the first move in a drag operation
			if (this.history.length === 0 || this.moves === 0) {
				this.saveState();
			}
			cell.state = 'cross';
			this.moves++;
			// Create deep copy of board to trigger Svelte reactivity
			this.puzzle.board = this.puzzle.board.map((row) => [...row]);
		}
	}

	/**
	 * Get current board state as string array
	 */
	private getBoardState(): CellState[][] {
		return this.puzzle.board.map((row) => row.map((cell) => cell.state));
	}

	/**
	 * Undo last move
	 */
	undo() {
		if (this.history.length > 0) {
			const previousState = this.history.pop()!;
			for (let row = 0; row < this.puzzle.size; row++) {
				for (let col = 0; col < this.puzzle.size; col++) {
					this.puzzle.board[row][col].state = previousState[row][col];
				}
			}
			// Create deep copy of board to trigger Svelte reactivity
			this.puzzle.board = this.puzzle.board.map((row) => [...row]);
		}
	}

	/**
	 * Clear the board
	 */
	clear() {
		this.saveState();
		for (let row = 0; row < this.puzzle.size; row++) {
			for (let col = 0; col < this.puzzle.size; col++) {
				this.puzzle.board[row][col].state = 'empty';
			}
		}
		// Create deep copy of board to trigger Svelte reactivity
		this.puzzle.board = this.puzzle.board.map((row) => [...row]);
	}

	/**
	 * Get elapsed time in seconds
	 */
	getElapsedTime(): number {
		return Math.floor((Date.now() - this.startTime) / 1000);
	}

	/**
	 * Check if puzzle is solved
	 */
	isSolved(): boolean {
		return checkWin(this.puzzle.board, this.puzzle.size);
	}

	/**
	 * Serialize game state
	 */
	serialize(): string {
		const boardState = this.puzzle.board
			.map((row) =>
				row
					.map((cell) => {
						if (cell.state === 'empty') return '0';
						if (cell.state === 'cross') return 'x';
						return 'q';
					})
					.join('')
			)
			.join(',');

		const regions = this.puzzle.board
			.map((row) => row.map((cell) => cell.region).join(''))
			.join(',');

		return `${this.puzzle.size}|${boardState}|${regions}|${this.startTime}|${this.moves}`;
	}

	/**
	 * Deserialize game state
	 */
	static deserialize(serialized: string): QueensGame {
		const [sizeStr, boardState, regionsStr, startTimeStr, movesStr] = serialized.split('|');
		const size = parseInt(sizeStr);

		const boardRows = boardState.split(',');
		const regionRows = regionsStr.split(',');

		const board: Cell[][] = [];
		for (let row = 0; row < size; row++) {
			const rowCells: Cell[] = [];
			for (let col = 0; col < size; col++) {
				const stateChar = boardRows[row][col];
				let state: CellState = 'empty';
				if (stateChar === 'x') state = 'cross';
				if (stateChar === 'q') state = 'queen';

				rowCells.push({
					row,
					col,
					state,
					region: parseInt(regionRows[row][col])
				});
			}
			board.push(rowCells);
		}

		const puzzle: Puzzle = {
			size,
			board,
			solution: [] // Solution is not stored in serialized form
		};

		const game = new QueensGame(puzzle);
		game.startTime = parseInt(startTimeStr);
		game.moves = parseInt(movesStr);

		return game;
	}
}
