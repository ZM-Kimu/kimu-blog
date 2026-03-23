<script lang="ts">
	import { resolve } from '$app/paths';

	type Tone = 'cyan' | 'blue' | 'amber' | 'slate';

	interface Props {
		title: string;
		kicker: string;
		description: string;
		href?: string;
		state?: string;
		tone?: Tone;
		count?: number;
	}

	let {
		title,
		kicker,
		description,
		href,
		state = 'Live',
		tone = 'cyan',
		count = 0
	}: Props = $props();
</script>

{#if href === '/favorites'}
	<a class={`mission-card tone-${tone}`} href={resolve('/favorites')}>
		<div class="mission-card__hud">
			<span class="mission-card__kicker">{kicker}</span>
			<span class="mission-card__state">{state}</span>
		</div>
		<div class="mission-card__body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
		<div class="mission-card__footer">
			<span>Records</span>
			<strong>{String(count).padStart(2, '0')}</strong>
		</div>
	</a>
{:else if href === '/blog/archive'}
	<a class={`mission-card tone-${tone}`} href={resolve('/blog/archive')}>
		<div class="mission-card__hud">
			<span class="mission-card__kicker">{kicker}</span>
			<span class="mission-card__state">{state}</span>
		</div>
		<div class="mission-card__body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
		<div class="mission-card__footer">
			<span>Records</span>
			<strong>{String(count).padStart(2, '0')}</strong>
		</div>
	</a>
{:else if href}
	<a class={`mission-card tone-${tone}`} href={resolve('/blog')}>
		<div class="mission-card__hud">
			<span class="mission-card__kicker">{kicker}</span>
			<span class="mission-card__state">{state}</span>
		</div>
		<div class="mission-card__body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
		<div class="mission-card__footer">
			<span>Records</span>
			<strong>{String(count).padStart(2, '0')}</strong>
		</div>
	</a>
{:else}
	<div class={`mission-card tone-${tone}`}>
		<div class="mission-card__hud">
			<span class="mission-card__kicker">{kicker}</span>
			<span class="mission-card__state">{state}</span>
		</div>
		<div class="mission-card__body">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
		<div class="mission-card__footer">
			<span>Records</span>
			<strong>{String(count).padStart(2, '0')}</strong>
		</div>
	</div>
{/if}
