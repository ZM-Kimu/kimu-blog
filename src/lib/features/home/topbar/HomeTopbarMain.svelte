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
		metrics: readonly HomeTopbarMetric[];
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
				<div class="resource-chip" role="group" aria-label={metric.ariaLabel}>
					<span
						class={`home-topbar__icon home-topbar__icon--${metric.icon.mode}`}
						aria-hidden="true"
						style={`--topbar-icon-src: url('${metric.icon.src}');${metric.icon.tint ? ` --topbar-icon-tint: ${metric.icon.tint};` : ''}`}
					></span>
					<strong aria-hidden="true">{metric.value}</strong>
				</div>
			{/each}
		</div>

		<div
			class="home-topbar__tools"
			aria-label="Home top bar actions"
			data-flip-id="topbar-tools"
			data-flip-role="tools"
		>
			{#each actions as action, index (action.key)}
				<div class="home-topbar__tool-button" role="img" aria-label={action.ariaLabel}>
					<span
						class={`home-topbar__icon home-topbar__icon--${action.icon.mode}`}
						aria-hidden="true"
						style={`--topbar-icon-src: url('${action.icon.src}');${action.icon.tint ? ` --topbar-icon-tint: ${action.icon.tint};` : ''}`}
					></span>
				</div>
				{#if index < actions.length - 1}
					<span class="home-topbar__tool-divider" aria-hidden="true">/</span>
				{/if}
			{/each}
		</div>
	</div>
</header>
