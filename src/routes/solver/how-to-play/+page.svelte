<svelte:head>
	<title>Hoe werkt de Spelwijzer Solver</title>
	<meta name="description" content="Uitleg over hoe de Spelwijzer Solver werkt" />
</svelte:head>

<div class="text-column">
	<h1>Hoe werkt de Spelwijzer Solver</h1>

	<p>
		De Spelwijzer Solver helpt je woorden te vinden op basis van beschikbare letters. Voer tot 8 letters in om alle mogelijke Nederlandse woorden te vinden. Bijvoorbeeld:
	</p>

	<div class="example">
		<span class="exact">b</span>
		<span class="exact">a</span>
		<span class="exact">n</span>
		<span class="exact">d</span>
	</div>

	<p>
		Met deze letters <strong>b-a-n-d</strong> vindt de solver alle Nederlandse woorden die alleen deze letters gebruiken, zoals:
	</p>

	<ul>
		<li><strong>band</strong> - gebruikt alle letters</li>
		<li><strong>bad</strong> - gebruikt een subset van de letters</li>
		<li><strong>dan</strong> - gebruikt een ander subset</li>
		<li><strong>banaan</strong> - herhaalt letters uit de set</li>
	</ul>

	<p>
		Het <span class="exact">eerste vak</span> is verplicht - deze letter moet altijd in de gevonden woorden voorkomen.
	</p>

	<p>
		<strong>Speciale regels:</strong><br>
		• Woorden moeten minimaal 4 letters hebben<br>
		• "ij" telt als één letter<br>
		• Resultaten worden automatisch gegenereerd terwijl je typt<br>
		• Alleen Nederlandse woorden uit het officiële woordenboek
	</p>
</div>

<style>
	span {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		font-size: 0.8em;
		width: 2.4em;
		height: 2.4em;
		background-color: white;
		box-sizing: border-box;
		border-radius: 2px;
		border-width: 2px;
		color: rgba(0, 0, 0, 0.7);
	}



	.exact {
		background: var(--color-theme-2);
		color: white;
	}

	.example {
		display: flex;
		justify-content: flex-start;
		margin: 1rem 0;
		gap: 0.2rem;
	}

	.example span {
		font-size: 1.4rem;
	}

	p span {
		position: relative;
		border-width: 1px;
		border-radius: 1px;
		font-size: 0.4em;
		transform: scale(2) translate(0, -10%);
		margin: 0 1em;
	}
</style>
