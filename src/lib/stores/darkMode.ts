import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { postJsonBestEffort, setCookie } from '$lib/utils/client-sync';

// The theme has already been applied to <html> before paint by the inline
// script in app.html (reading the `theme` cookie). Initialise the store from
// the actual applied class so client and server agree.
const initialDark = browser ? document.documentElement.classList.contains('dark') : false;

export const darkMode = writable<boolean>(initialDark);

if (browser) {
	let first = true;
	darkMode.subscribe((isDark) => {
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}

		// Don't persist the initial value (it already reflects the server state).
		if (first) {
			first = false;
			return;
		}

		// Persist the preference to the server (source of truth) and update the
		// readable theme cookie for instant, flash-free subsequent loads.
		setCookie('theme', isDark ? 'dark' : 'light', 34_560_000);
		postJsonBestEffort('/api/preferences', { darkMode: isDark });
	});
}

export function toggleDarkMode() {
	darkMode.update((n) => !n);
}
