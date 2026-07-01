export interface QueensStats {
	gamesPlayed: number;
	gamesWon: number;
	fastestTime: number;
	averageTime: number;
	totalTime: number;
	sizeTimes: Record<number, { count: number; totalTime: number; fastestTime: number }>;
}

export interface GameResult {
	size: number;
	time: number;
	date: string;
}

export function getStats(results: GameResult[]): QueensStats {
	if (!results || results.length === 0) {
		return {
			gamesPlayed: 0,
			gamesWon: 0,
			fastestTime: 0,
			averageTime: 0,
			totalTime: 0,
			sizeTimes: {}
		};
	}

	const sizeTimes: Record<number, { count: number; totalTime: number; fastestTime: number }> = {};

	let fastestTime = Infinity;
	let totalTime = 0;

	for (const result of results) {
		totalTime += result.time;
		fastestTime = Math.min(fastestTime, result.time);

		if (!sizeTimes[result.size]) {
			sizeTimes[result.size] = {
				count: 0,
				totalTime: 0,
				fastestTime: Infinity
			};
		}

		sizeTimes[result.size].count++;
		sizeTimes[result.size].totalTime += result.time;
		sizeTimes[result.size].fastestTime = Math.min(sizeTimes[result.size].fastestTime, result.time);
	}

	return {
		gamesPlayed: results.length,
		gamesWon: results.length,
		fastestTime: fastestTime === Infinity ? 0 : fastestTime,
		averageTime: totalTime / results.length,
		totalTime,
		sizeTimes
	};
}

export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = (seconds % 60).toFixed(1);
	if (mins > 0) {
		return `${mins}m ${secs}s`;
	}
	return secs + 's';
}
