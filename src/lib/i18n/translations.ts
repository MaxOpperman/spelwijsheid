import type { Locale } from '$lib/stores/locale';

export type TranslationKey = keyof (typeof translations)['en-US'];

export const translations: Record<Locale, Record<string, string>> = {
	'en-US': {
		// Navigation
		'nav.home': 'Home',
		'nav.games': 'Games',
		'nav.solvers': 'Solvers',
		'nav.about': 'About',
		'nav.wordleImpossible': 'Impossible Wordle',
		'nav.queens': 'N-Queens',
		'nav.wordleSolver': 'Wordle Solver',
		'nav.spelwijzeSolver': 'Spelwijze Solver',

		// Layout
		'layout.followLinkedIn': 'Follow me on LinkedIn',

		// Home
		'home.pun': 'What do you call a dancing puzzle?',
		'home.punAnswer': 'A Jiggy-Saw!',

		// About
		'about.title': 'About the Spelwijsheid app',
		'about.p1':
			'This app was created by Max Opperman as a demonstration of SvelteKit. The goal is to provide an easy-to-use tool for solving Spelwijze puzzles. The code is fully open-source and available on:',
		'about.p2':
			'For further questions or suggestions, feel free to reach out via GitHub or send an email. For more information about me and my work, visit my personal website at:',
		'about.p3': 'Thank you for using the Spelwijsheid app!',

		// Common
		'common.howToPlay': 'How to play',
		'common.newGame': 'New Game',
		'common.loading': 'Loading...',
		'common.reset': 'Reset',
		'common.undo': 'Undo',
		'common.time': 'Time',
		'common.selectLanguage': 'Select language',

		// Pinpoint
		'pinpoint.subtitle': 'Guess the word. A new clue reveals after every wrong answer.',
		'pinpoint.generating': 'Generating a new puzzle…',
		'pinpoint.welcomeDesc':
			'Each round, the AI generates a secret word. You get up to 5 clues — one revealed per wrong guess. Can you guess it from the first clue?',
		'pinpoint.startGame': 'Start Game',
		'pinpoint.clue': 'CLUE {n}',
		'pinpoint.theAnswerWas': 'The answer was: {word}',
		'pinpoint.guessPlaceholder': 'Guess the category…',
		'pinpoint.clueCounter': '{revealed} of 5',
		'pinpoint.guess': 'Guess',
		'pinpoint.pausePlaying': 'Pause playing',

		// Queens
		'queens.howToPlay': 'How to play',
		'queens.clearBoard': 'Clear Board',
		'queens.newGame': 'New Game',
		'queens.puzzleSolved': '🎉 Puzzle Solved! 🎉',
		'queens.yourTime': 'Your Time',
		'queens.completed': 'Completed',
		'queens.fastest': 'Fastest',
		'queens.average': 'Average',
		'queens.avgPerBoardSize': 'Average per Board Size',
		'queens.gameSingular': 'game',
		'queens.gamePlural': 'games',

		// Wordle
		'wordle.howToPlay': 'How to play',
		'wordle.theAnswerWas': 'the answer was "{answer}"',
		'wordle.youWon': 'you won :)',
		'wordle.gameOver': 'game over :(',
		'wordle.playAgain': 'play again?',
		'wordle.enter': 'enter',
		'wordle.back': 'back',

		// Wordle StatsPanel
		'wordle.stats': 'Statistics',
		'wordle.played': 'Played',
		'wordle.won': 'Won',
		'wordle.currentStreak': 'Current Streak',
		'wordle.bestStreak': 'Best Streak',
		'wordle.guessDistribution': 'Guesses per word',

		// Impossible Wordle
		'wordleImpossible.howToPlay': 'How to play',
		'wordleImpossible.title': 'Impossible Wordle',
		'wordleImpossible.time': 'Time:',
		'wordleImpossible.guesses': 'Guesses:',
		'wordleImpossible.loading': 'Loading...',
		'wordleImpossible.stats': 'Statistics',
		'wordleImpossible.played': 'Played',
		'wordleImpossible.correct': 'Correct',
		'wordleImpossible.bestTime': 'Best Time',
		'wordleImpossible.avgTime': 'Average Time',
		'wordleImpossible.guessDistribution': 'Guesses per word',

		// Spelwijze Solver
		'spelwijzeSolver.title': 'Spelwijsheid - Spelwijze Solutions',
		'spelwijzeSolver.howItWorks': 'How does the Spelwijze Solver work?',
		'spelwijzeSolver.enterMax': 'Enter up to {n} characters:',
		'spelwijzeSolver.requiredLetter': 'Required letter',
		'spelwijzeSolver.letterN': 'Letter {n}',
		'spelwijzeSolver.caseInsensitive': 'Case-insensitive search',
		'spelwijzeSolver.ignoreAccents': 'Ignore accents (e.g. ü → u)',
		'spelwijzeSolver.sortBy': 'Sort by:',
		'spelwijzeSolver.sortByLength': 'Length',
		'spelwijzeSolver.sortAlpha': 'Alphabetically',
		'spelwijzeSolver.foundWords': 'Found words ({n}):',
		'spelwijzeSolver.noWords': 'No words found with these letters.',
		'spelwijzeSolver.enterAtLeast': 'Enter at least 1 character to generate words.',

		// Wordle Solver
		'wordleSolver.description': 'Enter what you know about the word to find possible solutions',
		'wordleSolver.exactPositions': 'Exact Positions (Green)',
		'wordleSolver.wrongPositions': 'Correct Letter, Wrong Positions (Yellow)',
		'wordleSolver.wrongPositionsHint':
			'Enter letters that appear in the word but not at these positions',
		'wordleSolver.position': 'Position {n}',
		'wordleSolver.absentLetters': 'Absent Letters (Gray)',
		'wordleSolver.absentLettersHint': "Enter letters that don't appear in the word",
		'wordleSolver.absentPlaceholder': 'letters not in the word',
		'wordleSolver.digraph': "Allow 'ĳ' digraph (treat 'ij' as one character)",
		'wordleSolver.possibleWords': 'Possible Words ({n})',
		'wordleSolver.showing': 'Showing the first {shown} of {total} results',
		'wordleSolver.showMore': 'Show More Solutions',
		'wordleSolver.noResults': 'No matching words found. Try adjusting your criteria.',
		'wordleSolver.nLetters': '{n} characters',

		// Spelwijze (WelcomeScreen)
		'spelwijze.howItWorks': 'How does the game work?',
		'spelwijze.welcome': 'Welcome to Spelwijze!',
		'spelwijze.subtitle': 'Find all Dutch words with the given letters',
		'spelwijze.todaysChallenge': "🎲 Today's Challenge",
		'spelwijze.useLetters': 'Use these letters to find as many words as possible:',
		'spelwijze.requiredLetter': 'Required letter (must be in every word)',
		'spelwijze.optionalLetters': 'Optional letters',
		'spelwijze.possibleWordsLabel': 'Possible words',
		'spelwijze.lettersToPlay': 'Letters to play with',
		'spelwijze.timeToPlay': 'Time to play',
		'spelwijze.continueGame': '▶️ Continue game',
		'spelwijze.startNewGame': '🚀 Start the new game!',
		'spelwijze.startGame': '🚀 Start the game!',
		'spelwijze.newLetters': '🎲 New letters',
		'spelwijze.rules': '💡 Rules:',
		'spelwijze.rule1Pre': 'Every word ',
		'spelwijze.rule1Em': 'must',
		'spelwijze.rule1Post': ' contain the green letter.',
		'spelwijze.rule2': 'You may only use the other letters that are visible.',
		'spelwijze.rule3': 'Your progress is saved automatically.',
		'spelwijze.rule4': 'Try to find all {n} words!',
		'spelwijze.generating': 'Generating perfect letter combination...',

		// Spelwijze (GameView)
		'spelwijze.timeLabel': 'Time:',
		'spelwijze.foundLabel': 'Found:',
		'spelwijze.progressLabel': 'Progress:',
		'spelwijze.resumeBtn': '▶️ Continue',
		'spelwijze.pauseBtn': '⏸️ Pause',
		'spelwijze.pausedPlaceholder': 'Game is paused...',
		'spelwijze.typePlaceholder': 'Type a word...',
		'spelwijze.addBtn': 'Add',
		'spelwijze.foundWords': 'Found words ({n}):',
		'spelwijze.noWordsYet': 'No words found yet. Start typing!',
		'spelwijze.gameNewGame': 'New game',
		'spelwijze.congratulations': '🎉 Congratulations!',
		'spelwijze.allWordsFound': 'You found all {n} words!',
		'spelwijze.score': 'Score: {n} points',
		'spelwijze.playAgain': 'Play again',

		// GameState
		'gameState.preparingGame': 'Preparing the game...'
	},

	'en-GB': {
		// Navigation
		'nav.home': 'Home',
		'nav.games': 'Games',
		'nav.solvers': 'Solvers',
		'nav.about': 'About',
		'nav.wordleImpossible': 'Impossible Wordle',
		'nav.queens': 'N-Queens',
		'nav.wordleSolver': 'Wordle Solver',
		'nav.spelwijzeSolver': 'Spelwijze Solver',

		// Layout
		'layout.followLinkedIn': 'Follow me on LinkedIn',

		// Home
		'home.pun': 'What do you call a dancing puzzle?',
		'home.punAnswer': 'A Jiggy-Saw!',

		// About
		'about.title': 'About the Spelwijsheid app',
		'about.p1':
			'This app was created by Max Opperman as a demonstration of SvelteKit. The goal is to provide an easy-to-use tool for solving Spelwijze puzzles. The code is fully open-source and available on:',
		'about.p2':
			'For further questions or suggestions, feel free to reach out via GitHub or send an email. For more information about me and my work, visit my personal website at:',
		'about.p3': 'Thank you for using the Spelwijsheid app!',

		// Common
		'common.howToPlay': 'How to play',
		'common.newGame': 'New Game',
		'common.loading': 'Loading...',
		'common.reset': 'Reset',
		'common.undo': 'Undo',
		'common.time': 'Time',
		'common.selectLanguage': 'Select language',

		// Pinpoint
		'pinpoint.subtitle': 'Guess the word. A new clue reveals after every wrong answer.',
		'pinpoint.generating': 'Generating a new puzzle…',
		'pinpoint.welcomeDesc':
			'Each round, the AI generates a secret word. You get up to 5 clues — one revealed per wrong guess. Can you guess it from the first clue?',
		'pinpoint.startGame': 'Start Game',
		'pinpoint.clue': 'CLUE {n}',
		'pinpoint.theAnswerWas': 'The answer was: {word}',
		'pinpoint.guessPlaceholder': 'Guess the category…',
		'pinpoint.clueCounter': '{revealed} of 5',
		'pinpoint.guess': 'Guess',
		'pinpoint.pausePlaying': 'Pause playing',

		// Queens
		'queens.howToPlay': 'How to play',
		'queens.clearBoard': 'Clear Board',
		'queens.newGame': 'New Game',
		'queens.puzzleSolved': '🎉 Puzzle Solved! 🎉',
		'queens.yourTime': 'Your Time',
		'queens.completed': 'Completed',
		'queens.fastest': 'Fastest',
		'queens.average': 'Average',
		'queens.avgPerBoardSize': 'Average per Board Size',
		'queens.gameSingular': 'game',
		'queens.gamePlural': 'games',

		// Wordle
		'wordle.howToPlay': 'How to play',
		'wordle.theAnswerWas': 'the answer was "{answer}"',
		'wordle.youWon': 'you won :)',
		'wordle.gameOver': 'game over :(',
		'wordle.playAgain': 'play again?',
		'wordle.enter': 'enter',
		'wordle.back': 'back',

		// Wordle StatsPanel
		'wordle.stats': 'Statistics',
		'wordle.played': 'Played',
		'wordle.won': 'Won',
		'wordle.currentStreak': 'Current Streak',
		'wordle.bestStreak': 'Best Streak',
		'wordle.guessDistribution': 'Guesses per word',

		// Impossible Wordle
		'wordleImpossible.howToPlay': 'How to play',
		'wordleImpossible.title': 'Impossible Wordle',
		'wordleImpossible.time': 'Time:',
		'wordleImpossible.guesses': 'Guesses:',
		'wordleImpossible.loading': 'Loading...',
		'wordleImpossible.stats': 'Statistics',
		'wordleImpossible.played': 'Played',
		'wordleImpossible.correct': 'Correct',
		'wordleImpossible.bestTime': 'Best Time',
		'wordleImpossible.avgTime': 'Average Time',
		'wordleImpossible.guessDistribution': 'Guesses per word',

		// Spelwijze Solver
		'spelwijzeSolver.title': 'Spelwijsheid - Spelwijze Solutions',
		'spelwijzeSolver.howItWorks': 'How does the Spelwijze Solver work?',
		'spelwijzeSolver.enterMax': 'Enter up to {n} characters:',
		'spelwijzeSolver.requiredLetter': 'Required character',
		'spelwijzeSolver.letterN': 'Character {n}',
		'spelwijzeSolver.caseInsensitive': 'Case-insensitive search',
		'spelwijzeSolver.ignoreAccents': 'Ignore accents (e.g. ü → u)',
		'spelwijzeSolver.sortBy': 'Sort by:',
		'spelwijzeSolver.sortByLength': 'Length',
		'spelwijzeSolver.sortAlpha': 'Alphabetically',
		'spelwijzeSolver.foundWords': 'Found words ({n}):',
		'spelwijzeSolver.noWords': 'No words found with these characters.',
		'spelwijzeSolver.enterAtLeast': 'Enter at least 1 character to generate words.',

		// Wordle Solver
		'wordleSolver.description': 'Enter what you know about the word to find possible solutions',
		'wordleSolver.exactPositions': 'Exact Positions (Green)',
		'wordleSolver.wrongPositions': 'Correct Character, Wrong Positions (Yellow)',
		'wordleSolver.wrongPositionsHint':
			'Enter characters that appear in the word but not at these positions',
		'wordleSolver.position': 'Position {n}',
		'wordleSolver.absentLetters': 'Absent Characters (Grey)',
		'wordleSolver.absentLettersHint': "Enter characters that don't appear in the word",
		'wordleSolver.absentPlaceholder': 'characters not in the word',
		'wordleSolver.digraph': "Allow 'ĳ' digraph (treat 'ij' as one character)",
		'wordleSolver.possibleWords': 'Possible Words ({n})',
		'wordleSolver.showing': 'Showing the first {shown} of {total} results',
		'wordleSolver.showMore': 'Show More Solutions',
		'wordleSolver.noResults': 'No matching words found. Try adjusting your criteria.',
		'wordleSolver.nLetters': '{n} characters',

		// Spelwijze (WelcomeScreen)
		'spelwijze.howItWorks': 'How does the game work?',
		'spelwijze.welcome': 'Welcome to Spelwijze!',
		'spelwijze.subtitle': 'Find all Dutch words with the given characters',
		'spelwijze.todaysChallenge': "🎲 Today's Challenge",
		'spelwijze.useLetters': 'Use these characters to find as many words as possible:',
		'spelwijze.requiredLetter': 'Required character (must be in every word)',
		'spelwijze.optionalLetters': 'Optional characters',
		'spelwijze.possibleWordsLabel': 'Possible words',
		'spelwijze.lettersToPlay': 'Characters to play with',
		'spelwijze.timeToPlay': 'Time to play',
		'spelwijze.continueGame': '▶️ Continue game',
		'spelwijze.startNewGame': '🚀 Start the new game!',
		'spelwijze.startGame': '🚀 Start the game!',
		'spelwijze.newLetters': '🎲 New characters',
		'spelwijze.rules': '💡 Rules:',
		'spelwijze.rule1Pre': 'Every word ',
		'spelwijze.rule1Em': 'must',
		'spelwijze.rule1Post': ' contain the green character.',
		'spelwijze.rule2': 'You may only use the other characters that are visible.',
		'spelwijze.rule3': 'Your progress is saved automatically.',
		'spelwijze.rule4': 'Try to find all {n} words!',
		'spelwijze.generating': 'Generating perfect character combination...',

		// Spelwijze (GameView)
		'spelwijze.timeLabel': 'Time:',
		'spelwijze.foundLabel': 'Found:',
		'spelwijze.progressLabel': 'Progress:',
		'spelwijze.resumeBtn': '▶️ Continue',
		'spelwijze.pauseBtn': '⏸️ Pause',
		'spelwijze.pausedPlaceholder': 'Game is paused...',
		'spelwijze.typePlaceholder': 'Type a word...',
		'spelwijze.addBtn': 'Add',
		'spelwijze.foundWords': 'Found words ({n}):',
		'spelwijze.noWordsYet': 'No words found yet. Start typing!',
		'spelwijze.gameNewGame': 'New game',
		'spelwijze.congratulations': '🎉 Congratulations!',
		'spelwijze.allWordsFound': 'You found all {n} words!',
		'spelwijze.score': 'Score: {n} points',
		'spelwijze.playAgain': 'Play again',

		// GameState
		'gameState.preparingGame': 'Preparing the game...'
	},

	'nl-NL': {
		// Navigation
		'nav.home': 'Home',
		'nav.games': 'Spellen',
		'nav.solvers': 'Oplossers',
		'nav.about': 'Over',
		'nav.wordleImpossible': 'Onmogelijke Wordle',
		'nav.queens': 'N-Koninginnen',
		'nav.wordleSolver': 'Wordle Oplosser',
		'nav.spelwijzeSolver': 'Spelwijze Oplosser',

		// Layout
		'layout.followLinkedIn': 'Volg mij op LinkedIn',

		// Home
		'home.pun': 'Welke walvis kan alle puzzels oplossen?',
		'home.punAnswer': 'De Oréka!',

		// About
		'about.title': 'Over de Spelwijsheid app',
		'about.p1':
			'Deze app is gemaakt door Max Opperman als een demonstratie van SvelteKit. Het doel is om een simpel te gebruiken hulpmiddel te bieden voor het oplossen van de Spelwijze puzzels. De code is volledig open-source en beschikbaar op:',
		'about.p2':
			'Voor verdere vragen of suggesties, neem gerust contact op via GitHub of stuur een e-mail. Voor meer informatie over mijzelf en mijn werk, bezoek mijn persoonlijke website op:',
		'about.p3': 'Bedankt voor het gebruiken van de Spelwijsheid app!',

		// Common
		'common.howToPlay': 'Hoe te spelen',
		'common.newGame': 'Nieuw Spel',
		'common.loading': 'Laden...',
		'common.reset': 'Reset',
		'common.undo': 'Ongedaan maken',
		'common.time': 'Tijd',
		'common.selectLanguage': 'Selecteer taal',

		// Pinpoint
		'pinpoint.subtitle': 'Raad het woord. Een nieuwe aanwijzing verschijnt na elk fout antwoord.',
		'pinpoint.generating': 'Nieuw puzzel genereren…',
		'pinpoint.welcomeDesc':
			'Elke ronde genereert de AI een geheim woord. Je krijgt maximaal 5 aanwijzingen — één per fout antwoord. Kun je het raden van de eerste aanwijzing?',
		'pinpoint.startGame': 'Start Spel',
		'pinpoint.clue': 'AANWIJZING {n}',
		'pinpoint.theAnswerWas': 'Het antwoord was: {word}',
		'pinpoint.guessPlaceholder': 'Raad de categorie…',
		'pinpoint.clueCounter': '{revealed} van 5',
		'pinpoint.guess': 'Raden',
		'pinpoint.pausePlaying': 'Pauzeer spelen',

		// Queens
		'queens.howToPlay': 'Hoe te spelen',
		'queens.clearBoard': 'Bord Legen',
		'queens.newGame': 'Nieuw Spel',
		'queens.puzzleSolved': '🎉 Puzzel Opgelost! 🎉',
		'queens.yourTime': 'Jouw Tijd',
		'queens.completed': 'Voltooid',
		'queens.fastest': 'Snelste',
		'queens.average': 'Gemiddelde',
		'queens.avgPerBoardSize': 'Gemiddelde per Bordgrootte',
		'queens.gameSingular': 'spel',
		'queens.gamePlural': 'spellen',

		// Wordle
		'wordle.howToPlay': 'Hoe te spelen',
		'wordle.theAnswerWas': 'het antwoord was "{answer}"',
		'wordle.youWon': 'je hebt gewonnen :)',
		'wordle.gameOver': 'game over :(',
		'wordle.playAgain': 'opnieuw spelen?',
		'wordle.enter': 'enter',
		'wordle.back': 'terug',

		// Wordle StatsPanel
		'wordle.stats': 'Statistieken',
		'wordle.played': 'Gespeeld',
		'wordle.won': 'Gewonnen',
		'wordle.currentStreak': 'Huidige Reeks',
		'wordle.bestStreak': 'Beste Reeks',
		'wordle.guessDistribution': 'Aantal beurten per woord',

		// Impossible Wordle
		'wordleImpossible.howToPlay': 'Hoe te spelen',
		'wordleImpossible.title': 'Onmogelijke Wordle',
		'wordleImpossible.time': 'Tijd:',
		'wordleImpossible.guesses': 'Pogingen:',
		'wordleImpossible.loading': 'Laden...',
		'wordleImpossible.stats': 'Statistieken',
		'wordleImpossible.played': 'Gespeeld',
		'wordleImpossible.correct': 'Correct',
		'wordleImpossible.bestTime': 'Beste Tijd',
		'wordleImpossible.avgTime': 'Gemiddelde Tijd',
		'wordleImpossible.guessDistribution': 'Aantal beurten per woord',

		// Spelwijze Solver
		'spelwijzeSolver.title': 'Spelwijsheid - Spelwijze Oplossingen',
		'spelwijzeSolver.howItWorks': 'Hoe werkt de Spelwijze Solver?',
		'spelwijzeSolver.enterMax': 'Voer maximaal {n} karakters in:',
		'spelwijzeSolver.requiredLetter': 'Verplichte letter',
		'spelwijzeSolver.letterN': 'Letter {n}',
		'spelwijzeSolver.caseInsensitive': 'Hoofdletterongevoelig zoeken',
		'spelwijzeSolver.ignoreAccents': 'Negeer accenten (bijv. ü → u)',
		'spelwijzeSolver.sortBy': 'Sorteer op:',
		'spelwijzeSolver.sortByLength': 'Lengte',
		'spelwijzeSolver.sortAlpha': 'Alfabetisch',
		'spelwijzeSolver.foundWords': 'Gevonden woorden ({n}):',
		'spelwijzeSolver.noWords': 'Geen woorden gevonden met deze letters.',
		'spelwijzeSolver.enterAtLeast': 'Voer ten minste 1 karakter in om woorden te genereren.',

		// Wordle Solver
		'wordleSolver.description':
			'Voer in wat je weet over het woord om mogelijke oplossingen te vinden',
		'wordleSolver.exactPositions': 'Exact Posities (Groen)',
		'wordleSolver.wrongPositions': 'Goede Letter, Verkeerde Posities (Geel)',
		'wordleSolver.wrongPositionsHint':
			'Voer letters in die in het woord voorkomen maar niet op deze posities',
		'wordleSolver.position': 'Positie {n}',
		'wordleSolver.absentLetters': 'Absente Letters (Grijs)',
		'wordleSolver.absentLettersHint': 'Voer letters in die niet in het woord voorkomen',
		'wordleSolver.absentPlaceholder': 'letters die niet voorkomen',
		'wordleSolver.digraph': "Sta 'ĳ' digraaf toe (behandel 'ij' als één teken)",
		'wordleSolver.possibleWords': 'Mogelijke Woorden ({n})',
		'wordleSolver.showing': 'Toont de eerste {shown} van {total} resultaten',
		'wordleSolver.showMore': 'Toon Meer Oplossingen',
		'wordleSolver.noResults':
			'Geen overeenkomende woorden gevonden. Probeer je criteria aan te passen.',
		'wordleSolver.nLetters': '{n} letters',

		// Spelwijze (WelcomeScreen)
		'spelwijze.howItWorks': 'Hoe werkt het spel?',
		'spelwijze.welcome': 'Welkom bij Spelwijze!',
		'spelwijze.subtitle': 'Vind alle Nederlandse woorden met de gegeven letters',
		'spelwijze.todaysChallenge': "🎲 Vandaag's Uitdaging",
		'spelwijze.useLetters': 'Gebruik deze letters om zo veel mogelijk woorden te vinden:',
		'spelwijze.requiredLetter': 'Verplichte letter (moet in elk woord)',
		'spelwijze.optionalLetters': 'Optionele letters',
		'spelwijze.possibleWordsLabel': 'Mogelijke woorden',
		'spelwijze.lettersToPlay': 'Letters om mee te spelen',
		'spelwijze.timeToPlay': 'Tijd om te spelen',
		'spelwijze.continueGame': '▶️ Doorgaan met spel',
		'spelwijze.startNewGame': '🚀 Start het nieuwe spel!',
		'spelwijze.startGame': '🚀 Start het spel!',
		'spelwijze.newLetters': '🎲 Nieuwe letters',
		'spelwijze.rules': '💡 Spelregels:',
		'spelwijze.rule1Pre': 'Elk woord ',
		'spelwijze.rule1Em': 'moet',
		'spelwijze.rule1Post': ' de groene letter bevatten.',
		'spelwijze.rule2': 'Je mag alleen de andere letters gebruiken die zichtbaar zijn.',
		'spelwijze.rule3': 'Je voortgang wordt automatisch opgeslagen.',
		'spelwijze.rule4': 'Probeer alle {n} woorden te vinden!',
		'spelwijze.generating': 'Genereren van perfecte lettercombinatie...',

		// Spelwijze (GameView)
		'spelwijze.timeLabel': 'Tijd:',
		'spelwijze.foundLabel': 'Gevonden:',
		'spelwijze.progressLabel': 'Voortgang:',
		'spelwijze.resumeBtn': '▶️ Doorgaan',
		'spelwijze.pauseBtn': '⏸️ Pauzeren',
		'spelwijze.pausedPlaceholder': 'Spel is gepauzeerd...',
		'spelwijze.typePlaceholder': 'Typ een woord...',
		'spelwijze.addBtn': 'Toevoegen',
		'spelwijze.foundWords': 'Gevonden woorden ({n}):',
		'spelwijze.noWordsYet': 'Nog geen woorden gevonden. Begin met typen!',
		'spelwijze.gameNewGame': 'Nieuw spel',
		'spelwijze.congratulations': '🎉 Gefeliciteerd!',
		'spelwijze.allWordsFound': 'Je hebt alle {n} woorden gevonden!',
		'spelwijze.score': 'Score: {n} punten',
		'spelwijze.playAgain': 'Speel opnieuw',

		// GameState
		'gameState.preparingGame': 'Het spel aan het voorbereiden...'
	}
};
