<script lang="ts">
	import SeoHead from '$lib/components/ui/SeoHead.svelte'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import DebugManageSandbox from '$lib/features/manage/DebugManageSandbox.svelte'
</script>

<SeoHead
	title="Manage Debug"
	description="用于本地调试 manage 视觉、布局和交互状态的单页沙盒。"
	pathname="/__debug/manage"
/>

<SubpageScreen>
	<DebugManageSandbox />
</SubpageScreen>
