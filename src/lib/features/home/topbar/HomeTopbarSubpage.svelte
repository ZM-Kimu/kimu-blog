<script lang="ts">
	import { resolve } from '$app/paths'
	import type { HomeTopbarAction, HomeTopbarMetric } from './home-topbar.types'

	let {
		metrics,
		actions,
		title,
		motionLocked,
		onBack,
		onAction,
		topbarRoot = $bindable<HTMLElement | null>(null),
		backButton = $bindable<HTMLButtonElement | null>(null),
		backGlyph = $bindable<HTMLSpanElement | null>(null),
		titleWrap = $bindable<HTMLDivElement | null>(null),
		stripShell = $bindable<HTMLDivElement | null>(null)
	}: {
		metrics: readonly HomeTopbarMetric[]
		actions: readonly HomeTopbarAction[]
		title: string
		motionLocked: boolean
		onBack: () => void
		onAction: (action: HomeTopbarAction) => void
		topbarRoot?: HTMLElement | null
		backButton?: HTMLButtonElement | null
		backGlyph?: HTMLSpanElement | null
		titleWrap?: HTMLDivElement | null
		stripShell?: HTMLDivElement | null
	} = $props()
</script>

<header
	class="home-topbar home-topbar--subpage"
	aria-label="Home top bar subpage style"
	bind:this={topbarRoot}
>
	<div class="home-topbar__strip-shell" aria-hidden="true" bind:this={stripShell}></div>

	<div class="home-topbar__lead">
		<button
			class="home-topbar__back"
			type="button"
			aria-label="Go back"
			disabled={motionLocked}
			bind:this={backButton}
			onclick={onBack}
		>
			<span class="home-topbar__back-glyph" aria-hidden="true" bind:this={backGlyph}></span>
		</button>
		<div class="home-topbar__title-wrap" bind:this={titleWrap}>
			<div class="home-topbar__title">{title}</div>
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
					<div class="resource-chip" role="group" aria-label={metric.ariaLabel}>
						<div class="resource-chip__icon-wrap">
							<span
								class={`home-topbar__icon home-topbar__icon--${metric.icon.mode}`}
								aria-hidden="true"
								style={`--topbar-icon-src: url('${metric.icon.src}');${metric.icon.tint ? ` --topbar-icon-tint: ${metric.icon.tint};` : ''}`}
							></span>
							<span class="resource-chip__hint" aria-hidden="true">{metric.label}</span>
						</div>
						<div class="resource-chip__value">
							<strong aria-hidden="true">{metric.value}</strong>
						</div>
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
			{#each actions as action, index (action.key)}
				{#if action.kind === 'link' && action.href}
					<a
						class="home-topbar__tool-button"
						href={resolve(action.href)}
						aria-label={action.ariaLabel}
						aria-disabled={motionLocked || action.disabled ? 'true' : undefined}
						data-motion-locked={motionLocked && !action.disabled ? 'true' : undefined}
						tabindex={motionLocked || action.disabled ? -1 : undefined}
					>
						<span
							class={`home-topbar__icon home-topbar__icon--${action.icon.mode}`}
							aria-hidden="true"
							style={`--topbar-icon-src: url('${action.icon.src}');${action.icon.tint ? ` --topbar-icon-tint: ${action.icon.tint};` : ''}`}
						></span>
					</a>
				{:else}
					<button
						class="home-topbar__tool-button"
						type="button"
						aria-label={action.ariaLabel}
						data-motion-locked={motionLocked && !action.disabled ? 'true' : undefined}
						disabled={motionLocked || action.disabled}
						onclick={() => onAction(action)}
					>
						<span
							class={`home-topbar__icon home-topbar__icon--${action.icon.mode}`}
							aria-hidden="true"
							style={`--topbar-icon-src: url('${action.icon.src}');${action.icon.tint ? ` --topbar-icon-tint: ${action.icon.tint};` : ''}`}
						></span>
					</button>
				{/if}
				{#if index < actions.length - 1}
					<span class="home-topbar__tool-divider" aria-hidden="true">/</span>
				{/if}
			{/each}
		</div>
	</div>
</header>
