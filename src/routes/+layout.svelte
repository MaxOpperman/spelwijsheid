<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Header from './Header.svelte';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';
	import '../app.css';
	import { t } from '$lib/i18n';
	import { base } from '$app/paths';
	import { darkMode } from '$lib/stores/darkMode';
	import { setConsentFromServer, reportDevice } from '$lib/stores/consent';

	let { children } = $props();

	onMount(async () => {
		// Bootstrap the server-side session (creates the persistent `uid` cookie
		// even on prerendered pages) and sync preferences/consent state.
		try {
			const res = await fetch(`${base}/api/session`);
			if (!res.ok) return;
			const data = await res.json();
			// Only update if the server disagrees, to avoid a redundant write-back.
			if (get(darkMode) !== (data.darkMode === true)) {
				darkMode.set(data.darkMode === true);
			}
			setConsentFromServer(data);
			if (data.consentAnalytics) {
				reportDevice();
			}

			// Timezone is a functional preference (no analytics consent needed).
			// Persist it once when the server hasn't recorded it or it changed.
			try {
				const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
				if (tz && tz !== data.timezone) {
					fetch(`${base}/api/preferences`, {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ timezone: tz })
					}).catch(() => {
						/* best-effort */
					});
				}
			} catch {
				/* Intl unavailable — ignore */
			}
		} catch {
			/* offline / best-effort */
		}
	});
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>
			{$t('layout.followLinkedIn')}
			<a href="https://linkedin.com/in/max-opperman">https://linkedin.com/in/max-opperman</a>!
		</p>
	</footer>
</div>

<ConsentBanner />

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
