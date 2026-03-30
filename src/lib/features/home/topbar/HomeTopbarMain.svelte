<script lang="ts">
	import { resolve } from '$app/paths'
	import type { HomeTopbarAction, HomeTopbarMetric } from './home-topbar.types'

	let {
		metrics,
		actions,
		authorName,
		profileLevel,
		profileHref,
		motionLocked,
		onAction,
		topbarRoot = $bindable<HTMLElement | null>(null),
		profileChip = $bindable<HTMLAnchorElement | null>(null)
	}: {
		metrics: readonly HomeTopbarMetric[]
		actions: readonly HomeTopbarAction[]
		authorName: string
		profileLevel: string
		profileHref: '/' | '/about'
		motionLocked: boolean
		onAction: (action: HomeTopbarAction) => void
		topbarRoot?: HTMLElement | null
		profileChip?: HTMLAnchorElement | null
	} = $props()
</script>

<header
	class="home-topbar home-topbar-main"
	aria-label="Home top bar main style"
	bind:this={topbarRoot}
>
	<a class="home-profile-chip" href={resolve(profileHref)} bind:this={profileChip}>
		<span class="home-profile-chip-level">Lv.</span>
		<strong>{profileLevel}</strong>
		<div class="home-profile-chip-copy">
			<small>Operator</small>
			<span>{authorName}</span>
		</div>
	</a>

	<div class="home-topbar-aside">
		<div
			class="home-topbar-resources"
			aria-label="Home resources"
			data-flip-id="topbar-resources"
			data-flip-role="resources"
		>
			{#each metrics as metric (metric.key)}
				<div class="resource-chip" role="group" aria-label={metric.ariaLabel}>
					<div class="resource-chip-icon-wrap">
						<span
							class={`home-topbar-icon home-topbar-icon-${metric.icon.mode}`}
							aria-hidden="true"
							style={`--topbar-icon-src: url('${metric.icon.src}');${metric.icon.tint ? ` --topbar-icon-tint: ${metric.icon.tint};` : ''}`}
						></span>
						<span class="resource-chip-hint" aria-hidden="true">{metric.label}</span>
					</div>
					<div class="resource-chip-value">
						<strong aria-hidden="true">{metric.value}</strong>
					</div>
				</div>
			{/each}
		</div>

		<div
			class="home-topbar-tools"
			aria-label="Home top bar actions"
			data-flip-id="topbar-tools"
			data-flip-role="tools"
		>
			{#each actions as action, index (action.key)}
				{#if action.kind === 'link' && action.href}
					<a
						class="home-topbar-tool-button"
						href={resolve(action.href)}
						aria-label={action.ariaLabel}
						aria-disabled={motionLocked || action.disabled ? 'true' : undefined}
						data-motion-locked={motionLocked && !action.disabled ? 'true' : undefined}
						tabindex={motionLocked || action.disabled ? -1 : undefined}
					>
						<span
							class={`home-topbar-icon home-topbar-icon-${action.icon.mode}`}
							aria-hidden="true"
							style={`--topbar-icon-src: url('${action.icon.src}');${action.icon.tint ? ` --topbar-icon-tint: ${action.icon.tint};` : ''}`}
						></span>
					</a>
				{:else}
					<button
						class="home-topbar-tool-button"
						type="button"
						aria-label={action.ariaLabel}
						data-motion-locked={motionLocked && !action.disabled ? 'true' : undefined}
						disabled={motionLocked || action.disabled}
						onclick={() => onAction(action)}
					>
						<span
							class={`home-topbar-icon home-topbar-icon-${action.icon.mode}`}
							aria-hidden="true"
							style={`--topbar-icon-src: url('${action.icon.src}');${action.icon.tint ? ` --topbar-icon-tint: ${action.icon.tint};` : ''}`}
						></span>
					</button>
				{/if}
				{#if index < actions.length - 1}
					<span class="home-topbar-tool-divider" aria-hidden="true">/</span>
				{/if}
			{/each}
		</div>
	</div>
</header>
