export interface WordleStats {
	currentStreak: number;
	maxStreak: number;
	gamesPlayed: number;
	gamesWon: number;
	guessDistribution: {
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
		6: number;
	};
}

/**
 * Create default stats object
 */
export function createDefaultStats(): WordleStats {
	return {
		currentStreak: 0,
		maxStreak: 0,
		gamesPlayed: 0,
		gamesWon: 0,
		guessDistribution: {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			6: 0
		}
	};
}

/**
 * Parse stats from cookie string
 */
export function parseStats(serialized: string | undefined): WordleStats {
	if (!serialized) {
		return createDefaultStats();
	}

	try {
		const parsed = JSON.parse(serialized);
		// Validate structure
		if (
			typeof parsed.currentStreak === 'number' &&
			typeof parsed.maxStreak === 'number' &&
			typeof parsed.gamesPlayed === 'number' &&
			typeof parsed.gamesWon === 'number' &&
			parsed.guessDistribution
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
 * @param guessCount Number of guesses used (1-6), or undefined if lost
 */
export function updateStats(stats: WordleStats, won: boolean, guessCount?: number): WordleStats {
	const newStats = { ...stats };

	newStats.gamesPlayed += 1;

	if (won && guessCount && guessCount >= 1 && guessCount <= 6) {
		newStats.gamesWon += 1;
		newStats.currentStreak += 1;
		newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
		newStats.guessDistribution[guessCount as keyof typeof newStats.guessDistribution] += 1;
	} else {
		// Lost the game - reset current streak
		newStats.currentStreak = 0;
	}

	return newStats;
}

/**
 * Serialize stats to cookie string
 */
export function serializeStats(stats: WordleStats): string {
	return JSON.stringify(stats);
}
