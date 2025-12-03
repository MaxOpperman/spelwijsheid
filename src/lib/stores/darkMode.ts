import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Check for saved theme preference or default to 'light'
const defaultTheme = 'light';
const initialTheme = browser ? (localStorage.getItem('theme') ?? defaultTheme) : defaultTheme;

// Create the store
export const darkMode = writable<boolean>(initialTheme === 'dark');

// Subscribe to changes and update localStorage and document class
if (browser) {
	darkMode.subscribe((isDark) => {
		localStorage.setItem('theme', isDark ? 'dark' : 'light');

		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	// Apply initial theme
	if (initialTheme === 'dark') {
		document.documentElement.classList.add('dark');
	}
}

export function toggleDarkMode() {
	darkMode.update((n) => !n);
}
