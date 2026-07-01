<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>{$t('about.title')}</h1>

	<p>{$t('about.p1')}</p>

	<a href="https://github.com/MaxOpperman/Spelwijsheid">GitHub</a>

	<p>
		{$t('about.p2')} <a href="https://maxopperman.nl">maxopperman.nl</a>
	</p>

	<div class="about-you-action">
		<a href="/about/you" class="about-you-button">
			<span>{$t('about.aboutYou')}</span>
			<span aria-hidden="true" class="arrow">&rarr;</span>
		</a>
	</div>

	<p>{$t('about.p3')}</p>
</div>

<style>
	.about-you-action {
		margin: 1.5rem 0;
	}

	.about-you-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.9rem;
		border-radius: 0.5rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--color-primary);
		background: var(--color-primary-light);
		border: 1px solid color-mix(in oklab, var(--color-primary), white 65%);
		transition:
			background-color 120ms ease,
			color 120ms ease,
			border-color 120ms ease;
	}

	.about-you-button:hover,
	.about-you-button:focus-visible {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: #fff;
		text-decoration: none;
	}

	.about-you-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.arrow {
		font-size: 1.05em;
	}
</style>
