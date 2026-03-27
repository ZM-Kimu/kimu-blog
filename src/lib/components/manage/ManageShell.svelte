<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ManageSessionResponse } from '$lib/features/manage/types';

	let { children, session } = $props<{
		children: () => unknown;
		session: ManageSessionResponse;
	}>();

	const isPostsRoute = $derived(page.url.pathname.startsWith('/manage/posts'));
	const actorLabel = $derived(session.actor.name ?? session.actor.email ?? session.actor.sub);
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="manage-shell">
	<header class="manage-shell__header">
		<div class="manage-shell__identity">
			<p class="eyebrow">Private Content Workbench</p>
			<h1>Manage / {session.repository.name}</h1>
			<p>
				当前以 <strong>{actorLabel}</strong> 身份接入，写入目标为
				<code>{session.repository.owner}/{session.repository.name}</code> on
				<code>{session.repository.branch}</code>.
			</p>
		</div>

		<div class="manage-shell__actions">
			<nav class="manage-shell__nav" aria-label="管理导航">
				<a class:active={isPostsRoute} href={resolve('/manage/posts')}>
					<span>Content</span>
					<strong>Posts</strong>
				</a>
			</nav>

			<a class="button-secondary manage-shell__back" href={resolve('/blog/archive')}>返回公开站</a>
		</div>
	</header>

	<div class="manage-shell__body">
		{@render children()}
	</div>
</div>

<style>
	.manage-shell {
		min-height: 100vh;
		padding: 1.1rem;
		background:
			radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 24rem),
			linear-gradient(180deg, rgba(238, 248, 255, 0.86), rgba(225, 238, 252, 0.9));
	}

	.manage-shell__header,
	.manage-shell__body {
		width: min(1500px, calc(100vw - 2rem));
		margin: 0 auto;
	}

	.manage-shell__header {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) auto;
		gap: 1rem;
		padding: 1.15rem 1.2rem;
		border: 1px solid var(--line);
		border-radius: 30px;
		background: rgba(255, 255, 255, 0.74);
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(18px);
	}

	.manage-shell__identity {
		display: grid;
		gap: 0.35rem;
	}

	.manage-shell__identity h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3.2rem);
		letter-spacing: -0.05em;
	}

	.manage-shell__identity p {
		margin: 0;
		color: var(--ink-soft);
	}

	.manage-shell__identity code {
		font-family: var(--font-mono);
		font-size: 0.9em;
	}

	.manage-shell__actions {
		display: grid;
		align-content: start;
		justify-items: end;
		gap: 0.8rem;
	}

	.manage-shell__nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.manage-shell__nav a {
		display: grid;
		gap: 0.2rem;
		min-width: 9rem;
		padding: 0.8rem 1rem;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.72);
		transition:
			transform var(--ease),
			border-color var(--ease),
			background-color var(--ease);
	}

	.manage-shell__nav a span {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-shell__nav a strong {
		font-family: var(--font-display);
		font-size: 1rem;
	}

	.manage-shell__nav a:hover,
	.manage-shell__nav a.active {
		transform: translateY(-2px);
		border-color: rgba(79, 120, 255, 0.24);
		background: rgba(255, 255, 255, 0.92);
	}

	.manage-shell__back {
		width: auto;
	}

	.manage-shell__body {
		padding: 1rem 0 1.3rem;
	}

	@media (max-width: 900px) {
		.manage-shell {
			padding: 0.7rem;
		}

		.manage-shell__header {
			grid-template-columns: 1fr;
		}

		.manage-shell__actions {
			justify-items: stretch;
		}

		.manage-shell__nav {
			display: grid;
			grid-template-columns: 1fr;
		}
	}
</style>
