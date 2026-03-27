<script lang="ts">
	import type { HomeTopbarAction, HomeTopbarMetric } from './home-topbar.types';

	let {
		metrics,
		actions,
		siteName,
		motionLocked,
		onBack,
		topbarRoot = $bindable<HTMLElement | null>(null),
		backButton = $bindable<HTMLButtonElement | null>(null),
		backGlyph = $bindable<HTMLSpanElement | null>(null),
		titleWrap = $bindable<HTMLDivElement | null>(null),
		stripShell = $bindable<HTMLDivElement | null>(null)
	}: {
		metrics: HomeTopbarMetric[];
		actions: readonly HomeTopbarAction[];
		siteName: string;
		motionLocked: boolean;
		onBack: () => void;
		topbarRoot?: HTMLElement | null;
		backButton?: HTMLButtonElement | null;
		backGlyph?: HTMLSpanElement | null;
		titleWrap?: HTMLDivElement | null;
		stripShell?: HTMLDivElement | null;
	} = $props();
</script>

<header class="home-topbar home-topbar--subpage" aria-label="Home top bar subpage style" bind:this={topbarRoot}>
	<div class="home-topbar__strip-shell" aria-hidden="true" bind:this={stripShell}></div>

	<div class="home-topbar__lead">
		<button
			class="home-topbar__back"
			type="button"
			aria-label="Switch to main top bar"
			disabled={motionLocked}
			bind:this={backButton}
			onclick={onBack}
		>
			<span class="home-topbar__back-glyph" aria-hidden="true" bind:this={backGlyph}></span>
		</button>
		<div class="home-topbar__title-wrap" bind:this={titleWrap}>
			<div class="home-topbar__title">{siteName}</div>
		</div>
	</div>

	<div class="home-topbar__aside home-topbar__aside--subpage">
		<div
			class="home-topbar__resources"
			aria-label="Home resources"
			data-flip-id="topbar-resources"
			data-flip-role="resources"
		>
			{#each metrics as metric, index (metric.key)}
				<div class="home-topbar__resource-slot">
					<div class="resource-chip">
						<span>{metric.label}</span>
						<strong>{metric.value}</strong>
					</div>
					{#if index < metrics.length - 1}
						<span class="home-topbar__resource-divider" aria-hidden="true">/</span>
					{/if}
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
