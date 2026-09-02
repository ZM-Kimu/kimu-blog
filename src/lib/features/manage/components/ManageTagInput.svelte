<script lang="ts">
	let {
		value = $bindable(),
		available = [],
		label,
		placeholder,
		disabled = false
	}: {
		value: string[]
		available?: string[]
		label: string
		placeholder: string
		disabled?: boolean
	} = $props()

	let draft = $state('')
	let focused = $state(false)
	const normalizedSelected = $derived(new Set(value.map((tag) => tag.toLocaleLowerCase())))
	const suggestions = $derived(
		available.filter(
			(tag) =>
				!normalizedSelected.has(tag.toLocaleLowerCase()) &&
				(!draft.trim() || tag.toLocaleLowerCase().includes(draft.trim().toLocaleLowerCase()))
		)
	)

	function add(tag: string) {
		const name = tag.trim().replace(/\s+/gu, ' ')
		if (!name || normalizedSelected.has(name.toLocaleLowerCase())) return
		value = [...value, name]
		draft = ''
	}

	function remove(tag: string) {
		value = value.filter((item) => item !== tag)
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.key === 'Enter' || event.key === ',') && draft.trim()) {
			event.preventDefault()
			add(draft.replace(/,$/u, ''))
		} else if (event.key === 'Backspace' && !draft && value.length) {
			value = value.slice(0, -1)
		}
	}

	function handleBlur() {
		setTimeout(() => {
			focused = false
		}, 0)
	}
</script>

<div class="manage-tag-input">
	<div class="manage-tag-field">
		{#each value as tag (tag)}
			<span class="manage-tag-chip">
				{tag}
				<button aria-label={`${label}: ${tag}`} {disabled} onclick={() => remove(tag)} type="button"
					>×</button
				>
			</span>
		{/each}
		<input
			aria-label={label}
			bind:value={draft}
			{disabled}
			onblur={handleBlur}
			onfocus={() => (focused = true)}
			onkeydown={handleKeydown}
			{placeholder}
		/>
	</div>
	{#if focused && suggestions.length}
		<div class="manage-tag-suggestions">
			{#each suggestions as tag (tag)}
				<button
					onclick={() => add(tag)}
					onpointerdown={(event) => event.preventDefault()}
					type="button">{tag}</button
				>
			{/each}
		</div>
	{/if}
</div>

<style>
	.manage-tag-input {
		position: relative;
	}

	.manage-tag-field {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
		min-height: 3.15rem;
		padding: 0.42rem 0.6rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 78%);
	}

	.manage-tag-field input {
		flex: 1 1 10rem;
		height: 2.15rem;
		min-width: 8rem;
		padding: 0 0.4rem;
		border: 0;
		background: transparent;
	}

	.manage-tag-chip {
		display: inline-flex;
		gap: 0.3rem;
		align-items: center;
		padding: 0.35rem 0.42rem 0.35rem 0.65rem;
		border-radius: 999px;
		background: rgb(79 120 255 / 10%);
		color: #4169b3;
	}

	.manage-tag-chip button {
		width: 1.45rem;
		height: 1.45rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: rgb(79 120 255 / 10%);
		color: inherit;
	}

	.manage-tag-suggestions {
		position: absolute;
		top: calc(100% + 0.42rem);
		left: 0;
		z-index: 10;
		display: grid;
		width: 100%;
		padding: 0.42rem;
		border: 1px solid var(--line-strong);
		border-radius: 17px;
		background: rgb(248 252 255 / 97%);
		box-shadow: 0 18px 42px rgb(31 92 153 / 18%);
		animation: manage-select-options-enter var(--motion-manage-select-options-enter-duration)
			var(--motion-shared-easing-standard) both;
	}

	.manage-tag-suggestions button {
		padding: 0.7rem 0.75rem;
		border: 0;
		border-radius: 12px;
		background: transparent;
		color: var(--ink);
		font: inherit;
		text-align: left;
	}

	@keyframes manage-select-options-enter {
		from {
			opacity: 0;
		}
	}
</style>
