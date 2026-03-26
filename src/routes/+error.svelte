<!-- eslint-disable svelte/valid-prop-names-in-kit-pages -->
<script lang="ts">
	import './home/topbar/base.css';
	import './home/topbar/subpage.css';
	import './home/responsive.css';
	import { page } from '$app/state';
	import FallbackErrorPage from '$lib/components/error/FallbackErrorPage.svelte';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';

	let { error: propError, status: propStatus } = $props();
	const status = $derived(page.status || propStatus || 500);
	const message = $derived(page.error?.message ?? propError?.message ?? '发生了未知错误。');
	const isNotFound = $derived(status === 404);
	const title = $derived(isNotFound ? '404 / Not Found' : `错误 ${status}`);
	const description = $derived(
		isNotFound ? '请求的路径不存在。' : '页面发生错误，fallback 页面已接管。'
	);
</script>

<SeoHead
	title={title}
	description={description}
	pathname={page.url.pathname}
	image="/images/Popup_Image_Arona.png"
	noindex
/>

<FallbackErrorPage {status} {message} pathname={page.url.pathname} />
