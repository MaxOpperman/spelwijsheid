<script lang="ts">
	import { toggleDarkMode } from '$lib/stores/darkMode';
</script>

<button class="dark-mode-toggle" on:click={toggleDarkMode} title="Toggle dark mode">
	<div class="toggle-background">
		<div class="sun">
			<div class="sun-rays"></div>
		</div>
		<div class="moon">
			<div class="crater crater-1"></div>
			<div class="crater crater-2"></div>
			<div class="crater crater-3"></div>
		</div>
		<div class="clouds">
			<div class="cloud cloud-1"></div>
			<div class="cloud cloud-2"></div>
			<div class="cloud cloud-3"></div>
		</div>
		<div class="stars">
			<div class="star star-1"></div>
			<div class="star star-2"></div>
			<div class="star star-3"></div>
		</div>
	</div>
</button>

<style>
	.dark-mode-toggle {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		transition: transform 0.2s ease;
		margin-left: 0.5rem;
		flex-shrink: 0;
	}

	.dark-mode-toggle:hover {
		transform: scale(1.05);
	}

	.toggle-background {
		width: 60px;
		height: 30px;
		border-radius: 20px;
		position: relative;
		overflow: hidden;
		transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
		background: linear-gradient(135deg, #87ceeb 0%, #98d8e8 100%);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
	}

	:global(.dark) .toggle-background {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.sun {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #ffd700;
		transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
		box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	:global(.dark) .sun {
		transform: translateX(30px);
		background: #f5f5dc;
		box-shadow:
			0 0 20px rgba(245, 245, 220, 0.8),
			inset -2px -2px 4px rgba(0, 0, 0, 0.2);
	}

	.sun-rays {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 30px;
		height: 30px;
		opacity: 1;
		transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.sun-rays::before,
	.sun-rays::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 2px;
		height: 8px;
		background: #ffd700;
		border-radius: 1px;
		transform-origin: center;
	}

	.sun-rays::before {
		transform: translate(-50%, -50%) rotate(0deg);
		box-shadow:
			0 0 0 #ffd700,
			0 0 0 #ffd700 rotate(45deg),
			0 0 0 #ffd700 rotate(90deg),
			0 0 0 #ffd700 rotate(135deg);
	}

	:global(.dark) .sun-rays {
		opacity: 0;
		transform: translate(-50%, -50%) rotate(180deg);
	}

	.moon {
		position: absolute;
		top: 3px;
		right: 3px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #f5f5dc;
		transform: translateX(30px);
		transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
		opacity: 0;
	}

	:global(.dark) .moon {
		transform: translateX(0);
		opacity: 1;
		box-shadow: 0 0 20px rgba(245, 245, 220, 0.3);
	}

	.crater {
		position: absolute;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.1);
		transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.crater-1 {
		top: 6px;
		left: 8px;
		width: 4px;
		height: 4px;
	}

	.crater-2 {
		top: 12px;
		left: 14px;
		width: 3px;
		height: 3px;
	}

	.crater-3 {
		top: 16px;
		left: 7px;
		width: 2px;
		height: 2px;
	}

	.clouds {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 1;
		transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}

	:global(.dark) .clouds {
		opacity: 0;
		transform: translateY(-10px);
	}

	.cloud {
		position: absolute;
		background: var(--color-surface);
		border-radius: 10px;
		opacity: 0.8;
	}

	.cloud::before,
	.cloud::after {
		content: '';
		position: absolute;
		background: var(--color-surface);
		border-radius: 50%;
	}

	.cloud-1 {
		top: 8px;
		left: 35px;
		width: 12px;
		height: 4px;
		animation: float 3s ease-in-out infinite;
	}

	.cloud-1::before {
		top: -3px;
		left: 2px;
		width: 6px;
		height: 6px;
	}

	.cloud-1::after {
		top: -4px;
		right: 2px;
		width: 8px;
		height: 8px;
	}

	.cloud-2 {
		top: 15px;
		left: 20px;
		width: 8px;
		height: 3px;
		animation: float 4s ease-in-out infinite reverse;
	}

	.cloud-2::before {
		top: -2px;
		left: 1px;
		width: 4px;
		height: 4px;
	}

	.cloud-2::after {
		top: -3px;
		right: 1px;
		width: 5px;
		height: 5px;
	}

	.cloud-3 {
		top: 20px;
		left: 45px;
		width: 10px;
		height: 3px;
		animation: float 5s ease-in-out infinite;
	}

	.cloud-3::before {
		top: -2px;
		left: 2px;
		width: 3px;
		height: 3px;
	}

	.cloud-3::after {
		top: -3px;
		right: 2px;
		width: 4px;
		height: 4px;
	}

	.stars {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}

	:global(.dark) .stars {
		opacity: 1;
	}

	.star {
		position: absolute;
		background: var(--color-surface);
		clip-path: polygon(
			50% 0%,
			61% 35%,
			98% 35%,
			68% 57%,
			79% 91%,
			50% 70%,
			21% 91%,
			32% 57%,
			2% 35%,
			39% 35%
		);
		animation: twinkle 2s ease-in-out infinite;
	}

	.star-1 {
		top: 5px;
		left: 10px;
		width: 3px;
		height: 3px;
		animation-delay: 0s;
	}

	.star-2 {
		top: 12px;
		left: 45px;
		width: 2px;
		height: 2px;
		animation-delay: 0.5s;
	}

	.star-3 {
		top: 20px;
		left: 25px;
		width: 2px;
		height: 2px;
		animation-delay: 1s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-2px);
		}
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	@media (max-width: 768px) {
		.dark-mode-toggle {
			margin-left: 0.25rem;
		}
	}
</style>
