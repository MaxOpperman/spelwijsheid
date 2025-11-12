<svelte:head>
	<title>Hoe werkt de Spelwijzer Solver</title>
	<meta name="description" content="Uitleg over hoe de Spelwijzer Solver werkt" />
</svelte:head>

<div class="content-container">
	<h1>Hoe werkt de Spelwijzer Solver</h1>

	<div class="info-card">
		<p>
			De Spelwijzer Solver helpt je woorden te vinden op basis van beschikbare letters. Voer tot 8 letters in om alle mogelijke Nederlandse woorden te vinden. Bijvoorbeeld:
		</p>

		<div class="example">
			<div class="input-demo required">b</div>
			<div class="input-demo">a</div>
			<div class="input-demo">n</div>
			<div class="input-demo">d</div>
		</div>

		<p>
			Met deze letters <strong>b-a-n-d</strong> vindt de solver alle Nederlandse woorden die alleen deze letters gebruiken, zoals:
		</p>

		<div class="word-examples">
			<div class="word-item"><strong>band</strong> - gebruikt alle letters</div>
			<div class="word-item"><strong>bad</strong> - gebruikt een subset van de letters</div>
			<div class="word-item"><strong>dan</strong> - gebruikt een ander subset</div>
			<div class="word-item"><strong>banaan</strong> - herhaalt letters uit de set</div>
			<div class="item word-item incorrect"><strong>naad</strong> - gebruikt niet de verplichte letter <div class="input-demo required inline">b</div></div>
			<div class="item word-item incorrect"><strong>bond</strong> - gebruikt letters die niet in de set staan</div>
		</div>

		<div class="highlight-box">
			Het <div class="input-demo required inline">b</div> eerste vak is verplicht - deze letter moet altijd in de gevonden woorden voorkomen.
		</div>

		<div class="rules-section">
			<h3>Speciale regels:</h3>
			<ul class="rules-list">
				<li>Woorden moeten minimaal 4 letters hebben</li>
				<li>"ij" telt als één letter</li>
				<li>Resultaten worden automatisch gegenereerd terwijl je typt</li>
				<li>Alleen Nederlandse woorden uit het officiële woordenboek</li>
			</ul>
		</div>
	</div>
</div>

<style>
	h1 {
		text-align: center;
		margin-bottom: 2rem;
		color: var(--color-text);
	}

	.content-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.info-card {
		background-color: var(--color-surface);
		border: 2px solid var(--color-primary-light);
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.example {
		display: flex;
		justify-content: center;
		margin: 2rem 0;
		gap: 0.75rem;
	}

	.error {
		border-color: !important var(--color-error);
		font-weight: 600;
	}

	.input-demo {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 3.6rem;
		height: 3.6rem;
		font-size: 1.4rem;
		font-weight: 600;
		text-align: center;
		background-color: var(--color-surface);
		border: 2px solid var(--color-primary-light);
		border-radius: 8px;
		box-sizing: border-box;
		transition: all 0.2s ease;
		color: var(--color-text);
	}

	.input-demo.required {
		border-color: var(--color-accent);
		border-width: 3px;
		background-color: rgba(5, 150, 105, 0.05);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.input-demo.inline {
		width: 2rem;
		height: 2rem;
		font-size: 0.9rem;
		margin: 0 0.5rem;
		vertical-align: middle;
	}

	.word-examples {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
		margin: 1.5rem 0;
	}

	.word-item {
		background-color: var(--color-surface);
		border: 1px solid var(--color-primary-light);
		padding: 0.75rem;
		border-radius: 8px;
		text-align: center;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		color: var(--color-text);
	}

	/* Incorrect / invalid example styling */
	.word-item.incorrect {
		border-color: var(--color-error, #dc2626);
		background-color: rgba(220, 38, 38, 0.06);
		box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
	}

	.word-item.incorrect strong {
		color: var(--color-error, #dc2626);
	}

	.word-item:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
		background-color: var(--color-primary-light);
	}

	.highlight-box {
		background-color: var(--color-bg-2);
		border: 2px solid var(--color-accent);
		border-radius: 8px;
		padding: 1.5rem;
		margin: 2rem 0;
		text-align: center;
	}

	.highlight-box p {
		margin: 0;
		font-weight: 500;
		color: var(--color-text);
	}

	.highlight-box .input-demo.inline {
		width: 2rem;
		height: 2rem;
		font-size: 0.9rem;
		margin: 0 0.5rem;
	}

	.rules-section {
		background-color: var(--color-surface);
		border: 1px solid var(--color-primary-light);
		border-radius: 12px;
		padding: 2rem;
		margin-top: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.rules-section h3 {
		margin-top: 0;
		color: var(--color-primary);
		font-size: 1.2rem;
		font-weight: 600;
		text-align: center;
	}

	.rules-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0 0;
	}

	.rules-list li {
		background-color: var(--color-bg-2);
		border: 1px solid var(--color-primary-light);
		margin-bottom: 0.75rem;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		position: relative;
		font-weight: 500;
		transition: all 0.2s ease;
		color: var(--color-text);
	}

	.rules-list li:hover {
		border-color: var(--color-primary);
		background-color: var(--color-primary-light);
		transform: translateX(4px);
	}

	.rules-list li::before {
		content: "✓";
		position: absolute;
		left: 0.75rem;
		color: var(--color-accent);
		font-weight: bold;
	}

	.rules-list li {
		padding-left: 2.5rem;
	}

	p {
		color: var(--color-text);
		line-height: 1.6;
		margin: 1rem 0;
	}

	strong {
		color: var(--color-primary);
	}
</style>
