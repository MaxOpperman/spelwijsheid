/**
 * Capitalizes the first character of a string.
 * @param word - The string to capitalize
 * @returns The string with the first character converted to uppercase
 * @example
 * capitalizeFirstChar("hello") // Returns "Hello"
 * capitalizeFirstChar("") // Returns ""
 */
export function capitalizeFirstChar(word: string | null): string {
	if (!word) return '';
	if (word.length === 0) return word;
	return word.charAt(0).toUpperCase() + word.slice(1);
}
