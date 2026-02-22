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

	<p>{$t('about.p3')}</p>
</div>
