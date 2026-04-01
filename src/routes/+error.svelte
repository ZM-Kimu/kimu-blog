<!-- eslint-disable svelte/valid-prop-names-in-kit-pages -->
<script lang="ts">
	import { page } from '$app/state'
	import FallbackErrorPage from '$lib/features/error/FallbackErrorPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'
	import { translate } from '$lib/i18n'

	let { error: propError, status: propStatus } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const status = $derived(page.status || propStatus || 500)
	const rawMessage = $derived(page.error?.message ?? propError?.message ?? '')
	const isNotFound = $derived(status === 404)
	const title = $derived(
		isNotFound
			? translate(messages, 'seo.error.notFoundTitle')
			: translate(messages, 'seo.error.statusTitle', { status })
	)
	const description = $derived(
		isNotFound
			? translate(messages, 'seo.error.notFoundDescription')
			: translate(messages, 'seo.error.statusDescription')
	)
	const message = $derived.by(() => {
		const normalized = rawMessage.trim()

		if (!normalized) {
			return isNotFound
				? translate(messages, 'error.detailNotFound')
				: translate(messages, 'error.detailUnknown')
		}

		if (/^[a-z0-9_:-]+$/iu.test(normalized)) {
			return isNotFound
				? translate(messages, 'error.detailNotFound')
				: translate(messages, 'error.detailFallback')
		}

		return normalized
	})
</script>

<SeoHead
	{title}
	{description}
	pathname={page.url.pathname}
	image="/images/Popup_Image_Arona.png"
	noindex
/>

<FallbackErrorPage {status} {message} />
