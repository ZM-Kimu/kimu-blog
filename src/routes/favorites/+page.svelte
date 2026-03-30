<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import FavoritesPage from '$lib/features/favorites/FavoritesPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	const messages = $derived(page.data.i18n?.messages)
</script>

<SeoHead
	title={translate(messages, 'seo.favorites.title')}
	description={translate(messages, 'seo.favorites.description')}
	pathname="/favorites"
/>

<SubpageScreen>
	<FavoritesPage />
</SubpageScreen>
