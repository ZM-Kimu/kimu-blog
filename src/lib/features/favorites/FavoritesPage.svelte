<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'

	const messages = $derived(page.data.i18n?.messages)
</script>

<section class="panel placeholder-screen">
	<p class="eyebrow">{translate(messages, 'favorites.eyebrow')}</p>
	<h1>{translate(messages, 'favorites.title')}</h1>
	<p>{translate(messages, 'favorites.description')}</p>
</section>
