<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import FavoritesPage from '$lib/features/favorites/FavoritesPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'
</script>

<SeoHead title="收藏" description="Kimu Blog 的收藏模块占位页。" pathname="/favorites" />

<SubpageScreen>
	<FavoritesPage />
</SubpageScreen>
