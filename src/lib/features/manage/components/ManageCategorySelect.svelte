<script lang="ts">
	import { page } from '$app/state'
	import {
		blogCategories,
		getBlogCategoryMessageKey,
		type BlogCategory
	} from '$lib/content/blog-categories'
	import { translate } from '$lib/i18n'
	import ManageRecordSelect from './ManageRecordSelect.svelte'

	let {
		value = $bindable(),
		label,
		disabled = false
	}: {
		value: BlogCategory
		label: string
		disabled?: boolean
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const options = $derived(
		blogCategories.map((category) => ({
			value: category,
			label: translate(messages, getBlogCategoryMessageKey(category))
		}))
	)
</script>

<ManageRecordSelect
	{disabled}
	{label}
	{options}
	onchange={(next) => (value = next as BlogCategory)}
	{value}
/>
