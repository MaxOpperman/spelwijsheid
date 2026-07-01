import { browser } from '$app/environment';
import { base } from '$app/paths';
import { writable } from 'svelte/store';

export interface ConsentState {
	/** Whether the user has made an explicit choice yet. */
	decided: boolean;
	functional: boolean;
	analytics: boolean;
}

const initial: ConsentState = { decided: false, functional: true, analytics: false };

export const consent = writable<ConsentState>(initial);

/** Apply server-provided consent state (from the /api/session bootstrap). */
export function setConsentFromServer(state: {
	consentDecided: boolean;
	consentFunctional: boolean;
	consentAnalytics: boolean;
}) {
	consent.set({
		decided: state.consentDecided,
		functional: state.consentFunctional,
		analytics: state.consentAnalytics
	});
}

/** Persist a consent decision to the server and update the store. */
export async function saveConsent(analytics: boolean): Promise<void> {
	const next: ConsentState = { decided: true, functional: true, analytics };
	consent.set(next);
	if (!browser) return;
	await fetch(`${base}/api/consent`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ functional: true, analytics })
	}).catch(() => {
		/* best-effort */
	});

	if (analytics) {
		reportDevice();
	}
}

/** Send screen/viewport size to the server (only stored with analytics consent). */
export function reportDevice(): void {
	if (!browser) return;
	const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
	const nav = navigator as typeof navigator & {
		deviceMemory?: number;
		connection?: { type?: string; effectiveType?: string; downlink?: number };
	};
	fetch(`${base}/api/device`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			screenW: window.screen?.width,
			screenH: window.screen?.height,
			viewportW: window.innerWidth,
			viewportH: window.innerHeight,
			dpr: window.devicePixelRatio,
			colorScheme: prefersDark ? 'dark' : 'light',
			colorDepth: window.screen?.colorDepth,
			pointerCoarse: window.matchMedia?.('(pointer: coarse)')?.matches,
			hoverNone: window.matchMedia?.('(hover: none)')?.matches,
			cpuCores: nav.hardwareConcurrency,
			deviceMemory: nav.deviceMemory,
			connectionType: nav.connection?.type,
			connectionEffectiveType: nav.connection?.effectiveType,
			connectionDownlink: nav.connection?.downlink
		})
	}).catch(() => {
		/* best-effort */
	});
}
