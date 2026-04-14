<script lang="ts">
	import type { Snippet } from 'svelte'

	import BackgroundStage from '$lib/components/layout/BackgroundStage.svelte'
	import SiteClickEffect from '$lib/components/effects/SiteClickEffect.svelte'
	import DockNav from '$lib/components/layout/DockNav.svelte'
	import Footer from '$lib/components/layout/Footer.svelte'
	import Header from '$lib/components/layout/Header.svelte'
	import PortraitPublicHeader from '$lib/components/layout/PortraitPublicHeader.svelte'
	import PublicTopbarManager from '$lib/components/layout/PublicTopbarManager.svelte'
	import { siteConfig } from '$lib/config/site'

	import type { LocaleMessages } from '$lib/i18n'
	import type { NavigationStateManager } from '$lib/navigation/navigation-state.svelte'
	import type { PageState, RouteState, TopbarShellVariant } from '$lib/navigation/types'

	type SiteBootPhase = 'boot' | 'entry' | 'idle'
	type PublicTopbarManagerHandle = {
		bridgeTo: (targetShellVariant: TopbarShellVariant) => Promise<void>
	}

	let {
		children,
		messages,
		siteBootPhase,
		siteFrameMotionStyle,
		publicLayoutMode,
		prefersReducedMotion,
		pageState,
		routeState,
		navigationManager,
		showBackgroundStage,
		enableSiteClickEffect,
		isLandscapePublicLayout,
		isPortraitPublicLayout,
		showGlobalChrome,
		isBareRoute,
		isPublicScreenRoute,
		isManageRoute,
		isRouteEntering,
		isRouteOutgoing,
		useDesktopHomeExit,
		useDesktopBlogExit,
		desktopHomeEnterActive,
		desktopSubpageEnterActive,
		portraitOrientationToastVisible,
		portraitOrientationToastClosing,
		portraitOrientationHint,
		siteFrame = $bindable<HTMLDivElement | null>(),
		publicTopbarManager = $bindable<PublicTopbarManagerHandle | null>()
	}: {
		children: Snippet
		messages?: LocaleMessages
		siteBootPhase: SiteBootPhase
		siteFrameMotionStyle: string
		publicLayoutMode: 'landscape' | 'portrait'
		prefersReducedMotion: boolean
		pageState: PageState
		routeState: RouteState
		navigationManager: NavigationStateManager
		showBackgroundStage: boolean
		enableSiteClickEffect: boolean
		isLandscapePublicLayout: boolean
		isPortraitPublicLayout: boolean
		showGlobalChrome: boolean
		isBareRoute: boolean
		isPublicScreenRoute: boolean
		isManageRoute: boolean
		isRouteEntering: boolean
		isRouteOutgoing: boolean
		useDesktopHomeExit: boolean
		useDesktopBlogExit: boolean
		desktopHomeEnterActive: boolean
		desktopSubpageEnterActive: boolean
		portraitOrientationToastVisible: boolean
		portraitOrientationToastClosing: boolean
		portraitOrientationHint: string
		siteFrame?: HTMLDivElement | null
		publicTopbarManager?: PublicTopbarManagerHandle | null
	} = $props()
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" type="image/png" />
	<meta name="application-name" content={siteConfig.name} />
</svelte:head>

<div
	class="site-frame"
	data-site-boot-phase={siteBootPhase}
	style={siteFrameMotionStyle}
	bind:this={siteFrame}
>
	{#if showBackgroundStage}
		<BackgroundStage
			scene={navigationManager.backgroundScene}
			pendingScene={navigationManager.pendingBackgroundScene}
			bridgeActive={navigationManager.backgroundBridgeActive}
			layoutMode={publicLayoutMode}
			reducedMotion={prefersReducedMotion}
			bridgeDurationMs={navigationManager.bridgeDurationMs}
			allowWarmup={siteBootPhase === 'idle'}
		/>
	{/if}

	<SiteClickEffect enabled={enableSiteClickEffect} />

	{#if isLandscapePublicLayout}
		<PublicTopbarManager
			host={siteFrame}
			{messages}
			allowWarmup={siteBootPhase === 'idle'}
			portrait={false}
			reducedMotion={prefersReducedMotion}
			bind:this={publicTopbarManager}
		/>
	{/if}

	{#if isPortraitPublicLayout}
		<PortraitPublicHeader {messages} {pageState} />
	{:else if showGlobalChrome}
		<Header {messages} />
	{/if}

	{#if portraitOrientationToastVisible}
		<div
			aria-live="polite"
			class:portrait-orientation-toast-closing={portraitOrientationToastClosing}
			class="portrait-orientation-toast"
			role="status"
		>
			<p>{portraitOrientationHint}</p>
		</div>
	{/if}

	<main
		class:site-main-bare={isBareRoute}
		class:site-main-home={routeState.kind === 'home'}
		class:site-main-public-portrait={isPortraitPublicLayout}
		class="site-main"
	>
		{#if isPublicScreenRoute}
			<div
				class:screen-route-layer-entry={isRouteEntering}
				class:screen-route-layer-exit={isRouteOutgoing &&
					!useDesktopHomeExit &&
					!useDesktopBlogExit}
				class:screen-route-layer-home-enter-desktop={desktopHomeEnterActive}
				class:screen-route-layer-home-exit-desktop={useDesktopHomeExit}
				class:screen-route-layer-blog-exit-desktop={useDesktopBlogExit}
				class:screen-route-layer-subpage-enter-desktop={desktopSubpageEnterActive}
				class="screen-route-layer"
			>
				{@render children()}
			</div>
		{:else if isManageRoute}
			<div
				class:site-bare-content-entry={isRouteEntering}
				class:site-bare-content-exit={isRouteOutgoing}
				class="site-bare-content"
			>
				{@render children()}
			</div>
		{:else}
			<div
				class:site-main-inner-entry={isRouteEntering}
				class:site-main-inner-exit={isRouteOutgoing}
				class="shell site-main-inner"
			>
				{@render children()}
			</div>
		{/if}
	</main>

	{#if !isPortraitPublicLayout && showGlobalChrome}
		<DockNav {messages} />
		<Footer {messages} />
	{/if}
</div>
