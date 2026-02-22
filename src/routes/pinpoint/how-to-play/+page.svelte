<svelte:head>
	<title>How to Play - Pinpoint</title>
	<meta
		name="description"
		content="Learn how to play Pinpoint: guess the word from progressive clues."
	/>
</svelte:head>

<div class="content">
	<h1>How to Play Pinpoint</h1>

	<section>
		<h2>🎯 Objective</h2>
		<p>
			Guess the secret word or phrase from a set of up to <strong>5 clues</strong>. The clues start
			vague and get progressively more obvious — the fewer clues you need, the better!
		</p>
	</section>

	<section>
		<h2>🎮 Rules</h2>
		<ol>
			<li>
				<strong>One clue at a time:</strong> Only the first clue is shown at the start.
			</li>
			<li>
				<strong>Wrong guess = next clue:</strong> Each incorrect guess reveals the next clue band.
			</li>
			<li>
				<strong>5 chances:</strong> You have at most 5 guesses before the answer is revealed.
			</li>
			<li>
				<strong>Partial matches count:</strong> You don't need to type the exact capitalisation — guesses
				are compared case-insensitively.
			</li>
			<li>
				<strong>New puzzle anytime:</strong> Start a fresh puzzle whenever you like with the
				<em>New Game</em> button.
			</li>
		</ol>
	</section>

	<section>
		<h2>🕹️ How to play</h2>
		<ol>
			<li>Read the first (hardest) clue shown on the board.</li>
			<li>Type your best guess in the input field and press <strong>Guess</strong>.</li>
			<li>If wrong, the next clue is revealed and your guess is crossed out below the board.</li>
			<li>Keep guessing until you find the answer or all 5 clues are revealed.</li>
			<li>After the game ends, press <strong>New Game</strong> to generate a fresh puzzle.</li>
		</ol>
	</section>

	<section>
		<h2>📊 Scoring</h2>
		<p>There is no formal score, but consider it a personal challenge:</p>
		<ul>
			<li>
				<strong>1 clue</strong> — extraordinary 🏆
			</li>
			<li>
				<strong>2 clues</strong> — excellent ⭐
			</li>
			<li>
				<strong>3 clues</strong> — great 👍
			</li>
			<li>
				<strong>4 clues</strong> — decent 🙂
			</li>
			<li>
				<strong>5 clues</strong> — just made it 😅
			</li>
		</ul>
	</section>

	<section>
		<h2>🎨 Example</h2>
		<p>
			Here is what a board might look like for the secret word <strong>"Volcano"</strong>:
		</p>
		<div class="board-example">
			<div class="band band-0 revealed">
				<span class="clue-text">Tectonic pressure</span>
			</div>
			<div class="band band-1 revealed">
				<span class="clue-text">Molten rock</span>
			</div>
			<div class="band band-2">
				<span class="clue-placeholder">CLUE 3</span>
			</div>
			<div class="band band-3">
				<span class="clue-placeholder">CLUE 4</span>
			</div>
			<div class="band band-4">
				<span class="clue-placeholder">CLUE 5</span>
			</div>
		</div>
		<p class="example-caption">
			Two clues are visible after one wrong guess. Clue 3-5 are still hidden.
		</p>
	</section>

	<div class="back-link">
		<a href="/pinpoint"><i class="fa-solid fa-arrow-left"></i> Back to the game</a>
	</div>
</div>

<style>
	.content {
		max-width: 680px;
		margin: 0 auto;
		padding: 2rem 1rem;
		line-height: 1.6;
		font-family: inherit;
	}

	h1 {
		font-size: 2.2rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 2rem;
		color: var(--color-primary);
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: var(--color-primary);
		border-bottom: 2px solid var(--color-primary-light);
		padding-bottom: 0.4rem;
	}

	section {
		margin-bottom: 2rem;
		background: var(--color-surface);
		padding: 1.5rem 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
		border: 1px solid var(--color-primary-light);
	}

	ol,
	ul {
		margin: 0.75rem 0 0 0;
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

	/* Board example */
	.board-example {
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		margin: 1rem 0;
	}

	.band {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.25rem;
		min-height: 3rem;
	}

	.band-0 {
		background-color: #bfdbfe;
		color: #1e3a5f;
	}
	.band-1 {
		background-color: #93c5fd;
		color: #1e3a5f;
	}
	.band-2 {
		background-color: #60a5fa;
		color: #1e3a5f;
	}
	.band-3 {
		background-color: #3b82f6;
		color: #fff;
	}
	.band-4 {
		background-color: #1d4ed8;
		color: #fff;
	}

	.clue-text {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.clue-placeholder {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		opacity: 0.55;
	}

	.example-caption {
		font-size: 0.875rem;
		color: var(--color-text-light);
		text-align: center;
		margin-top: 0.5rem;
	}

	/* Back link */
	.back-link {
		text-align: center;
		margin-top: 3rem;
	}

	.back-link a {
		color: var(--color-primary);
		text-decoration: none;
		padding: 0.85rem 2rem;
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

	@media (max-width: 600px) {
		.content {
			padding: 1rem;
		}

		h1 {
			font-size: 1.8rem;
		}

		section {
			padding: 1.25rem;
		}
	}
</style>
