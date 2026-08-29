<script lang="ts">
	import { resolve } from '$app/paths'

	interface Props {
		href: `/tags/${string}`
		label: string
		active?: boolean
	}

	let { href, label, active = false }: Props = $props()
</script>

<a
	class:tag-chip-selected={active}
	class="tag-chip"
	href={resolve(href)}
	aria-current={active ? 'page' : undefined}>{label}</a
>
