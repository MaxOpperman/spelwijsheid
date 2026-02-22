import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Locale = 'en-US' | 'en-GB' | 'nl-NL';

export const LOCALES: { value: Locale; countryCode: string; label: string }[] = [
	{ value: 'en-US', countryCode: 'us', label: 'English (US)' },
	{ value: 'en-GB', countryCode: 'gb', label: 'English (UK)' },
	{ value: 'nl-NL', countryCode: 'nl', label: 'Nederlands' }
];

const stored = browser ? (localStorage.getItem('locale') as Locale | null) : null;
const initial: Locale = stored ?? 'en-US';

export const locale = writable<Locale>(initial);

if (browser) {
	locale.subscribe((value) => {
		localStorage.setItem('locale', value);
	});
}
