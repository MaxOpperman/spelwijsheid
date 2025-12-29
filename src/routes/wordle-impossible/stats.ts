export interface ImpossibleWordleStats {
	totalCorrectGuesses: number;
	bestTime: number | null; // in milliseconds, null if never won
	totalTime: number; // in milliseconds
	gamesPlayed: number;
}

/**
 * Create default stats object
 */
export function createDefaultStats(): ImpossibleWordleStats {
	return {
		totalCorrectGuesses: 0,
		bestTime: null,
		totalTime: 0,
		gamesPlayed: 0
	};
}

/**
 * Calculate average time
 */
export function getAverageTime(stats: ImpossibleWordleStats): number | null {
	if (stats.totalCorrectGuesses === 0) {
		return null;
	}
	return stats.totalTime / stats.totalCorrectGuesses;
}

/**
 * Parse stats from cookie string
 */
export function parseStats(serialized: string | undefined): ImpossibleWordleStats {
	if (!serialized) {
		return createDefaultStats();
	}

	try {
		const parsed = JSON.parse(serialized);
		// Validate structure
		if (
			typeof parsed.totalCorrectGuesses === 'number' &&
			(parsed.bestTime === null || typeof parsed.bestTime === 'number') &&
			typeof parsed.totalTime === 'number' &&
			typeof parsed.gamesPlayed === 'number'
		) {
			return parsed;
		}
	} catch {
		// Invalid JSON, return defaults
	}

	return createDefaultStats();
}

/**
 * Update stats after a game ends
 * @param stats Current stats
 * @param won Whether the player won
 * @param timeMs Time taken in milliseconds
 */
export function updateStats(
	stats: ImpossibleWordleStats,
	won: boolean,
	timeMs: number
): ImpossibleWordleStats {
	const newStats = { ...stats };

	newStats.gamesPlayed += 1;

	if (won) {
		newStats.totalCorrectGuesses += 1;
		newStats.totalTime += timeMs;

		if (newStats.bestTime === null || timeMs < newStats.bestTime) {
			newStats.bestTime = timeMs;
		}
	}

	return newStats;
}

/**
 * Serialize stats to cookie string
 */
export function serializeStats(stats: ImpossibleWordleStats): string {
	return JSON.stringify(stats);
}

/**
 * Format time in seconds
 */
export function formatTime(ms: number | null): string {
	if (ms === null) {
		return '--';
	}
	return (ms / 1000).toFixed(1) + 's';
}
