<script lang="ts">
	import type { ManagedPostFormat } from '$lib/features/manage/types'
	import ManageRecordSelect from './ManageRecordSelect.svelte'

	let {
		value = $bindable(),
		label,
		disabled = false
	}: {
		value: ManagedPostFormat
		label: string
		disabled?: boolean
	} = $props()

	const options = [
		{ value: 'svx', label: 'svx' },
		{ value: 'md', label: 'md' }
	] as const
</script>

<ManageRecordSelect
	{disabled}
	{label}
	{options}
	onchange={(next) => (value = next as ManagedPostFormat)}
	{value}
/>
