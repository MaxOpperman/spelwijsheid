<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import 'leaflet/dist/leaflet.css';

	export let data: PageData;
	let mapElement: HTMLElement;

	// Explicit locale + timeZone makes output identical on SSR and client, preventing hydration mismatches.
	const tz = data.user.timezone ?? 'UTC';
	const loc = data.user.locale ?? 'en-US';
	const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString(loc, { timeZone: tz });
	const fmtDateTime = (d: Date | string) =>
		new Date(d).toLocaleString(loc, { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' });

	onMount(async () => {
		if (
			data.user.latitude != null &&
			data.user.longitude != null &&
			typeof window !== 'undefined'
		) {
			const L = await import('leaflet');
			const map = L.map(mapElement).setView([data.user.latitude, data.user.longitude], 10);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			// Configure marker image paths explicitly to avoid bundler path issues.
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: '/leaflet/marker-icon-2x.png',
				iconUrl: '/leaflet/marker-icon.png',
				shadowUrl: '/leaflet/marker-shadow.png'
			});

			// Only add a marker, rely on CSS filters or icons if we want dark mode specific markers
			// Escape user-supplied strings before injecting into popup HTML to prevent XSS.
			const escHtml = (s: string) =>
				s
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&#x27;');
			const city = escHtml(data.user.city ?? 'Unknown');
			const region = escHtml(data.user.region ?? '');
			const country = escHtml(data.user.country ?? '');
			L.marker([data.user.latitude, data.user.longitude])
				.addTo(map)
				.bindPopup(`<b>${city}</b><br>${region}, ${country}`)
				.openPopup();
		}
	});
</script>

<svelte:head>
	<title>{$t('about.aboutYou')}</title>
</svelte:head>

