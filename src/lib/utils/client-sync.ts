import { base } from '$app/paths';

/**
 * Browsers cap persistent cookies at roughly 400 days, so this matches the
 * longest practical lifetime instead of pretending cookies can be truly
 * indefinite.
 */
export const PERSISTENT_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export function setCookie(name: string, value: string, maxAgeSeconds: number): void {
	document.cookie = `${name}=${value};path=/;max-age=${maxAgeSeconds};samesite=lax`;
}

export function postJsonBestEffort(path: string, body: unknown): void {
	fetch(`${base}${path}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	}).catch(() => {
		/* best-effort */
	});
}
