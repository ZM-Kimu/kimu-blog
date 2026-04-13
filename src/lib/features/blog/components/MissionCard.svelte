<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'

	type Tone = 'cyan' | 'blue' | 'amber' | 'slate'

	interface Props {
		title: string
		description: string
		href?: string
		tone?: Tone
		count?: number
	}

	let { title, description, href, tone = 'cyan', count = 0 }: Props = $props()

	const messages = $derived(page.data.i18n?.messages)
	const recordsLabel = $derived(translate(messages, 'common.recordsLabel'))
</script>

{#if href === '/favorites'}
	<a class={`mission-card tone-${tone}`} href={resolve('/favorites')}>
		<span class="mission-card-count" aria-label={recordsLabel}>{count}</span>
		<div class="mission-card-body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	</a>
{:else if href?.startsWith('/blog/archive?category=')}
	<a class={`mission-card tone-${tone}`} href={resolve(href as `/blog/archive?category=${string}`)}>
		<span class="mission-card-count" aria-label={recordsLabel}>{count}</span>
		<div class="mission-card-body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	</a>
{:else if href}
	<a class={`mission-card tone-${tone}`} href={resolve('/blog')}>
		<span class="mission-card-count" aria-label={recordsLabel}>{count}</span>
		<div class="mission-card-body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	</a>
{:else}
	<div class={`mission-card tone-${tone}`}>
		<span class="mission-card-count" aria-label={recordsLabel}>{count}</span>
		<div class="mission-card-body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	</div>
{/if}
