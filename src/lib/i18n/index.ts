import { derived } from 'svelte/store';
import { locale } from '$lib/stores/locale';
import { translations } from './translations';

/**
 * Reactive translation store.
 * Usage in Svelte templates: $t('key') or $t('key', { n: 5 })
 */
export const t = derived(locale, ($locale) => {
	return (key: string, params?: Record<string, string | number>): string => {
		const dict = translations[$locale] ?? translations['en-US'];
		let str = dict[key] ?? translations['en-US'][key] ?? key;
		if (params) {
			for (const [k, v] of Object.entries(params)) {
				str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
			}
		}
		return str;
	};
});
