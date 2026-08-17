import type { Cookies } from '@sveltejs/kit';

export type WordLength = 4 | 5 | 6 | 7;

export const WORD_LENGTHS = [4, 5, 6, 7] as const satisfies readonly WordLength[];

export function getLocale(cookies: Cookies, fallback = 'en-US'): string {
	return cookies.get('locale') ?? fallback;
}

export function getWordLength(
	cookies: Cookies,
	cookieName: string,
	fallback: WordLength = 5
): WordLength {
	const rawLength = Number.parseInt(cookies.get(cookieName) ?? String(fallback), 10);
	return WORD_LENGTHS.includes(rawLength as WordLength) ? (rawLength as WordLength) : fallback;
}

export function getWordGameKey(locale: string, wordLength: WordLength): string {
	return `${locale}-${wordLength}`;
}
