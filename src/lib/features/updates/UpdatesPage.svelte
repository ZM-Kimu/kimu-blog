<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'

	const messages = $derived(page.data.i18n?.messages)
</script>

<section class="panel placeholder-screen">
	<p class="eyebrow">{translate(messages, 'updates.eyebrow')}</p>
	<h1>{translate(messages, 'updates.title')}</h1>
	<p>{translate(messages, 'updates.description')}</p>
</section>
