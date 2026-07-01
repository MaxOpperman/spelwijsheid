<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import 'leaflet/dist/leaflet.css';

	export let data: PageData;
	let mapElement: HTMLElement;

	onMount(async () => {
		if (data.user?.latitude && data.user?.longitude && typeof window !== 'undefined') {
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
			L.marker([data.user.latitude, data.user.longitude])
				.addTo(map)
				.bindPopup(
					`<b>${data.user.city ?? 'Unknown'}</b><br>${data.user.region ?? ''}, ${data.user.country ?? ''}`
				)
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
					{new Date(data.user.createdAt).toLocaleDateString()}
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

	{#if data.user.latitude && data.user.longitude}
		<div class="map-container">
			<h2>{$t('about.map')}</h2>
			<div bind:this={mapElement} class="map"></div>
		</div>
	{/if}
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

	@media (max-width: 900px) {
		.sections {
			grid-template-columns: 1fr;
		}
	}
</style>
