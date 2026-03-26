<script lang="ts">
	import type { HomeTopbarAction, HomeTopbarMetric } from './home-topbar.types';

	let {
		metrics,
		actions,
		authorName,
		profileLevel,
		profileHref,
		topbarRoot = $bindable<HTMLElement | null>(null),
		profileChip = $bindable<HTMLAnchorElement | null>(null)
	}: {
		metrics: HomeTopbarMetric[];
		actions: readonly HomeTopbarAction[];
		authorName: string;
		profileLevel: string;
		profileHref: string;
		topbarRoot?: HTMLElement | null;
		profileChip?: HTMLAnchorElement | null;
	} = $props();
</script>

<header class="home-topbar home-topbar--main" aria-label="Home top bar main style" bind:this={topbarRoot}>
	<a class="home-profile-chip" href={profileHref} bind:this={profileChip}>
		<span class="home-profile-chip__level">Lv.</span>
		<strong>{profileLevel}</strong>
		<div class="home-profile-chip__copy">
			<small>Operator</small>
			<span>{authorName}</span>
		</div>
	</a>

	<div class="home-topbar__aside">
		<div
			class="home-topbar__resources"
			aria-label="Home resources"
			data-flip-id="topbar-resources"
			data-flip-role="resources"
		>
			{#each metrics as metric (metric.key)}
				<div class="resource-chip">
					<span>{metric.label}</span>
					<strong>{metric.value}</strong>
				</div>
			{/each}
		</div>

		<div
			class="home-topbar__tools"
			aria-label="Home top bar actions"
			data-flip-id="topbar-tools"
			data-flip-role="tools"
		>
			{#each actions as action, index (action.href)}
				<a class="home-topbar__tool-button" href={action.href}>{action.label}</a>
				{#if index < actions.length - 1}
					<span class="home-topbar__tool-divider" aria-hidden="true">/</span>
				{/if}
			{/each}
		</div>
	</div>
</header>
