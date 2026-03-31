<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import { getPublicLayoutContext } from '$lib/layout/public-layout'

	let {
		status,
		message
	}: {
		status: number
		message: string
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const { getMode } = getPublicLayoutContext()
	const isNotFound = $derived(status === 404)
	const isServerFault = $derived(status >= 500)
	const isPortraitLayout = $derived(getMode() === 'portrait')
	const usesCompactHeadline = $derived(isNotFound || isServerFault)
	const eyebrow = $derived(
		isNotFound
			? translate(messages, 'error.eyebrowNotFound')
			: translate(messages, 'error.eyebrowFault')
	)
	const headline = $derived(
		isNotFound
			? translate(messages, 'error.headlineNotFound')
			: isServerFault
				? translate(messages, 'error.headlineFault')
				: translate(messages, 'error.headlineInterrupted')
	)
	const detailMessage = $derived(
		message?.trim() ||
			(isNotFound
				? translate(messages, 'error.detailNotFound')
				: translate(messages, 'error.detailUnknown'))
	)
	const visualSrc = $derived(
		isServerFault ? '/images/arona_embarrassed.png' : '/images/Popup_Image_Arona.png'
	)
	const visualAlt = $derived(
		isServerFault
			? translate(messages, 'error.visualAltFault')
			: translate(messages, 'error.visualAltGeneric')
	)
</script>

<section class:error-screen-portrait={isPortraitLayout} class="error-screen">
	<div class="error-screen-body">
		<div class="error-screen-visual" aria-label={translate(messages, 'error.fallbackIllustration')}>
			<img src={visualSrc} alt={visualAlt} loading="eager" decoding="async" />
		</div>

		<article class="error-screen-copy">
			<p class="eyebrow error-screen-eyebrow">{eyebrow}</p>
			<h1 class="error-screen-headline" class:error-screen-title-compact={usesCompactHeadline}>
				{headline}
			</h1>
			<p class="error-screen-message">{detailMessage}</p>
		</article>
	</div>
</section>

<style>
	.error-screen {
		--home-shell-padding: clamp(0.78rem, 1.25vw, 1.05rem);
		--home-topbar-height: 5.2rem;
		--error-stage-gap: clamp(1.2rem, 2vw, 1.8rem);

		position: relative;
		display: grid;
		width: 100%;
		min-height: 100dvh;
		overflow: clip;
		isolation: isolate;
	}

	.error-screen-portrait {
		min-height: auto;
		padding: 0;
	}

	.error-screen-body {
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 100%;
		box-sizing: border-box;
		padding: calc(var(--home-topbar-height) + var(--error-stage-gap)) var(--home-shell-padding)
			var(--error-stage-gap);
		position: relative;
		z-index: 1;
		overflow: clip;
	}

	.error-screen-portrait .error-screen-body {
		min-height: auto;
		padding: 0.15rem 0 0.35rem;
		gap: 1.2rem;
		align-content: start;
	}

	.error-screen-copy {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		justify-items: center;
		width: min(100%, 42rem);
		text-align: center;
		padding: 0 1rem;
	}

	.error-screen-portrait .error-screen-copy {
		width: min(100%, 35rem);
		padding: 1.2rem 1.15rem;
		border: 1px solid rgb(92 148 204 / 16%);
		border-radius: 26px;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 92%), rgb(241 247 255 / 84%)),
			linear-gradient(90deg, rgb(79 120 255 / 8%), transparent 52%);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 94%),
			0 18px 38px rgb(52 104 164 / 10%);
	}

	.error-screen-headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.25rem, 5.2vw, 4.2rem);
		line-height: 0.94;
		letter-spacing: -0.06em;
		max-width: 12ch;
	}

	.error-screen-title-compact {
		font-size: clamp(0.9rem, 2.08vw, 1.68rem);
		letter-spacing: -0.04em;
		max-width: none;
		white-space: nowrap;
	}

	.error-screen-message {
		margin: 0;
		font-size: 0.88rem;
		line-height: 1.6;
		color: var(--ink-faint);
		font-family: var(--font-sans);
		max-width: 42ch;
		overflow-wrap: anywhere;
	}

	.error-screen-visual,
	.error-screen-eyebrow,
	.error-screen-headline,
	.error-screen-message {
		opacity: 1;
		transform: translateY(0);
		will-change: opacity, transform;
	}

	.error-screen-portrait .error-screen-message {
		font-size: 0.96rem;
		max-width: 34ch;
	}

	.error-screen-visual {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		min-height: 25rem;
		padding: 0.5rem 1rem 0;
		isolation: isolate;
	}

	.error-screen-portrait .error-screen-visual {
		width: min(100%, 35rem);
		min-height: auto;
		padding: 1rem 0.7rem 0.65rem;
		border: 1px solid rgb(92 148 204 / 14%);
		border-radius: 30px;
		background:
			radial-gradient(circle at top right, rgb(255 255 255 / 74%), transparent 30%),
			linear-gradient(180deg, rgb(255 255 255 / 86%), rgb(230 241 253 / 76%));
		box-shadow: 0 20px 40px rgb(52 104 164 / 10%);
		overflow: clip;
	}

	.error-screen-visual::before {
		content: '';
		position: absolute;
		right: -2rem;
		top: -3rem;
		width: 16rem;
		height: 16rem;
		border-radius: 999px;
		background: radial-gradient(circle, rgb(255 255 255 / 70%), transparent 72%);
	}

	.error-screen-visual::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0.5rem;
		width: min(28rem, calc(100% - 4rem));
		height: 5rem;
		border-radius: 999px;
		background: radial-gradient(ellipse at center, rgb(79 120 255 / 26%), transparent 72%);
		transform: translateX(-50%);
	}

	.error-screen-visual img {
		position: relative;
		z-index: 1;
		width: min(75%, 21rem);
		max-height: 24rem;
		object-fit: contain;
		filter: drop-shadow(0 28px 42px rgb(49 103 168 / 22%));
	}

	.error-screen-portrait .error-screen-visual img {
		width: min(70%, 16.5rem);
		max-height: 18rem;
	}

	@media (width <= 1040px) {
		.error-screen-visual {
			min-height: 24rem;
		}
	}

	@media (width <= 760px) {
		.error-screen-body {
			padding: calc(var(--home-topbar-height) + 1.8rem) var(--home-shell-padding) 1.2rem;
		}
	}
</style>
