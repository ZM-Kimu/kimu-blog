<script lang="ts">
	import '$lib/features/home/styles/index.css'
	import { translate } from '$lib/i18n'
	import HomePage from '$lib/features/home/HomePage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	const messages = $derived(data.i18n?.messages)
</script>

<SeoHead description={translate(messages, 'seo.home.description')} />

<HomePage {data} />
