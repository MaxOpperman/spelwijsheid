<svelte:head>
	<title>Hoe te spelen - Queens</title>
	<meta name="description" content="Speluitleg voor het Queens N-Queens puzzelspel" />
</svelte:head>

<div class="text-column">
	<h1>Hoe te spelen - Queens</h1>

	<p>
		Queens is een logische puzzel gebaseerd op het klassieke N-Dames schaakprobleem. Het doel is om
		N koninginnen te plaatsen op een N×N bord volgens specifieke regels.
	</p>

	<h2>De Regels</h2>

	<p>
		Je moet precies <strong>N koninginnen</strong> plaatsen op een N×N bord, waarbij je de volgende regels
		moet volgen:
	</p>

	<ul>
		<li>
			<strong>Één koningin per kleurgebied:</strong> Elk gekleurd gebied moet precies één koningin bevatten
		</li>
		<li><strong>Geen twee koninginnen in dezelfde rij</strong></li>
		<li><strong>Geen twee koninginnen in dezelfde kolom</strong></li>
		<li>
			<strong>Geen diagonaal aangrenzende koninginnen:</strong> Twee koninginnen mogen niet diagonaal
			aan elkaar grenzen (hoeken raken elkaar niet)
		</li>
	</ul>

	<h2>Hoe te Spelen</h2>

	<h3>Kruisjes Plaatsen</h3>
	<p>
		Klik één keer op een vak om een <strong>kruisje (✕)</strong> te plaatsen. Dit helpt je om aan te geven
		waar je zeker weet dat er geen koningin kan komen.
	</p>

	<div class="tip">
		<strong>Tip:</strong> Sleep je muis over vakken om meerdere kruisjes tegelijk te plaatsen!
	</div>

	<h3>Koninginnen Plaatsen</h3>
	<p>
		Klik op een kruisje om het om te zetten in een <strong>koningin (♛)</strong>. Je kunt ook direct
		op een leeg vak blijven klikken om door de staten te lopen: leeg → kruisje → koningin → leeg.
	</p>

	<h3>Ongeldige Plaatsingen</h3>
	<p>
		Als je een koningin plaatst die een van de regels schendt, wordt deze <span
			class="invalid-queen">wit met een rood kruis</span
		> getoond. Dit helpt je om fouten direct te zien:
	</p>

	<ul>
		<li>Twee koninginnen in dezelfde rij of kolom</li>
		<li>Twee koninginnen die diagonaal grenzen</li>
		<li>Twee koninginnen in hetzelfde kleurgebied</li>
	</ul>

	<h2>Knoppen</h2>

	<ul>
		<li><strong>Undo:</strong> Maak je laatste zet ongedaan</li>
		<li><strong>Clear:</strong> Verwijder alle koninginnen en kruisjes van het bord</li>
	</ul>

	<h2>Winnend</h2>

	<p>
		Je wint wanneer je alle N koninginnen correct hebt geplaatst volgens de regels. De timer houdt
		bij hoe lang je erover hebt gedaan, en je kunt je statistieken bekijken om je voortgang te
		volgen!
	</p>

	<div class="tip">
		<strong>Strategie tip:</strong> Begin met het vinden van vakken waar maar één positie mogelijk is
		binnen een kleurgebied, of waar rijen/kolommen al beperkt zijn.
	</div>

	<p>
		<a href="/queens"><i class="fa-solid fa-arrow-left"></i> Terug naar het spel</a>
	</p>
</div>

<style>
	h2 {
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: var(--color-theme-1);
	}

	h3 {
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: var(--color-text);
	}

	ul {
		margin: 1rem 0;
		padding-left: 2rem;
	}

	li {
		margin: 0.75rem 0;
		line-height: 1.6;
	}

	.tip {
		background: var(--color-bg-1);
		border-left: 4px solid var(--color-theme-1);
		padding: 1rem;
		margin: 1.5rem 0;
		border-radius: 4px;
	}

	.invalid-queen {
		color: darkred;
		font-weight: bold;
	}

	a {
		color: var(--color-theme-1);
		text-decoration: none;
		font-weight: 600;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
