<script lang="ts">
	import { dev } from '$app/environment';

	// Get base path - empty in dev, /Spelwijsheid in production
	const base = dev ? '' : '/Spelwijsheid';
</script>

<svelte:head>
	<title>Hoe te spelen - Spelwijze</title>
</svelte:head>

<div class="content">
	<h1>Hoe werkt het Spelwijze spel?</h1>

	<section>
		<h2>🎯 Doel van het spel</h2>
		<p>
			Vind alle mogelijke Nederlandse woorden die je kunt maken met de willekeurig gegenereerde
			letters. Elke dag krijg je nieuwe letters om mee te spelen!
		</p>
	</section>

	<section>
		<h2>🎮 Spelregels</h2>
		<ol>
			<li>
				<strong>Automatische letters:</strong> Het spel genereert willekeurig 6-10 letters voor je
			</li>
			<li>
				<strong>Verplichte letter:</strong> De eerste letter (groen) MOET in elk woord voorkomen
			</li>
			<li>
				<strong>Optionele letters:</strong> De andere letters mag je gebruiken, maar het hoeft niet
			</li>
			<li><strong>Speciale regel:</strong> 'ij' telt als één letter in het Nederlands</li>
			<li><strong>Opslag:</strong> Je voortgang wordt automatisch opgeslagen</li>
		</ol>
	</section>

	<section>
		<h2>🕹️ Hoe te spelen</h2>
		<ol>
			<li>Klik op "Start het spel!" om te beginnen</li>
			<li>Typ woorden in het invoerveld en druk op Enter</li>
			<li>Geldige woorden worden toegevoegd aan je lijst</li>
			<li>Probeer alle mogelijke woorden te vinden!</li>
			<li>Je kunt altijd terugkomen - je voortgang wordt opgeslagen</li>
		</ol>
	</section>

	<section>
		<h2>📊 Score systeem</h2>
		<ul>
			<li><strong>10 punten</strong> per gevonden woord</li>
			<li><strong>Tijd bonus:</strong> Sneller = meer punten</li>
			<li><strong>100 punten</strong> extra als je alle woorden vindt</li>
		</ul>
	</section>

	<section>
		<h2>💡 Tips</h2>
		<ul>
			<li>Begin met korte woorden en werk naar langere woorden</li>
			<li>Denk aan verschillende woordvormen (meervoud, vervoegingen)</li>
			<li>Let op samenstellingen en afgeleide woorden</li>
			<li>Onthoud dat 'ij' als één letter telt</li>
		</ul>
	</section>

	<section>
		<h2>🎨 Voorbeeld</h2>
		<div class="example">
			<div class="letters-display">
				<span class="mandatory">b</span>
				<span class="optional">a</span>
				<span class="optional">n</span>
				<span class="optional">d</span>
			</div>
			<p><strong>Verplichte letter:</strong> b</p>
			<p><strong>Optionele letters:</strong> a, n, d</p>
			<p><strong>Mogelijke woorden:</strong> band, baan, bad, dan, and, enz.</p>
			<p><em>Alle woorden moeten de letter 'b' bevatten!</em></p>
		</div>
	</section>

	<div class="back-link">
		<a href="{base}/spelwijze">← Terug naar het spel</a>
	</div>
</div>

<style>
	.content {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
		line-height: 1.6;
	}

	h1 {
		color: var(--color-primary);
		text-align: center;
		margin-bottom: 2rem;
		font-size: 2.5rem;
	}

	h2 {
		color: var(--color-primary);
		margin: 2rem 0 1rem 0;
		font-size: 1.5rem;
		border-bottom: 2px solid var(--color-primary-light);
		padding-bottom: 0.5rem;
	}

	section {
		margin-bottom: 2.5rem;
		background: var(--color-surface);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--color-primary-light);
	}

	ol,
	ul {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	li {
		margin: 0.5rem 0;
		color: var(--color-text);
	}

	strong {
		color: var(--color-primary);
		font-weight: 600;
	}

	.example {
		background: var(--color-bg-2);
		padding: 1.5rem;
		border-radius: 8px;
		margin-top: 1rem;
		border: 2px solid var(--color-primary-light);
	}

	.letters-display {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		justify-content: center;
	}

	.letters-display span {
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-weight: 600;
		font-size: 1.2rem;
		text-transform: uppercase;
	}

	.mandatory {
		background: var(--color-accent);
		color: var(--color-surface);
	}

	.optional {
		background: var(--color-primary-light);
		color: var(--color-primary);
	}

	.back-link {
		text-align: center;
		margin-top: 3rem;
	}

	.back-link a {
		color: var(--color-primary);
		text-decoration: none;
		padding: 1rem 2rem;
		border: 2px solid var(--color-primary);
		border-radius: 8px;
		font-weight: 600;
		display: inline-block;
		transition: all 0.2s ease;
		background: var(--color-surface);
	}

	.back-link a:hover {
		background: var(--color-primary);
		color: var(--color-surface);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	}

	@media (max-width: 768px) {
		.content {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		section {
			padding: 1.5rem;
		}

		.letters-display {
			flex-wrap: wrap;
		}
	}
</style>