<div class="text-column about-you-page">
	<h1>{$t('about.aboutYou')}</h1>

	<p class="intro">{$t('about.hereIsInfo')}</p>

	{#if !data.user.consentAnalytics}
		<div class="notice">
			<p>{$t('about.consentNote')}</p>
		</div>
	{/if}

	<div class="sections">
		<section class="data-section">
			<h2>{$t('about.functionalPreferences')}</h2>
			<ul>
				<li>
					<b>{$t('about.darkMode')}:</b>
					{data.user.darkMode ? $t('about.enabled') : $t('about.disabled')}
				</li>
				<li><b>{$t('about.locale')}:</b> {data.user.locale ?? $t('about.auto')}</li>
				<li><b>{$t('about.timezone')}:</b> {data.user.timezone ?? $t('about.unknown')}</li>
				<li>
					<b>{$t('about.reducedMotion')}:</b>
					{data.user.reducedMotion ? $t('about.enabled') : $t('about.disabled')}
				</li>
				<li>
					<b>{$t('about.highContrast')}:</b>
					{data.user.highContrast ? $t('about.enabled') : $t('about.disabled')}
				</li>
				<li>
					<b>{$t('about.sound')}:</b>
					{data.user.soundEnabled ? $t('about.enabled') : $t('about.disabled')}
				</li>
			</ul>
		</section>

		<section class="data-section">
			<h2>{$t('about.engagementStats')}</h2>
			<ul>
				<li>
					<b>{$t('about.firstVisit')}:</b>
					{fmtDate(data.user.createdAt)}
				</li>
				<li><b>{$t('about.totalVisits')}:</b> {data.user.visitCount}</li>
				<li><b>{$t('about.currentStreak')}:</b> {data.user.currentStreak} {$t('about.days')}</li>
				<li><b>{$t('about.longestStreak')}:</b> {data.user.longestStreak} {$t('about.days')}</li>
				<li>
					<b>{$t('about.onboardingCompleted')}:</b>
					{data.user.onboardingCompleted ? $t('about.yes') : $t('about.no')}
				</li>
			</ul>
		</section>

		<section class="data-section">
			<h2>{$t('about.browserEnvironment')}</h2>
			<ul>
				<li>
					<b>{$t('about.browser')}:</b>
					{data.user.browser ?? $t('about.unknown')}
					{data.user.browserVersion ?? ''}
				</li>
				<li>
					<b>{$t('about.os')}:</b>
					{data.user.os ?? $t('about.unknown')}
					{data.user.osVersion ?? ''}
				</li>
				<li>
					<b>{$t('about.device')}:</b>
					{data.user.deviceVendor ?? ''}
					{data.user.deviceModel ?? ''} ({data.user.deviceType ?? $t('about.desktop')})
				</li>
				<li>
					<b>{$t('about.screenSize')}:</b>
					{data.user.screenW ? `${data.user.screenW}x${data.user.screenH}` : $t('about.unknown')}
				</li>
				<li><b>{$t('about.pixelRatio')}:</b> {data.user.dpr ?? $t('about.unknown')}</li>
			</ul>
		</section>

		<section class="data-section">
			<h2>{$t('about.location')}</h2>
			<ul>
				<li><b>{$t('about.country')}:</b> {data.user.country ?? $t('about.unknown')}</li>
				<li><b>{$t('about.region')}:</b> {data.user.region ?? $t('about.unknown')}</li>
				<li><b>{$t('about.city')}:</b> {data.user.city ?? $t('about.unknown')}</li>
				<li><b>{$t('about.ipAddress')}:</b> {data.user.ip ?? $t('about.hidden')}</li>
			</ul>
		</section>
	</div>

	{#if data.user.latitude != null && data.user.longitude != null}
		<div class="map-container">
			<h2>{$t('about.map')}</h2>
			<div bind:this={mapElement} class="map"></div>
		</div>
	{/if}

	<details class="advanced">
		<summary>{$t('about.advanced')}</summary>
		<p class="advanced-desc">{$t('about.advancedDesc')}</p>
		<div class="sections">
			<section class="data-section">
				<h2>{$t('about.account')}</h2>
				<ul>
					<li><b>{$t('about.userId')}:</b> <code>{data.user.id}</code></li>
					<li><b>{$t('about.lastSeen')}:</b> {fmtDateTime(data.user.lastSeen)}</li>
					<li>
						<b>{$t('about.lastActiveAt')}:</b>
						{data.user.lastActiveAt ? fmtDateTime(data.user.lastActiveAt) : $t('about.never')}
					</li>
					<li>
						<b>{$t('about.lastStreakDate')}:</b>
						{data.user.lastStreakDate ?? $t('about.never')}
					</li>
					<li><b>{$t('about.referrer')}:</b> {data.user.referrer ?? $t('about.unknown')}</li>
				</ul>
			</section>

			<section class="data-section">
				<h2>{$t('about.consent')}</h2>
				<ul>
					<li>
						<b>{$t('about.consentFunctional')}:</b>
						{data.user.consentFunctional ? $t('about.yes') : $t('about.no')}
					</li>
					<li>
						<b>{$t('about.consentUpdatedAt')}:</b>
						{data.user.consentUpdatedAt
							? fmtDateTime(data.user.consentUpdatedAt)
							: $t('about.never')}
					</li>
					<li>
						<b>{$t('about.consentVersion')}:</b>
						{data.user.consentVersion ?? $t('about.unknown')}
					</li>
				</ul>
			</section>

			<section class="data-section">
				<h2>{$t('about.dataLifecycle')}</h2>
				<ul>
					<li>
						<b>{$t('about.deletedAt')}:</b>
						{data.user.deletedAt ? fmtDateTime(data.user.deletedAt) : $t('about.never')}
					</li>
					<li>
						<b>{$t('about.dataRetentionExpiresAt')}:</b>
						{data.user.dataRetentionExpiresAt
							? fmtDateTime(data.user.dataRetentionExpiresAt)
							: $t('about.never')}
					</li>
				</ul>
			</section>

			<section class="data-section">
				<h2>{$t('about.networkEnvironment')}</h2>
				<ul>
					<li>
						<b>{$t('about.languageHeader')}:</b>
						{data.user.languageHeader ?? $t('about.unknown')}
					</li>
					<li><b>{$t('about.colorScheme')}:</b> {data.user.colorScheme ?? $t('about.unknown')}</li>
					<li>
						<b>{$t('about.viewportSize')}:</b>
						{data.user.viewportW
							? `${data.user.viewportW}x${data.user.viewportH}`
							: $t('about.unknown')}
					</li>
				</ul>
			</section>

			<section class="data-section">
				<h2>{$t('about.identityMatching')}</h2>
				<ul>
					<li>
						<b>{$t('about.identityId')}:</b>
						{data.user.identityId ? data.user.identityId : $t('about.unknown')}
					</li>
					<li>
						<b>{$t('about.fingerprintHash')}:</b>
						<code>{data.user.fingerprintHash ?? $t('about.unknown')}</code>
					</li>
					<li>
						<b>{$t('about.matchConfidence')}:</b>
						{data.user.matchConfidence ?? $t('about.unknown')}
					</li>
				</ul>
			</section>
		</div>
	</details>
</div>

<style>
	.about-you-page {
		margin-top: 1.5rem;
		padding-bottom: 1.5rem;
	}

	.intro {
		margin-bottom: 1.25rem;
	}

	.notice {
		background: var(--color-surface);
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		border-left: 4px solid var(--color-theme-1);
	}

	.sections {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.data-section {
		background: var(--color-surface);
		padding: 0.85rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid color-mix(in oklab, var(--color-primary), white 82%);
	}

	h2 {
		font-size: 1.35rem;
		margin: 0 0 0.6rem 0;
		text-align: left;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: 0.2rem;
		line-height: 1.5;
	}

	.map-container {
		margin-top: 1.25rem;
	}

	.map {
		height: 320px;
		width: 100%;
		border-radius: 0.5rem;
		border: 1px solid color-mix(in oklab, var(--color-primary), white 82%);
		z-index: 1; /* Keep leaflet under other overlays like headers */
	}

	.advanced {
		margin-top: 2rem;
		border-top: 1px solid color-mix(in oklab, var(--color-primary), white 82%);
		padding-top: 1.25rem;
	}

	.advanced summary {
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-light);
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		user-select: none;
	}

	.advanced summary::before {
		content: '▶';
		font-size: 0.7em;
		transition: transform 200ms ease;
	}

	.advanced[open] summary::before {
		transform: rotate(90deg);
	}

	.advanced-desc {
		margin: 0.6rem 0 1rem;
		color: var(--color-text-light);
		font-size: 0.9rem;
	}

	code {
		font-family: var(--font-mono);
		font-size: 0.8em;
		background: color-mix(in oklab, var(--color-primary), white 90%);
		padding: 0.1em 0.35em;
		border-radius: 0.25rem;
		word-break: break-all;
	}

	@media (max-width: 900px) {
		.sections {
			grid-template-columns: 1fr;
		}
	}
</style>
