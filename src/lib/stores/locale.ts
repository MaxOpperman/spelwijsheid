import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PERSISTENT_COOKIE_MAX_AGE, postJsonBestEffort, setCookie } from '$lib/utils/client-sync';

export enum Locale {
	EN_US = 'en-US',
	EN_GB = 'en-GB',
	NL_NL = 'nl-NL'
}

export const LOCALES: { value: Locale; countryCode: string; label: string }[] = [
	{ value: Locale.EN_US, countryCode: 'us', label: 'English (US)' },
	{ value: Locale.EN_GB, countryCode: 'gb', label: 'English (UK)' },
	{ value: Locale.NL_NL, countryCode: 'nl', label: 'Nederlands' }
];

const stored = browser ? (localStorage.getItem('locale') as Locale | null) : null;
const initial: Locale = stored ?? Locale.EN_US;

export const locale = writable<Locale>(initial);

if (browser) {
	let first = true;
	locale.subscribe((value) => {
		localStorage.setItem('locale', value);
		// Set a cookie for the server to read during SSR / load functions.
		setCookie('locale', value, PERSISTENT_COOKIE_MAX_AGE);

		if (first) {
			first = false;
			return;
		}

		// Persist to the server-side user record.
		postJsonBestEffort('/api/preferences', { locale: value });
	});
}
