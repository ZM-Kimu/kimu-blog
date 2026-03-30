<script lang="ts">
	let {
		status,
		message
	}: {
		status: number
		message: string
	} = $props()

	const isNotFound = $derived(status === 404)
	const isServerFault = $derived(status >= 500)
	const usesCompactHeadline = $derived(isNotFound || isServerFault)
	const eyebrow = $derived(isNotFound ? 'Route Lost' : 'Unhandled Fault')
	const headline = $derived(
		isNotFound
			? '未找到页面~ (´・ω・`)'
			: isServerFault
				? '系统故障 (´；ω；`)'
				: '系统信号中断，页面未能完成装载。'
	)
	const detailMessage = $derived(
		message?.trim() || (isNotFound ? '请求的页面不存在。' : '发生了未知错误。')
	)
	const visualSrc = $derived(
		isServerFault ? '/images/arona_embarrassed.png' : '/images/Popup_Image_Arona.png'
	)
	const visualAlt = $derived(
		isServerFault
			? 'Arona 表情插画，用于 500 错误页展示。'
			: 'Arona 的弹窗插画，用于错误页的引导展示。'
	)
</script>

<section class="error-screen">
	<div class="error-screen__body">
		<div class="error-screen__visual" aria-label="Fallback illustration">
			<img src={visualSrc} alt={visualAlt} loading="eager" decoding="async" />
		</div>

		<article class="error-screen__copy">
			<p class="eyebrow error-screen__eyebrow">{eyebrow}</p>
			<h1 class="error-screen__headline" class:error-screen__title--compact={usesCompactHeadline}>
				{headline}
			</h1>
			<p class="error-screen__message">{detailMessage}</p>
		</article>
	</div>
</section>

<style>
	.error-screen {
		--home-shell-padding: clamp(0.78rem, 1.25vw, 1.05rem);
		--home-topbar-height: 5.2rem;
		--error-stage-gap: clamp(1.2rem, 2vw, 1.8rem);
		--error-enter-ease: cubic-bezier(0.2, 0.8, 0.2, 1);

		position: relative;
		display: grid;
		width: 100%;
		min-height: 100dvh;
		overflow: clip;
		isolation: isolate;
	}

	.error-screen__body {
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

	.error-screen__copy {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		justify-items: center;
		width: min(100%, 42rem);
		text-align: center;
		padding: 0 1rem;
	}

	.error-screen__headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.25rem, 5.2vw, 4.2rem);
		line-height: 0.94;
		letter-spacing: -0.06em;
		max-width: 12ch;
	}

	.error-screen__title--compact {
		font-size: clamp(0.9rem, 2.08vw, 1.68rem);
		letter-spacing: -0.04em;
		max-width: none;
		white-space: nowrap;
	}

	.error-screen__message {
		margin: 0;
		font-size: 0.88rem;
		line-height: 1.6;
		color: var(--ink-faint);
		font-family: var(--font-sans);
		max-width: 42ch;
		overflow-wrap: anywhere;
	}

	.error-screen__visual,
	.error-screen__eyebrow,
	.error-screen__headline,
	.error-screen__message {
		opacity: 1;
		transform: translateY(0);
		will-change: opacity, transform;
	}

	:global(.site-frame[data-site-boot-phase='boot']) .error-screen__visual,
	:global(.site-frame[data-site-boot-phase='boot']) .error-screen__eyebrow,
	:global(.site-frame[data-site-boot-phase='boot']) .error-screen__headline,
	:global(.site-frame[data-site-boot-phase='boot']) .error-screen__message {
		opacity: 0;
		transform: translateY(22px);
		pointer-events: none;
	}

	:global(.site-frame[data-site-boot-phase='entry']) .error-screen__visual,
	:global(.screen-route-layer--entry) .error-screen__visual {
		animation: error-screen-enter 620ms var(--error-enter-ease) both;
		animation-delay: 80ms;
	}

	:global(.site-frame[data-site-boot-phase='entry']) .error-screen__eyebrow,
	:global(.screen-route-layer--entry) .error-screen__eyebrow {
		animation: error-screen-enter 520ms var(--error-enter-ease) both;
		animation-delay: 150ms;
	}

	:global(.site-frame[data-site-boot-phase='entry']) .error-screen__headline,
	:global(.screen-route-layer--entry) .error-screen__headline {
		animation: error-screen-enter 620ms var(--error-enter-ease) both;
		animation-delay: 210ms;
	}

	:global(.site-frame[data-site-boot-phase='entry']) .error-screen__message,
	:global(.screen-route-layer--entry) .error-screen__message {
		animation: error-screen-enter 520ms var(--error-enter-ease) both;
		animation-delay: 280ms;
	}

	.error-screen__visual {
		position: relative;
		display: grid;
		place-items: center;
		justify-items: center;
		width: 100%;
		min-height: 25rem;
		padding: 0.5rem 1rem 0;
		isolation: isolate;
	}

	.error-screen__visual::before {
		content: '';
		position: absolute;
		right: -2rem;
		top: -3rem;
		width: 16rem;
		height: 16rem;
		border-radius: 999px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.7), transparent 72%);
	}

	.error-screen__visual::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0.5rem;
		width: min(28rem, calc(100% - 4rem));
		height: 5rem;
		border-radius: 999px;
		background: radial-gradient(ellipse at center, rgba(79, 120, 255, 0.26), transparent 72%);
		transform: translateX(-50%);
	}

	.error-screen__visual img {
		position: relative;
		z-index: 1;
		width: min(75%, 21rem);
		max-height: 24rem;
		object-fit: contain;
		filter: drop-shadow(0 28px 42px rgba(49, 103, 168, 0.22));
	}

	@media (max-width: 1040px) {
		.error-screen__visual {
			min-height: 24rem;
		}
	}

	@media (max-width: 760px) {
		.error-screen__body {
			padding: calc(var(--home-topbar-height) + 1.8rem) var(--home-shell-padding) 1.2rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.site-frame[data-site-boot-phase='entry']) .error-screen__visual,
		:global(.screen-route-layer--entry) .error-screen__visual,
		:global(.site-frame[data-site-boot-phase='entry']) .error-screen__eyebrow,
		:global(.screen-route-layer--entry) .error-screen__eyebrow,
		:global(.site-frame[data-site-boot-phase='entry']) .error-screen__headline,
		:global(.screen-route-layer--entry) .error-screen__headline,
		:global(.site-frame[data-site-boot-phase='entry']) .error-screen__message,
		:global(.screen-route-layer--entry) .error-screen__message {
			animation-duration: 1ms;
			animation-delay: 0ms;
		}
	}

	@keyframes error-screen-enter {
		from {
			opacity: 0;
			transform: translateY(22px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
