<script lang="ts">
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import github from '$lib/images/github.svg';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	
	// Get base path - empty in dev, /Spelwijsheid in production
	const base = dev ? '' : '/Spelwijsheid';
</script>

<header>
	<div class="corner">
		<a href="https://github.com/MaxOpperman/Spelwijsheid">
			<img src={github} alt="GitHub" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={page.url.pathname === `${base}/` || (base === '' && page.url.pathname === '/') ? 'page' : undefined}>
				<a href="{base}/">Home</a>
			</li>
			<li aria-current={page.url.pathname === `${base}/about` ? 'page' : undefined}>
				<a href="{base}/about">About</a>
			</li>
			<li aria-current={page.url.pathname.startsWith(`${base}/spelwijze`) ? 'page' : undefined}>
				<a href="{base}/spelwijze">Spelwijze</a>
			</li>
			<li aria-current={page.url.pathname.startsWith(`${base}/wordle`) && !page.url.pathname.startsWith(`${base}/wordle-solver`) ? 'page' : undefined}>
				<a href="{base}/wordle">Wordle</a>
			</li>
			<li aria-current={page.url.pathname.startsWith(`${base}/wordle-solver`) ? 'page' : undefined}>
				<a href="{base}/wordle-solver">Wordle Solver</a>
			</li>
			<li aria-current={page.url.pathname.startsWith(`${base}/spelwijze-solver`) ? 'page' : undefined}>
				<a href="{base}/spelwijze-solver">Spelwijze Solver</a>
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
		overflow-x: hidden; /* Hide any horizontal overflow */
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

	nav {
		display: flex;
		justify-content: center;
		--background: var(--color-surface);
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
	}

	li {
		position: relative;
		height: 100%;
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

	/* Responsive design for smaller screens */
	@media (max-width: 768px) {
		.corner {
			margin: 0 0.25rem; /* Reduce margin on small screens */
		}
		
		nav a {
			padding: 0 0.3rem; /* Reduce padding on small screens */
			font-size: 0.7rem; /* Slightly smaller text */
		}
	}
</style>
