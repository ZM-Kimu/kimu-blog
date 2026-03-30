<script lang="ts">
	import { resolve } from '$app/paths'

	interface Props {
		href: `/tags/${string}`
		label: string
	}

	let { href, label }: Props = $props()
</script>

<a class="tag-chip" href={resolve(href)}>{label}</a>
