<script lang="ts">
	import { onMount } from 'svelte'

	import type { MusicPlayerController } from './music-player.svelte'

	let { musicPlayer }: { musicPlayer: MusicPlayerController } = $props()

	onMount(() => musicPlayer.mount())
</script>
