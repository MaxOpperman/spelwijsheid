<script lang="ts">
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import github from '$lib/images/github.svg';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';

	// Get base path - empty in dev, /Spelwijsheid in production
	const base = dev ? '' : '/Spelwijsheid';

	let solversOpen = $state(false);
	let mobileMenuOpen = $state(false);

	function toggleSolvers() {
		solversOpen = !solversOpen;
	}

	function closeSubmenu() {
		solversOpen = false;
	}

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMenu() {
		mobileMenuOpen = false;
	}

	function closeMenuAndSubmenu() {
		mobileMenuOpen = false;
		solversOpen = false;
	}
</script>

<header>
	<div class="corner">
		<a href="https://github.com/MaxOpperman/Spelwijsheid">
			<img src={github} alt="GitHub" />
		</a>
	</div>

	<button
		class="mobile-menu-toggle"
		onclick={toggleMenu}
		aria-label="Toggle menu"
		aria-expanded={mobileMenuOpen}
	>
		<span class="hamburger"></span>
	</button>

	<nav class:mobile-open={mobileMenuOpen}>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li
				aria-current={page.url.pathname === `${base}/` || (base === '' && page.url.pathname === '/')
					? 'page'
					: undefined}
			>
				<a href="{base}/" onclick={closeMenuAndSubmenu}>Home</a>
			</li>
			<li aria-current={page.url.pathname === `${base}/about` ? 'page' : undefined}>
				<a href="{base}/about" onclick={closeMenuAndSubmenu}>About</a>
			</li>
			<li
				aria-current={page.url.pathname.startsWith(`${base}/spelwijze`) &&
				!page.url.pathname.startsWith(`${base}/spelwijze-solver`)
					? 'page'
					: undefined}
			>
				<a href="{base}/spelwijze" onclick={closeMenuAndSubmenu}>Spelwijze</a>
			</li>
			<li
				aria-current={page.url.pathname.startsWith(`${base}/wordle`) &&
				!page.url.pathname.startsWith(`${base}/wordle-solver`)
					? 'page'
					: undefined}
			>
				<a href="{base}/wordle" onclick={closeMenuAndSubmenu}>Wordle</a>
			</li>
			<li class="has-submenu" class:submenu-open={solversOpen}>
				<button class="submenu-toggle" onclick={toggleSolvers} aria-expanded={solversOpen}>
					Solvers <span class="arrow">▼</span>
				</button>
				<ul class="submenu">
					<li
						aria-current={page.url.pathname.startsWith(`${base}/wordle-solver`)
							? 'page'
							: undefined}
					>
						<a href="{base}/wordle-solver" onclick={closeMenu}>Wordle Solver</a>
					</li>
					<li
						aria-current={page.url.pathname.startsWith(`${base}/spelwijze-solver`)
							? 'page'
							: undefined}
					>
						<a href="{base}/spelwijze-solver" onclick={closeMenu}>Spelwijze Solver</a>
					</li>
				</ul>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<DarkModeToggle />
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		width: 100%;
		max-width: 100vw; /* Prevent horizontal overflow */
		box-sizing: border-box; /* Include padding/border in width calculation */
		overflow: visible;
	}

	.corner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: auto;
		height: 3em;
		margin: 0 0.5rem; /* Add horizontal margin */
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3em;
		height: 3em;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	.mobile-menu-toggle {
		display: none;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: var(--color-surface);
		overflow: visible;
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
		overflow: visible;
	}

	li {
		position: relative;
		height: 100%;
	}

	.has-submenu {
		position: relative;
		overflow: visible;
	}

	.submenu-toggle {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
	}

	.submenu-toggle:hover {
		color: var(--color-theme-1);
	}

	.arrow {
		margin-left: 0.25rem;
		font-size: 0.6rem;
		transition: transform 0.3s ease;
	}

	.submenu-open .arrow {
		transform: rotate(180deg);
	}

	.submenu {
		display: none;
		position: absolute;
		top: 100%;
		left: 0;
		background: var(--color-surface);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-radius: 4px;
		min-width: 180px;
		padding: 0.5rem 0;
		z-index: 10000;
		list-style: none;
		margin: 0;
		height: auto;
	}

	.has-submenu:hover .submenu,
	.submenu:hover,
	.submenu-open .submenu {
		display: block;
	}

	.submenu li {
		height: auto;
	}

	.submenu li[aria-current='page']::before {
		display: none;
	}

	.submenu a {
		padding: 0.75rem 1rem;
		height: auto;
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.submenu a:hover {
		background: var(--color-surface);
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-primary);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		header {
			padding: 0.5rem 0.75rem;
		}

		.corner {
			margin: 0;
			gap: 0.25rem;
		}

		.mobile-menu-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 2.5rem;
			height: 2.5rem;
			background: none;
			border: none;
			cursor: pointer;
			padding: 0;
			z-index: 1001;
		}

		.hamburger {
			display: block;
			width: 24px;
			height: 2px;
			background: var(--color-text);
			position: relative;
			transition: background 0.3s;
		}

		.hamburger::before,
		.hamburger::after {
			content: '';
			position: absolute;
			width: 24px;
			height: 2px;
			background: var(--color-text);
			transition: transform 0.3s;
		}

		.hamburger::before {
			top: -7px;
		}

		.hamburger::after {
			top: 7px;
		}

		.mobile-menu-toggle[aria-expanded='true'] .hamburger {
			background: transparent;
		}

		.mobile-menu-toggle[aria-expanded='true'] .hamburger::before {
			transform: rotate(45deg) translate(5px, 5px);
		}

		.mobile-menu-toggle[aria-expanded='true'] .hamburger::after {
			transform: rotate(-45deg) translate(5px, -5px);
		}

		nav {
			position: fixed;
			top: 0;
			right: -100%;
			height: 100vh;
			width: 70%;
			max-width: 300px;
			background: var(--color-surface);
			transition: right 0.3s ease;
			z-index: 1000;
			flex-direction: column;
			justify-content: flex-start;
			padding-top: 4rem;
			box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
		}

		nav.mobile-open {
			right: 0;
		}

		nav svg {
			display: none;
		}

		nav ul {
			flex-direction: column;
			width: 100%;
			height: auto;
			padding: 0;
			margin: 0;
			background: transparent;
		}

		nav li {
			width: 100%;
			height: auto;
			margin: 0;
		}

		nav a {
			width: 100%;
			padding: 1rem 1.5rem;
			justify-content: flex-start;
			box-sizing: border-box;
			border-left: 4px solid transparent;
			transition: all 0.2s ease;
			height: auto;
		}

		nav a:hover {
			background: rgba(0, 0, 0, 0.05);
			border-left-color: var(--color-theme-1);
		}

		:global(.dark) nav a:hover {
			background: rgba(255, 255, 255, 0.05);
		}

		li[aria-current='page']::before {
			display: none;
		}

		li[aria-current='page'] a {
			background: var(--color-primary);
			color: var(--color-bg-0);
			border-left-color: var(--color-accent);
		}

		.submenu-toggle {
			width: 100%;
			padding: 1rem 1.5rem;
			justify-content: flex-start;
			box-sizing: border-box;
			border-left: 4px solid transparent;
			text-align: left;
			height: auto;
		}

		.submenu {
			position: static;
			display: none;
			box-shadow: none;
			background: transparent;
			padding: 0;
			min-width: 0;
			border-radius: 0;
		}

		.submenu-open .submenu {
			display: block;
		}

		.submenu a {
			padding-left: 2.5rem;
			font-size: 0.8rem;
		}

		.submenu li[aria-current='page'] a {
			background: var(--color-primary);
			color: var(--color-bg-0);
			border-left-color: var(--color-accent);
		}
	}
</style>
