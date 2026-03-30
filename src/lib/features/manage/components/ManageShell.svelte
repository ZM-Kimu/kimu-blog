<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
	import type { ManageSessionResponse } from '$lib/features/manage/types'
	import type { InternalHref } from '$lib/navigation/types'

	let {
		children,
		session,
		postsHref = '/manage/posts',
		backHref = '/blog/archive'
	} = $props<{
		children: () => unknown
		session: ManageSessionResponse
		postsHref?: InternalHref | `#${string}`
		backHref?: InternalHref | `#${string}`
	}>()

	const isPostsRoute = $derived(
		page.url.pathname.startsWith('/manage/posts') || postsHref.startsWith('#')
	)
	const actorLabel = $derived(session.actor.name ?? session.actor.email ?? session.actor.sub)
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	function followDebugHref(href: `#${string}`) {
		if (typeof window === 'undefined') {
			return
		}

		window.location.hash = href
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="manage-shell">
	<header class="manage-shell-header">
		<div class="manage-shell-identity">
			<p class="eyebrow">{t('manage.shell.eyebrow')}</p>
			<h1>{t('manage.shell.title', { repo: session.repository.name })}</h1>
			<p>
				{t('manage.shell.description', {
					actor: actorLabel,
					owner: session.repository.owner,
					repo: session.repository.name,
					branch: session.repository.branch
				})}
			</p>
		</div>

		<div class="manage-shell-actions">
			<nav class="manage-shell-nav" aria-label={t('manage.shell.navAria')}>
				{#if postsHref.startsWith('#')}
					<button
						class:active={isPostsRoute}
						type="button"
						onclick={() => followDebugHref(postsHref)}
					>
						<span>{t('manage.shell.navContent')}</span>
						<strong>{t('manage.shell.navPosts')}</strong>
					</button>
				{:else}
					<a class:active={isPostsRoute} href={resolve(postsHref)}>
						<span>{t('manage.shell.navContent')}</span>
						<strong>{t('manage.shell.navPosts')}</strong>
					</a>
				{/if}
			</nav>

			{#if backHref.startsWith('#')}
				<button
					class="button-secondary manage-shell-back"
					type="button"
					onclick={() => followDebugHref(backHref)}
				>
					{t('manage.shell.backPublic')}
				</button>
			{:else}
				<a class="button-secondary manage-shell-back" href={resolve(backHref)}>
					{t('manage.shell.backPublic')}
				</a>
			{/if}
		</div>
	</header>

	<div class="manage-shell-body">
		{@render children()}
	</div>
</div>

<style>
	.manage-shell {
		min-height: 100vh;
		padding: 1.1rem;
		background:
			radial-gradient(circle at top left, rgb(56 189 248 / 18%), transparent 24rem),
			linear-gradient(180deg, rgb(238 248 255 / 86%), rgb(225 238 252 / 90%));
	}

	.manage-shell-header,
	.manage-shell-body {
		width: min(1500px, calc(100vw - 2rem));
		margin: 0 auto;
	}

	.manage-shell-header {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) auto;
		gap: 1rem;
		padding: 1.15rem 1.2rem;
		border: 1px solid var(--line);
		border-radius: 30px;
		background: rgb(255 255 255 / 74%);
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(18px);
	}

	.manage-shell-identity {
		display: grid;
		gap: 0.35rem;
	}

	.manage-shell-identity h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3.2rem);
		letter-spacing: -0.05em;
	}

	.manage-shell-identity p {
		margin: 0;
		color: var(--ink-soft);
	}

	.manage-shell-actions {
		display: grid;
		align-content: start;
		justify-items: end;
		gap: 0.8rem;
	}

	.manage-shell-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.manage-shell-nav a,
	.manage-shell-nav button {
		--site-press-scale: 1;
		--site-press-translate-y: 0px;

		display: grid;
		gap: 0.2rem;
		min-width: 9rem;
		padding: 0.8rem 1rem;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: rgb(255 255 255 / 72%);
		font: inherit;
		text-align: left;
		cursor: pointer;
		scale: var(--site-press-scale);
		translate: 0 var(--site-press-translate-y);
		transform-origin: center;
		touch-action: manipulation;
		transition:
			transform var(--ease),
			translate var(--press-out-duration) cubic-bezier(0.2, 0.8, 0.2, 1),
			scale var(--press-out-duration) cubic-bezier(0.2, 0.8, 0.2, 1),
			border-color var(--ease),
			background-color var(--ease);
	}

	.manage-shell-nav a:active,
	.manage-shell-nav button:active {
		--site-press-scale: var(--press-active-scale);
		--site-press-translate-y: var(--press-active-translate-y);

		transition-duration: var(--press-in-duration);
	}

	.manage-shell-nav a span,
	.manage-shell-nav button span {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-shell-nav a strong,
	.manage-shell-nav button strong {
		font-family: var(--font-display);
		font-size: 1rem;
	}

	.manage-shell-nav a:hover,
	.manage-shell-nav button:hover,
	.manage-shell-nav a.active,
	.manage-shell-nav button.active {
		transform: translateY(-2px);
		border-color: rgb(79 120 255 / 24%);
		background: rgb(255 255 255 / 92%);
	}

	.manage-shell-back {
		width: auto;
	}

	.manage-shell-body {
		padding: 1rem 0 1.3rem;
	}

	@media (width <= 900px) {
		.manage-shell {
			padding: 0.7rem;
		}

		.manage-shell-header {
			grid-template-columns: 1fr;
		}

		.manage-shell-actions {
			justify-items: stretch;
		}

		.manage-shell-nav {
			display: grid;
			grid-template-columns: 1fr;
		}
	}
</style>
