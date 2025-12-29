<svelte:head>
	<title>Hoe te spelen - Onmogelijke Wordle</title>
</svelte:head>

<div class="content">
	<h1>Onmogelijke Wordle</h1>

	<p>
		Welkom bij de Onmogelijke Wordle! Dit is geen gewone Wordle. Het woord verandert
		<strong>terwijl je speelt</strong> om het zo moeilijk mogelijk te maken!
	</p>

	<section>
		<h2>Hoe het werkt</h2>
		<p>
			In plaats van een vast woord te kiezen, kiest de server slim het woord dat het
			<strong>verst weg</strong> is van jouw eerdere pogingen. Dit betekent dat het woord zich aanpast
			op basis van wat je raadt, waardoor je zo lang mogelijk in het spel blijft!
		</p>
	</section>

	<section>
		<h2>Voorbeeld</h2>
		<ol>
			<li>Je raadt "SPUIT" → Geen enkele letter komt overeen</li>
			<li>Je raadt "PLANK" → Nog steeds geen matches</li>
			<li>... (meer pogingen)</li>
			<li>
				Je raadt "GROND" → Nu <strong>moet</strong> het woord een 'O' bevatten (misschien de enige overgebleven
				klinker), maar op de verkeerde positie.
			</li>
			<li>Het spel gaat door totdat je het juiste woord raadt!</li>
		</ol>
	</section>

	<section>
		<h2>Verschillen met normale Wordle</h2>
		<ul>
			<li><strong>Onbeperkte pogingen</strong> - Geen limiet van 6 pogingen meer!</li>
			<li><strong>Timer</strong> - Je speelt tegen de klok in plaats van tegen een poginglimiet</li>
			<li>
				<strong>Aanpassend woord</strong> - Het woord verandert strategisch om het maximaal moeilijk te
				maken
			</li>
		</ul>
	</section>

	<section>
		<h2>Statistieken</h2>
		<p>In de Onmogelijke Modus worden de volgende statistieken bijgehouden:</p>
		<ul>
			<li><strong>Gespeeld</strong> - Totaal aantal gespeelde spellen</li>
			<li><strong>Correct</strong> - Aantal gewonnen spellen</li>
			<li><strong>Beste Tijd</strong> - Je snelste winst ooit</li>
			<li><strong>Gemiddelde Tijd</strong> - Je gemiddelde winnende tijd</li>
		</ul>
	</section>

	<section>
		<h2>Tips</h2>
		<ul>
			<li>Begin met woorden die veel verschillende letters bevatten</li>
			<li>Let goed op welke letters wel/niet voorkomen</li>
			<li>Het systeem probeert je te misleiden - denk strategisch!</li>
			<li>Snelheid is belangrijk, maar vergeet niet om na te denken</li>
		</ul>
	</section>

	<a href="/wordle-impossible">Terug naar het spel</a>
</div>

<style>
	.content {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		line-height: 1.6;
	}

	h1 {
		color: var(--color-theme-1);
		margin-bottom: 1rem;
	}

	h2 {
		color: var(--color-theme-2);
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	section {
		margin-bottom: 2rem;
	}

	ul,
	ol {
		margin-left: 1.5rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	a {
		display: inline-block;
		margin-top: 2rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-theme-1);
		color: white;
		text-decoration: none;
		border-radius: 4px;
		transition: background 0.2s;
	}

	a:hover {
		background: var(--color-theme-2);
	}

	strong {
		color: var(--color-theme-2);
	}

	@media (max-width: 600px) {
		.content {
			padding: 1rem;
			margin: 1rem auto;
		}
	}
</style>
