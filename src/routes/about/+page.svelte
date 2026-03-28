<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import AboutPage from '$lib/features/about/AboutPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'
</script>

<SeoHead title="关于项目" description="Kimu Blog 当前脚手架与开发方向说明。" pathname="/about" />

<SubpageScreen>
	<AboutPage />
</SubpageScreen>
